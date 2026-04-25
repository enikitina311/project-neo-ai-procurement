# План: полноценная отмена поиска поставщиков до `n8n`

Документ фиксирует технический план для сценария, где пользователь может:

- запустить поиск поставщиков по лоту;
- видеть, что поиск действительно выполняется;
- отменить поиск из UI;
- гарантированно остановить не только frontend-запрос, но и уже запущенное выполнение в `backend` и `n8n`.

## 1. Что происходит сейчас

На **15 апреля 2026** картина такая:

- frontend запускает поиск через `korus_ai_procurement__supplier_search`;
- backend синхронно вызывает `n8n` webhook `/webhook/procurement/web-price`;
- `n8n` выполняет весь сценарий и только в конце отдает ответ;
- у поиска нет собственного `run id`, статуса и cancel-контракта;
- уже стартовавшее выполнение в `n8n` нельзя остановить из procurement UI.

Дополнительно был найден frontend-баг:

- поиск в модалке перезапускался повторно из-за `useEffect` + нестабильного callback;
- это уже исправлено на frontend, но это решает только повторный старт, а не полноценную отмену в `n8n`.

## 2. Корневая проблема

Сейчас procurement-поиск реализован как **синхронный request/response**:

`frontend` -> `WORKSPACES.EXECUTE` -> `SupplierSearch` -> `ProcurementSupplierSearchWorkflow` -> `N8nService.post("/webhook/procurement/web-price")`

Из этого следуют ограничения:

- frontend не знает идентификатор выполнения поиска;
- backend не знает `execution id` конкретного запуска в `n8n`;
- `n8n` не получает отдельного сигнала отмены;
- закрытие модалки или abort HTTP-запроса не гарантируют остановку уже идущего workflow.

## 3. Целевое поведение

После внедрения новой схемы поиск должен работать так:

1. frontend открывает модалку поиска;
2. backend создает запись запуска поиска и возвращает `searchRunId`;
3. backend инициирует поиск в `n8n` и сохраняет связанный `n8nExecutionId`;
4. frontend не держит долгий blocking-запрос, а опрашивает статус поиска;
5. при отмене frontend вызывает отдельный cancel endpoint/function;
6. backend помечает поиск как `cancel_requested`, отправляет stop/cancel в `n8n`;
7. `n8n` завершает выполнение и backend переводит поиск в `cancelled`;
8. UI перестает показывать loader и очищает результаты текущего запуска.

## 4. Что нужно поменять

### 4.1. Backend: ввести сущность запуска поиска

Нужна отдельная persistent-сущность, например:

- таблица `procurement__supplier_search_runs`

Минимальные поля:

- `id`
- `package_id`
- `created_by`
- `status`
- `request_payload_json`
- `result_raw`
- `result_parsed_json`
- `error_text`
- `n8n_execution_id`
- `cancel_requested`
- `started_at`
- `finished_at`
- `created_at`
- `updated_at`

Возможные значения `status`:

- `created`
- `running`
- `completed`
- `failed`
- `cancel_requested`
- `cancelled`

Почему без таблицы будет плохо:

- статус потеряется при перезагрузке страницы;
- backend не сможет корректно отвечать на polling;
- cancel не к чему будет привязать;
- нельзя будет разрулить “старый поиск уже завершился, а пользователь смотрит новый”.

### 4.2. Backend: развести start / status / cancel

Существующий синхронный `korus_ai_procurement__supplier_search` лучше не ломать сразу. Для rollout безопаснее добавить новый набор внутренних runtime-функций:

- `korus_ai_procurement__supplier_search_start`
- `korus_ai_procurement__supplier_search_status`
- `korus_ai_procurement__supplier_search_cancel`

Контракты:

#### `korus_ai_procurement__supplier_search_start`

args:

- `package_id`
- `query?`

response:

```json
{
  "searchRunId": "uuid",
  "status": "running"
}
```

#### `korus_ai_procurement__supplier_search_status`

args:

- `search_run_id`

response:

