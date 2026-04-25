# Интеграционные контракты procurement-модуля

Документ фиксирует то, что нежелательно менять без отдельной миграции или согласованного прохода по frontend/backend/n8n.

## 1. Внешний frontend -> backend контракт

Все вызовы procurement-модуля идут через `WORKSPACES.EXECUTE`.

Payload:

```ts
type ExecutePayload = {
  functionName: string;
  values: (string | number | boolean | null)[] | object[];
  projectId: string;
  serviceId: string;
};
```

Источник:

- `project-neo-fe-dev/src/services/procurement/api.ts`
- `project-neo-fe-dev/src/pages/procurement/lib/execute.ts`

## 2. Публичные DataFunction-контракты

### 2.1. Packages

- `korus_ai_procurement__package_create`
  - args: `project_id`, `name`, `criteria_text?`, `coverage_threshold?`, `suppliers_limit?`
- `korus_ai_procurement__package_list`
  - args: `project_id`
- `korus_ai_procurement__package_get`
  - args: `package_id`
- `korus_ai_procurement__package_update`
  - args: `id`, `project_id`, `name`, `criteria_text?`, `coverage_threshold?`, `suppliers_limit?`

### 2.2. Items

- `korus_ai_procurement__items_create`
  - args: `package_id`, `name`, `specs?`, `qty?`, `unit?`
- `korus_ai_procurement__items_update`
  - args: `id`, `package_id`, `name`, `specs?`, `qty?`, `unit?`
- `korus_ai_procurement__items_delete`
  - args: `id`
- `korus_ai_procurement__items_list`
  - args: `package_id`

### 2.3. Suppliers

- `korus_ai_procurement__supplier_search`
  - args:
    - пакетный режим: `package_id`, `query?`
    - item-режим: `item_name`
- `korus_ai_procurement__supplier_list`
  - args: `package_id`
- `korus_ai_procurement__supplier_select`
  - args: `supplier_id`, `selected`
- `korus_ai_procurement__supplier_add_manual`
  - args:
    - `package_id`
    - `name`
    - `url?`
    - `email?`
    - `price?`
    - `unit?`
    - `note?`
    - `selected?`
    - `coverage_count?`
    - `coverage_ratio?`
    - `matched_items_json?`
    - `origin?`

### 2.4. Letters

- `korus_ai_procurement__letters_generate`
  - args: `package_id`
- `korus_ai_procurement__letters_list`
  - args: `package_id`

### 2.5. KP

- `korus_ai_procurement__kp_upload`
  - args: `package_id`, `supplier_id`, `file_id`
- `korus_ai_procurement__kp_documents_list`
  - args: `package_id`
- `korus_ai_procurement__kp_analyze`
  - args: `kp_document_id`, `criteria_text?`
- `korus_ai_procurement__kp_analysis_get`
  - args: `kp_document_id`

### 2.6. NMC

- `korus_ai_procurement__nmc_generate`
  - args: `package_id`
- `korus_ai_procurement__nmc_get`
  - args: `package_id`

## 3. Внутренние backend -> n8n контракты

### 3.1. Search suppliers

- webhook: `/webhook/procurement/web-price`
- caller: `ProcurementSupplierSearchWorkflow`

Payload в пакетном режиме:

```json
{
  "packageId": "uuid",
  "coverageThreshold": 0.7,
  "suppliersLimit": 10,
  "query": "optional text",
  "items": [
    { "name": "..." }
  ]
}
```

Ожидаемый результат:

- `output` с JSON или JSON-like текстом
- после normalize ожидается поле `suppliers`

### 3.2. Generate letters

- webhook: `/webhook/procurement/generate-letters`
- caller: `ProcurementLettersWorkflow`

Payload:

```json
{
  "package": { "...": "..." },
  "items": [{ "...": "..." }],
  "suppliers": [{ "...": "..." }]
}
```

Ожидаемый результат:

```json
{
  "drafts": [
    {
      "supplierId": "uuid",
      "supplierName": "Supplier name",
      "subject": "Mail subject",
      "body": "Mail body"
    }
  ]
}
```

Важно:

- backend удаляет старые письма до новой генерации
- draft без supplier match пропускается, а не валит весь сценарий

### 3.3. Analyze KP

- webhook: `/webhook/procurement/analyze-kp`
- caller: `ProcurementKpAnalysisWorkflow`

Payload:

```json
{
  "offer": {
    "text": "OCR extracted text"
  },
  "criteria_text": "criteria text"
}
```

Ожидаемые поля результата:

- `is_complete`
- `missing_fields`
- `items`
- `notes`

### 3.4. Generate NMC

- webhook: `/webhook/procurement/nmc`
- caller: `ProcurementNmcWorkflow`

Payload:

```json
{
  "items": [{ "...": "..." }],
  "offers": [
    {
      "supplierId": "uuid",
      "supplierName": "Supplier name",
      "items": "[...]"
    }
  ]
}
```

Важно:

- в `offers` попадают только документы, у которых есть сохраненный `kp_analysis`
- `items` внутри offer сейчас передаются как строка `extracted_items_json`, а не как уже распарсенный массив

## 4. Важные инварианты

- имена `korus_ai_procurement__*` нельзя менять без синхронного обновления frontend
- порядок аргументов в `ComponentArgs` считается частью публичного контракта
- webhook path в `n8n` считается частью runtime-контракта
- `matched_items_json` хранится в БД как JSONB, но frontend часто передает его как строку JSON
- при генерации писем отсутствие `selected` поставщиков не считается ошибкой: backend fallback-ится на всех поставщиков пакета
- при анализе КП отсутствие `criteria_text` в аргументе не считается ошибкой: backend берет его из пакета
- при ошибках `n8n` ответы могут прийти fenced JSON, JSON-строкой или просто текстом; нормализация сосредоточена в `ProcurementN8nHelper`

## 5. Что стоит перепроверять перед изменением контракта

- фронтовые вызовы в `project-neo-fe-dev/src/services/procurement/api.ts`
- аргументы в `components/functions/*`
- orchestration в `services/workflows/*`
- документооборот между file storage -> KP upload -> KP analyze
- зависимости от `n8n` workflow и его фактического response shape
