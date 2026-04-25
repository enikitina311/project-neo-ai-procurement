# Карта модуля закупок

Документ для быстрого входа в кодовую базу procurement-модуля: куда смотреть по слоям, сценариям и типовым инцидентам.

## 1. Корневые каталоги

- backend plugin: `/home/ENikitina/apps/NEO/project-neo-be-procurement`
- frontend procurement: `/home/ENikitina/apps/NEO/project-neo-fe-dev/src/pages/procurement`
- frontend API: `/home/ENikitina/apps/NEO/project-neo-fe-dev/src/services/procurement`

## 2. Backend-карта

### 2.1. Точка входа и wiring

- `src/main/java/ru/korusconsulting/projectneo/modules/ai/procurement/ProcurementApp.java`
- `src/main/java/ru/korusconsulting/projectneo/modules/ai/procurement/app/configuration/ProcurementConfiguration.java`
- `src/main/java/ru/korusconsulting/projectneo/modules/ai/procurement/app/deployment/ProcurementDeployment.java`

### 2.2. Публичные runtime-функции

Все публичные функции находятся в:

- `src/main/java/ru/korusconsulting/projectneo/modules/ai/procurement/components/functions`

Группы:

- `packages`
- `items`
- `suppliers`
- `letters`
- `kp`
- `nmc`

### 2.3. Где лежит orchestration-логика

- поиск поставщиков: `services/workflows/ProcurementSupplierSearchWorkflow.java`
- генерация писем: `services/workflows/ProcurementLettersWorkflow.java`
- анализ КП: `services/workflows/ProcurementKpAnalysisWorkflow.java`
- генерация НМЦ: `services/workflows/ProcurementNmcWorkflow.java`

### 2.4. Внутренние helper-ы

- `services/support/ProcurementFunctionArgs.java`
  - типизация `ComponentArgs`
  - default values
  - safe parsing для optional аргументов
- `services/support/ProcurementN8nHelper.java`
  - POST в `n8n`
  - извлечение `output`
  - sanitize fenced JSON / текстовых JSON-подобных ответов
  - normalize полей типа `suppliers`

### 2.5. Инфраструктурные зависимости

- OCR: `services/ocr/ProcurementOcrService.java`
- Liquibase: `src/main/resources/config/procurement/database/procurement_001_schema.xml`
- file storage используется в `ProcurementKpAnalysisWorkflow`

## 3. Frontend-карта

### 3.1. Главные страницы

- список пакетов: `ui/ProcurementPage.tsx`
- карточка пакета: `ui/ProcurementPackagePage.tsx`
- стили: `ui/ProcurementPage.css`

### 3.2. Табы и sidebar

- `ui/components/ProcurementPackageSidebar.tsx`
- `ui/components/ProcurementItemsTab.tsx`
- `ui/components/ProcurementSuppliersTab.tsx`
- `ui/components/ProcurementLettersTab.tsx`
- `ui/components/ProcurementKpTab.tsx`
- `ui/components/ProcurementNmcTab.tsx`

### 3.3. Hooks orchestration

- `hooks/useProcurementPackageData.ts`
  - загрузка пакета, номенклатуры, поставщиков, писем, КП, НМЦ
- `hooks/useProcurementSuppliers.ts`
  - поиск поставщиков
  - перенос из search results
  - toggle `selected`
- `hooks/useProcurementDocuments.ts`
  - генерация писем
  - upload КП
  - analyze КП
  - generate НМЦ

### 3.4. Shared util-слой

- `lib/execute.ts` — builder payload для `WORKSPACES.EXECUTE`
- `lib/suppliers.ts` — coverage/matched items/filter/sort
- `lib/errors.ts` — нормализация ошибок API под procurement UI

### 3.5. API слой

- `src/services/procurement/api.ts`
  - TS-модели DTO
  - execute wrappers
  - upload файла в file storage

## 4. Как искать код по сценарию

### 4.1. Создание или редактирование пакета

- frontend:
  - `ProcurementPackagePage.tsx`
  - `ProcurementPackageSidebar.tsx`
- backend:
  - `components/functions/packages/*`
  - `services/packages/*`

### 4.2. Номенклатура

- frontend:
  - `ProcurementItemsTab.tsx`
- backend:
  - `components/functions/items/*`
  - `services/items/*`

### 4.3. Поиск и перенос поставщиков

- frontend:
  - `useProcurementSuppliers.ts`
  - `ProcurementSuppliersTab.tsx`
- backend:
  - `SupplierSearch.java`
  - `SupplierAddManual.java`
  - `SupplierSelect.java`
  - `ProcurementSupplierSearchWorkflow.java`

### 4.4. Генерация писем

- frontend:
  - `useProcurementDocuments.ts`
  - `ProcurementLettersTab.tsx`
- backend:
  - `LettersGenerate.java`
  - `LettersList.java`
  - `ProcurementLettersWorkflow.java`

### 4.5. КП и OCR

- frontend:
  - `useProcurementDocuments.ts`
  - `ProcurementKpTab.tsx`
- backend:
  - `KpUpload.java`
  - `KpDocumentsList.java`
  - `KpAnalyze.java`
  - `KpAnalysisGet.java`
  - `ProcurementKpAnalysisWorkflow.java`
  - `ProcurementOcrService.java`

### 4.6. НМЦ

- frontend:
  - `useProcurementDocuments.ts`
  - `ProcurementNmcTab.tsx`
- backend:
  - `NmcGenerate.java`
  - `NmcGet.java`
  - `ProcurementNmcWorkflow.java`

## 5. Куда смотреть при типовых проблемах

### 5.1. При падении `n8n`

- `ProcurementN8nHelper.java`
- workflow-класс соответствующего сценария
- frontend toast/error-state в hooks

### 5.2. При “пустых” письмах

- `ProcurementLettersWorkflow.java`
- supplier matching по `supplierId` / `supplierName`
- что реально вернул `/webhook/procurement/generate-letters`

### 5.3. При проблемах с КП

- запись в `procurement.kp_documents`
- file storage по `file_id`
- `ProcurementOcrService`
- `ProcurementKpAnalysisWorkflow.java`

### 5.4. При проблемах с НМЦ

- наличие `procurement.kp_analysis`
- заполненность `extracted_items_json`
- связка `kp_documents.supplier_id` <-> `suppliers.id`
- `ProcurementNmcWorkflow.java`