```json
{
  "searchRunId": "uuid",
  "status": "running|completed|failed|cancel_requested|cancelled",
  "raw": "...",
  "parsed": { "suppliers": [] },
  "error": null
}
```

#### `korus_ai_procurement__supplier_search_cancel`

args:

- `search_run_id`

response:

```json
{
  "searchRunId": "uuid",
  "status": "cancel_requested"
}
```

После стабилизации frontend можно перевести полностью на новый async-flow.

### 4.3. Backend: вынести поиск в async orchestration

`ProcurementSupplierSearchWorkflow` сейчас синхронный. Его нужно разделить на:

- `startSearch(...)`
- `getSearchStatus(...)`
- `cancelSearch(...)`
- фоновое выполнение поиска

Технически есть два пути.

#### Вариант A. Backend-очередь + worker

Сценарий:

- `startSearch()` создает запись поиска;
- кладет задачу в backend queue;
- worker берет задачу и вызывает `n8n`;
- результаты пишет обратно в `procurement__supplier_search_runs`.

Плюсы:

- ближе к уже существующим async-паттернам в `meetings`;
- проще контролировать статус поиска из backend;
- проще добавить retry и timeout policy.

Минусы:

- все равно нужен способ отмены уже идущего `n8n`.

#### Вариант B. Прямой async start в `n8n`

Сценарий:

- backend инициирует execution в `n8n` не blocking webhook’ом, а через API запуска;
- получает `n8nExecutionId`;
- сохраняет его;
- дальше или poll’ит `n8n`, или получает callback.

Плюсы:

- отмена естественно привязывается к `n8nExecutionId`;
- меньше “двойной orchestration”.

Минусы:

- потребуется API-доступ к `n8n`, а не только webhook;
- текущая интеграция procurement завязана именно на webhook path.

**Рекомендация:** идти через **гибрид**:

- в backend завести `searchRun`;
- внутри `searchRun` сохранять и backend-статус, и `n8nExecutionId`;
- сам поиск переводить на API-инициируемый execution, если текущая версия `n8n` и auth это позволяют.

### 4.4. n8n: нужен cancelable workflow

Для реальной отмены `n8n` должен работать не как “черный ящик с длинным webhook-ответом”, а как execution, у которого есть жизненный цикл.

Нужно обеспечить:

- получение `searchRunId` в payload;
- возможность извлечь `n8nExecutionId`;
- возможность остановить execution по API;
- корректную обработку отмены внутри самого workflow.

Лучший вариант:

- использовать `n8n` execution API для запуска и остановки execution.

Fallback-вариант, если stop execution недоступен или нестабилен:

- внедрить **кооперативную отмену**:
  - backend по cancel помечает run как `cancel_requested`;
  - `n8n` между шагами поиска проверяет статус через backend endpoint;
  - если `cancel_requested == true`, workflow сам завершает работу без записи результата.

Это особенно важно, если поиск внутри `n8n` идет батчами по нескольким номенклатурным позициям или по нескольким поисковым источникам.

### 4.5. Frontend: перейти с blocking-request на polling

UI-модель должна измениться так:

- на открытии модалки вызывать `supplier_search_start`;
- сохранять `searchRunId` локально;
- запускать polling `supplier_search_status` раз в 2-3 секунды;
- при `completed` показать результаты;
- при `failed` показать ошибку;
- при `cancelled` закрыть loader и очистить результаты;
- при закрытии модалки или нажатии `Отмена` вызывать `supplier_search_cancel`.

Обязательные guard’ы:

- не стартовать новый поиск, если текущий `searchRunId` еще `running`;
- при повторном открытии модалки всегда создавать новый `searchRunId`, а не доиспользовать старый;
- при размонтировании компонента делать cancel только для собственного активного `searchRunId`.

## 5. Что нужно подготовить в n8n

На сегодня видно следующее:

- `n8n` поднят отдельно в `/home/ENikitina/apps/n8n`;
- текущая procurement-интеграция идет через webhook `/webhook/procurement/web-price`;
- прямой запрос к `https://n8n.en-projects.ru/api/v1/workflows` без auth возвращает `401`.

