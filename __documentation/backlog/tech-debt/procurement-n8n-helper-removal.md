---
title: Удалить ProcurementN8nHelper при миграции procurement n8n→Temporal
status: open
scope: procurement
theme: tech-debt
created: 2026-04-XX
---

# Удалить ProcurementN8nHelper

## Что есть

В `project-neo-be-procurement/src/test` 4 пред-существующих failing-теста в `ProcurementN8nHelperTest` — `NoClassDefFoundError` на `StringExtensions` / `XmlMapper` (плагин компилируется, но эти тесты падают в surefire). Замечены в Phase 2.4 при добавлении ArchUnit.

## Почему НЕ чинить сейчас

n8n как платформа оркестрации в NEO планируется заменить на Temporal — meetings-плагин уже частично перенесён (см. memory `project_neo_meetings`: Phase 4 и 6).

Когда procurement-плагин аналогично переедет на Temporal-workflows, `ProcurementN8nHelper` и эти тесты удаляются вместе с n8n integration. Тратить время на их починку — выкинутая работа.

## Что делать когда время придёт

При старте миграции procurement n8n → Temporal:

1. Удалить `ProcurementN8nHelper*` целиком.
2. Тесты уйдут вместе с классом.
3. Заменить N8N webhook calls на Temporal activity invocations.
4. Удалить core-side `WorkflowService` зависимости (см. core backlog [workflows-cleanup-with-n8n-temporal.md](../../../../project-neo-be-release-4/__documentation/backlog/tech-debt/workflows-cleanup-with-n8n-temporal.md)).

## Связано

- core: [workflows-cleanup-with-n8n-temporal.md](../../../../project-neo-be-release-4/__documentation/backlog/tech-debt/workflows-cleanup-with-n8n-temporal.md)
- meetings: уже частично мигрировал (Phase 4, 6)

## Критерий готовности

- `ProcurementN8nHelper` класс + его тесты удалены.
- procurement workflows работают на Temporal.
- 0 импортов `core.WorkflowService` в procurement.
