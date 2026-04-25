# PROJECT-NEO-AI-PROCUREMENT Version: 0.1.0 by Korus Consulting

> Сервис закупок и анализа коммерческих предложений на базе ИИ для Project Neo

## Содержание

- [Документация модуля](#документация-модуля)
- [API](#api)
- [Сборка и развертывание](#сборка-и-развертывание)
- [Примечания](#примечания)

## Документация модуля

| Раздел | Описание | Документ |
|--------|----------|----------|
| Обзор сервиса | Архитектура, основные сценарии и интеграции | [service_overview.md](./__documentation/service_overview.md) |
| Карта модуля | Куда смотреть в backend/frontend по основным сценариям | [module_map.md](./__documentation/module_map.md) |
| Контракты интеграций | DataFunction, payload, n8n webhook и инварианты | [integration_contracts.md](./__documentation/integration_contracts.md) |
| Схема данных | Таблицы и структура хранения procurement-модуля | [db_schema.md](./__documentation/db_schema.md) |
| Smoke checklist | Ручные проверки после изменений backend/frontend | [manual_smoke_checklist.md](./__documentation/manual_smoke_checklist.md) |

## API

Сервис собирается как PF4J plugin и публикует свои маршруты через общий OpenAPI backend-приложения после загрузки plugin в backend.

Отдельных `RestController` в этом репозитории не обнаружено, поэтому детальные спецификации API по контроллерам не генерируются.

Основные runtime-контракты для procurement-сценариев описаны в [integration_contracts.md](./__documentation/integration_contracts.md).

## Сборка и развертывание

### Установка зависимостей

Проект использует Maven для Java-зависимостей и npm для вспомогательных скриптов.

```bash
npm install
```

### Сборка plugin

Этот сервис собирается как отдельный PF4J plugin и требует опубликованный артефакт `core` из основного backend-проекта.

```bash
cd ../project-neo-be-release-4
mvn -pl core -am install -DskipTests

cd ../project-neo-be-procurement
npm run build:plugin
```

После сборки plugin-jar появляется в `target/` и затем публикуется в volume основного backend-контейнера `/app/plugins`.

### Полезные команды

```bash
npm run build
npm run build:plugin
npm run docs:readme
npm run docs:validate-api-docs
npm run docs:dbschema
npm run clean
```

### Runtime-контракт

- сервис не подключается через `project-neo-be-release-4/modules`;
- jar доставляется во внешний plugins staging каталог backend;
- backend загружает plugin только из `/app/plugins`;
- новая версия подхватывается после recreate/restart backend-контейнера.

## Примечания

- Этот README сгенерирован автоматически с помощью `__tools/generate-readme.js`
- Для обновления документации запустите: `npm run docs:readme`