Это значит, что для реализации полноценного cancel-flow нужен отдельный подготовительный шаг:

- определить способ авторизации backend в `n8n API`;
- проверить, какие endpoints доступны в текущей версии `n8n`;
- подтвердить, можно ли штатно останавливать execution по `execution id`.

Без этого cancel в `n8n` останется только “кооперативным”, а не принудительным.

## 6. Предлагаемая последовательность внедрения

### Шаг 1. Stabilize frontend и убрать бесконечные рестарты

Уже сделано:

- убран повторный автозапуск поиска;
- добавлен `AbortController` во frontend;
- `Отмена` в модалке теперь сбрасывает локальный поиск и abort’ит HTTP-запрос.

### Шаг 2. Добавить backend-модель `searchRun`

Сделать:

- Liquibase migration для `procurement__supplier_search_runs`;
- service/repository для работы с поисковыми запусками;
- enum статусов.

### Шаг 3. Добавить новые runtime-функции start/status/cancel

Сделать:

- `supplier_search_start`
- `supplier_search_status`
- `supplier_search_cancel`

Старый `supplier_search` пока оставить, чтобы не ломать текущие интеграции одним проходом.

### Шаг 4. Перевести frontend на polling

Сделать:

- новый API слой в `project-neo-fe-dev/src/services/procurement/api.ts`;
- локальный state `searchRunId`;
- polling статуса;
- cancel по закрытию модалки.

### Шаг 5. Пробросить cancel в `n8n`

Сделать:

- auth backend -> `n8n API`;
- запуск поиска как управляемого execution;
- сохранение `n8nExecutionId`;
- stop execution или кооперативная отмена.

### Шаг 6. Очистить старый sync-flow

После стабилизации:

- либо задепрекейтить старый `korus_ai_procurement__supplier_search`,
- либо оставить его только как internal compatibility endpoint.

## 7. Риски

### 7.1. Cancel дошел до frontend, но не дошел до `n8n`

Это самый вероятный промежуточный сценарий.

Следствие:

- UI показывает “отменено”;
- `n8n` еще работает;
- backend потом может получить поздний результат от уже неактуального поиска.

Нужно правило:

- если run уже `cancel_requested` или `cancelled`, backend не должен принимать и публиковать его результат как актуальный.

### 7.2. Поздний результат старого поиска затирает новый

Решение:

- все результаты всегда привязывать к `searchRunId`;
- frontend отображает только активный run;
- backend не обновляет “текущий экран”, он только сохраняет run result.

### 7.3. `n8n` stop execution окажется недоступным

Решение:

- иметь fallback на кооперативную отмену через промежуточные проверки статуса.

### 7.4. Длинные поиски будут копиться в БД

Решение:

- retention policy, например удаление или архивирование completed/cancelled runs старше 30 дней.

## 8. Что считать готовностью

Фича считается сделанной, когда выполняются все условия:

- поиск стартует один раз на одно открытие модалки;
- пользователь видит явный статус `running`;
- `Отмена` в UI останавливает polling;
- backend фиксирует `cancel_requested` и затем `cancelled`;
- `n8n` execution реально останавливается или корректно завершает себя после cancel check;
- старые результаты не всплывают в новом поиске;
- ручной smoke подтверждает, что один пользователь не может случайно запустить 3-4 одинаковых поиска подряд.

## 9. Практическая рекомендация

Если делать это одним проходом, самый надежный путь такой:

1. backend `searchRun` + start/status/cancel;
2. frontend polling-модель;
3. только потом перевод procurement search на управляемый execution в `n8n`.

Такой порядок уменьшает риск, потому что:

- сначала появится нормальная модель жизненного цикла поиска;
- потом уже можно безопасно встраивать настоящую отмену в `n8n`;
- и даже если интеграция с `n8n API` задержится, UI и backend уже не будут жить в старом blocking-режиме.
