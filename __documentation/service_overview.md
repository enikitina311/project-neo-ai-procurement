# Ассистент закупок: текущее устройство сервиса

Этот документ нужен как рабочая памятка для продолжения разработки сервиса без повторного исследования проекта с нуля.

## 1. Что это за сервис

Сервис `Ассистент закупок` встроен в `NEO` как отдельный PF4J-плагин:

- backend plugin: `/home/ENikitina/apps/NEO/project-neo-be-procurement`
- frontend page: `project-neo-be-procurement/frontend/src/pages`

Основная сущность сервиса: `Пакет закупки`.

Пакет закупки хранит:

- название пакета
- критерии КП
- порог покрытия поставщиками
- лимит поставщиков на позицию
- номенклатурные позиции
- найденных и выбранных поставщиков
- письма поставщикам
- загруженные КП
- результаты анализа КП
- результат расчета НМЦ

## 2. Как устроен модуль сейчас

### 2.1. Общий runtime-поток

Основной путь вызова выглядит так:

`frontend page` -> `src/services/procurement/api.ts` -> `WORKSPACES.EXECUTE` -> `components/functions/*` -> `services/workflows/*` или `services/*` -> Postgres / file storage / OCR / n8n

### 2.2. Backend-слои

Текущий backend делится на такие уровни:

- `components/functions/*` — публичные `DataFunction`-контракты для `korus_ai_procurement__*`
- `services/workflows/*` — orchestration-логика для сценариев с `n8n`, OCR и агрегацией нескольких сервисов
- `services/support/*` — helper-слой для `ComponentArgs` и нестабильных ответов `n8n`
- `services/*` — CRUD и data-access по доменным сущностям
- `src/main/resources/config/procurement/database/procurement_001_schema.xml` — Liquibase-схема таблиц модуля

Важно: после рефакторинга сложная orchestration-логика больше не живет в `DataFunction`-классах.

### 2.3. Frontend-слои

Текущий frontend procurement-модуля делится на:

- `ui/ProcurementPage.tsx` — список пакетов и read-only просмотр
- `ui/ProcurementPackagePage.tsx` — route-container карточки пакета
- `ui/components/*` — табы и sidebar
- `hooks/*` — orchestration и загрузка данных
- `lib/*` — shared util-логика по procurement
- `src/services/procurement/api.ts` — типы и API-вызовы procurement-сценариев

## 3. Как это выглядит во фронтенде

Основные экраны:

- список пакетов: `src/pages/procurement/ui/ProcurementPage.tsx`
- карточка пакета: `src/pages/procurement/ui/ProcurementPackagePage.tsx`
- компоненты карточки: `src/pages/procurement/ui/components/*`
- hooks: `src/pages/procurement/hooks/*`
- стили: `src/pages/procurement/ui/ProcurementPage.css`

### 3.1. Экран списка пакетов

Поведение:

- слева список пакетов
- справа read-only вкладки по выбранному пакету
- кнопка `Добавить пакет` открывает карточку нового пакета
- ошибки загрузки списка и данных пакета показываются через toast и `EmptyState`

### 3.2. Экран карточки пакета

Слева:

- название
- критерии КП
- порог покрытия, %
- лимит поставщиков на позицию, шт.

Справа табы:

- `Номенклатура`
- `Поставщики`
- `Письма`
- `Коммерческие предложения`
- `НМЦ`

## 4. Что уже реализовано на фронтенде

### 4.1. Номенклатура

На табе `Номенклатура`:

- позиции можно добавлять прямо в таблице
- требования редактируются как многострочное поле
- строки автоматически сохраняются
- есть колонка с порядковым номером
- удаление сделано через иконку корзины
- ошибки create/update/delete показываются через toast

### 4.2. Поставщики

На табе `Поставщики`:

- поиск запускается по кнопке `Найти поставщиков по пакету`
- во время поиска показывается loader
- повторный запуск во время текущего поиска блокируется
- результаты поиска фильтруются по `coverageThreshold`
- поставщики выбираются стандартным `Checkbox`
- перенос в список поставщиков пакета делается кнопкой `Перенести`
- ошибки поиска, выбора и переноса показываются через toast

Показываемые поля:

- название поставщика
- сайт
- email
- покрытие
- найденные позиции у поставщика

### 4.3. Письма

На табе `Письма`:

- поле `Шаблон письма` удалено из UI и больше не используется
- есть кнопка `Сформировать письма`
- во время генерации кнопка блокируется и показывается loader
- текущий список писем на фронте не очищается заранее, а заменяется результатом успешной генерации
- ошибки генерации показываются через toast

Важно:

- backend генерирует письма по выбранным поставщикам
- если выбранных поставщиков нет, backend fallback-ится на всех поставщиков пакета
- перед новой генерацией старые письма в БД удаляются и создаются заново

### 4.4. КП и НМЦ

На табах `Коммерческие предложения` и `НМЦ`:

- загрузка КП идет отдельным upload-запросом в file storage, затем отдельной регистрацией документа в procurement
- upload/analyze/generate кнопки имеют loading-state и блокировки
- ошибки загрузки КП, анализа КП, загрузки сохраненного анализа и генерации НМЦ показываются через toast
- при изменении списка КП фронт автоматически подгружает последний сохраненный анализ

## 5. Как устроен backend-плагин

### 5.1. Публичные функции

Основные backend-функции лежат в:

`src/main/java/ru/korusconsulting/projectneo/modules/ai/procurement/components/functions`

Группы функций:

- `packages/*`
- `items/*`
- `suppliers/*`
- `letters/*`
- `kp/*`
- `nmc/*`

### 5.2. Workflow-слой

Сложные сценарии вынесены в:

- `services/workflows/ProcurementSupplierSearchWorkflow.java`
- `services/workflows/ProcurementLettersWorkflow.java`
- `services/workflows/ProcurementKpAnalysisWorkflow.java`
- `services/workflows/ProcurementNmcWorkflow.java`

### 5.3. Support-слой

Ключевые внутренние helper-ы:

- `services/support/ProcurementFunctionArgs.java` — чтение и типизация `ComponentArgs`
- `services/support/ProcurementN8nHelper.java` — безопасный вызов webhook, извлечение `output`, sanitize и JSON parsing

## 6. База данных сервиса

Сервис использует core Postgres `projectneo`.

У модуля нет отдельного PostgreSQL schema namespace, но есть собственные таблицы:

- `procurement.packages`
- `procurement.items`
- `procurement.suppliers`
- `procurement.letters`
- `procurement.kp_documents`
- `procurement.kp_analysis`
- `procurement.nmc_results`

Подробная схема лежит в:

- `__documentation/db_schema.md`

### 6.1. Важные поля пакета

В пакете сейчас используются:

- `name`
- `criteria_text`
- `coverage_threshold`
- `suppliers_limit`

Из старых полей не используются:

- `typology`
- `direction`
- `status`

### 6.2. Важные поля поставщика

В таблице `procurement.suppliers` особенно важны:

- `selected`
- `coverage_count`
- `coverage_ratio`
- `matched_items_json`
- `origin`

`matched_items_json` хранится как JSONB и на фронте часто приходит/уходит как сериализованная строка.

### 6.3. Письма

В таблице `procurement.letters` нет поля `template`.

Это важно: шаблон письма не хранится в БД, а логика текста задается в `n8n`.

## 7. Как сервис связан с n8n

Используются procurement-webhook’и:

- `/webhook/procurement/web-price`
- `/webhook/procurement/generate-letters`
- `/webhook/procurement/analyze-kp`
- `/webhook/procurement/nmc`

`ProcurementN8nHelper` умеет:

- вытаскивать `output` из ответа `n8n`
- парсить fenced JSON и текстовые JSON-строки
- нормализовывать поля вроде `suppliers`, если они пришли строкой

Это важно, потому что ответы `n8n`/LLM не всегда приходят в идеально чистом JSON-формате.

## 8. Что важно помнить при доработках

### 8.1. Публичные контракты лучше не менять

Без отдельной миграции не стоит менять:

- имена `korus_ai_procurement__*`
- порядок аргументов в `ComponentArgs`
- shape payload для frontend `WORKSPACES.EXECUTE`
- webhook paths `/webhook/procurement/*`
- Liquibase-структуру таблиц `procurement__*`

### 8.2. По письмам

Если письма “пропали” или “дублируются”, первым делом проверять:

- очищаются ли старые записи в `procurement.letters`
- смог ли backend сматчить draft из `n8n` на реального поставщика
- не вернул ли `n8n` несколько draft-ов на одного поставщика

### 8.3. По КП

Если анализ КП не работает, первым делом проверять:

- существует ли `procurement.kp_documents` запись
- доступен ли `file_id` в file storage
- не упал ли OCR
- что реально вернул `/webhook/procurement/analyze-kp`

### 8.4. По НМЦ

Если НМЦ пустая или “странная”, первым делом проверять:

- есть ли анализы для загруженных КП
- заполнен ли `extracted_items_json`
- не потерялся ли supplier mapping между `kp_documents` и `suppliers`

## 9. Что сейчас уже работает

Рабочие сценарии:

- создание пакета
- редактирование пакета
- добавление, редактирование и удаление номенклатуры
- поиск поставщиков
- выбор поставщиков из результатов поиска
- перенос выбранных поставщиков в список поставщиков пакета
- генерация писем по выбранным поставщикам
- загрузка КП
- анализ КП
- повторная загрузка последнего сохраненного анализа
- генерация НМЦ

Отдельной шлифовки все еще могут требовать:

- реальное качество ответов `n8n`
- устойчивость OCR на сложных PDF/сканах
- пользовательские тексты и UX-мелочи

## 10. Если продолжать работу в новом чате

Для быстрого старта полезно сразу открыть:

- backend plugin:
  - `/home/ENikitina/apps/NEO/project-neo-be-procurement`
- frontend procurement:
  - `src/pages/procurement/ui/ProcurementPackagePage.tsx`
  - `src/pages/procurement/hooks/useProcurementPackageData.ts`
  - `src/pages/procurement/hooks/useProcurementSuppliers.ts`
  - `src/pages/procurement/hooks/useProcurementDocuments.ts`
  - `src/pages/procurement/ui/components/*`
- документы:
  - `__documentation/module_map.md`
  - `__documentation/integration_contracts.md`
  - `__documentation/db_schema.md`

Если задача связана с конкретным сценарием, смотреть в первую очередь:

- поиск поставщиков:
  - `ProcurementSupplierSearchWorkflow.java`
  - `SupplierSearch.java`
- письма:
  - `ProcurementLettersWorkflow.java`
  - `LettersGenerate.java`
- КП:
  - `ProcurementKpAnalysisWorkflow.java`
  - `KpUpload.java`
  - `KpAnalyze.java`
- НМЦ:
  - `ProcurementNmcWorkflow.java`
  - `NmcGenerate.java`
