# Procurement plugin documentation

Документация плагина procurement для KORUS AI / NEO.

> Это **эталон** того, как должна выглядеть плагин-документация. Структуру можно тиражировать на остальные плагины при их рефакторинге.

## Структура

| Файл / папка | О чём |
|---|---|
| [`backlog/`](./backlog/) | Активные задачи плагина |
| [`service_overview.md`](./service_overview.md) | Архитектура: layer-диаграмма, entry points, ключевые компоненты |
| [`module_map.md`](./module_map.md) | Directory guide: где что лежит в Java + Frontend |
| [`integration_contracts.md`](./integration_contracts.md) | Контракты с host'ом и внешними системами — что нельзя менять без переговоров |
| [`manual_smoke_checklist.md`](./manual_smoke_checklist.md) | Чек-лист ручного смок-теста после deploy |
| [`supplier_search_cancellation_plan.md`](./supplier_search_cancellation_plan.md) | План отдельной фичи (deprecation supplier search) |
| [`db_schema.md`](./db_schema.md) | Схема плагин-таблиц `procurement.*` (auto-generated) |

## API spec

- **Live:** Swagger UI в host'е — http://localhost:5000/swagger-ui/ (при запущенных core + плагине)
- **Machine-readable:** `core-openapi.json` в host'е включает procurement endpoint'ы

## Контракт плагина

Гайд по написанию / поддержке плагина — в core: [plugin-author-guide.md](../../project-neo-be-release-4/__documentation/plugin-author-guide.md).

## Cross-repo задачи

Backlog cards which touch core или другие плагины — живут в core: [../../project-neo-be-release-4/__documentation/backlog/](../../project-neo-be-release-4/__documentation/backlog/).

В частности, `procurement-n8n-helper-removal` (этот файл здесь в [backlog/tech-debt/](./backlog/tech-debt/)) связан с [workflows-cleanup-with-n8n-temporal](../../project-neo-be-release-4/__documentation/backlog/tech-debt/workflows-cleanup-with-n8n-temporal.md) в core.
