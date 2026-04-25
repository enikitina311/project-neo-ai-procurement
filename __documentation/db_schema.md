# Database Schema

Generated at 2026-04-14T21:23:07.478Z

> Автоматически сгенерировано из Liquibase databaseChangeLog файлов.

Сервис использует общую базу `projectneo`, но хранит свои данные в отдельных таблицах `procurement__*`.

Важно: у модуля нет отдельного PostgreSQL namespace/schema, но собственная физическая модель данных у него есть.

## Tables

| Table | Columns | Source Files |
|-------|---------|--------------|
| `procurement__items` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__kp_analysis` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__kp_documents` | 9 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__letters` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__nmc_results` | 8 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__packages` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement__suppliers` | 17 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |

## procurement__items

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `package_id` | `uuid` |  | ❌ |  |  |
| `name` | `text` |  | ❌ |  |  |
| `specs` | `text` |  | ✅ |  |  |
| `qty` | `numeric(14,4)` |  | ✅ |  |  |
| `unit` | `varchar(50)` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `package_id` -> `procurement__packages`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_items_package_id`: `package_id`

---

## procurement__kp_analysis

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `kp_document_id` | `uuid` |  | ❌ |  |  |
| `is_complete` | `boolean` |  | ✅ |  |  |
| `missing_fields` | `text` |  | ✅ |  |  |
| `extracted_items_json` | `text` |  | ✅ |  |  |
| `notes` | `text` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `kp_document_id` -> `procurement__kp_documents`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_kp_analysis_document_id`: `kp_document_id`

---

## procurement__kp_documents

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `package_id` | `uuid` |  | ❌ |  |  |
| `supplier_id` | `uuid` |  | ❌ |  |  |
| `file_id` | `uuid` |  | ❌ |  |  |
| `uploaded_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `package_id` -> `procurement__packages`(`id`)
- FK: `supplier_id` -> `procurement__suppliers`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_kp_documents_package_id`: `package_id`
- `idx_procurement_kp_documents_supplier_id`: `supplier_id`

---

## procurement__letters

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `package_id` | `uuid` |  | ❌ |  |  |
| `supplier_id` | `uuid` |  | ❌ |  |  |
| `subject` | `text` |  | ✅ |  |  |
| `body` | `text` |  | ✅ |  |  |
| `status` | `varchar(50)` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `package_id` -> `procurement__packages`(`id`)
- FK: `supplier_id` -> `procurement__suppliers`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_letters_package_id`: `package_id`
- `idx_procurement_letters_supplier_id`: `supplier_id`

---

## procurement__nmc_results

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `package_id` | `uuid` |  | ❌ |  |  |
| `nmc_table_json` | `text` |  | ✅ |  |  |
| `nmc_table_text` | `text` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `package_id` -> `procurement__packages`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_nmc_results_package_id`: `package_id`

---

## procurement__packages

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `project_id` | `uuid` |  | ❌ |  |  |
| `name` | `varchar(255)` |  | ❌ |  |  |
| `criteria_text` | `text` |  | ✅ |  |  |
| `coverage_threshold` | `numeric(6,4)` |  | ✅ |  |  |
| `suppliers_limit` | `int` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `project_id` -> `core__projects`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_packages_project_id`: `project_id`
- `idx_procurement_packages_created_by`: `created_by`

---

## procurement__suppliers

Sources: `src/main/resources/config/procurement/database/procurement_001_schema.xml`

| Column | Type | PK | Nullable | Unique | Default |
|--------|------|----|----------|--------|---------|
| `id` | `uuid` | ✅ | ❌ |  |  |
| `package_id` | `uuid` |  | ❌ |  |  |
| `name` | `text` |  | ❌ |  |  |
| `url` | `text` |  | ✅ |  |  |
| `email` | `varchar(255)` |  | ✅ |  |  |
| `price` | `numeric(14,4)` |  | ✅ |  |  |
| `unit` | `varchar(50)` |  | ✅ |  |  |
| `note` | `text` |  | ✅ |  |  |
| `origin` | `varchar(50)` |  | ✅ |  |  |
| `selected` | `boolean` |  | ✅ |  | `false` |
| `coverage_count` | `int` |  | ✅ |  |  |
| `coverage_ratio` | `numeric(6,4)` |  | ✅ |  |  |
| `matched_items_json` | `jsonb` |  | ✅ |  |  |
| `created_by` | `uuid` |  | ❌ |  |  |
| `updated_by` | `uuid` |  | ✅ |  |  |
| `created_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |
| `updated_at` | `timestamp with time zone` |  | ✅ |  | `NOW()` |

**Foreign Keys**
- FK: `package_id` -> `procurement__packages`(`id`)
- FK: `created_by` -> `core__users`(`id`)
- FK: `updated_by` -> `core__users`(`id`)

**Indexes**
- `idx_procurement_suppliers_package_id`: `package_id`

---

## Diagram

```mermaid
erDiagram
  procurement__items {
    UUID id PK
    UUID package_id FK
    TEXT name
    TEXT specs
    NUMERIC14,4 qty
    VARCHAR50 unit
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__kp_analysis {
    UUID id PK
    UUID kp_document_id FK
    BOOLEAN is_complete
    TEXT missing_fields
    TEXT extracted_items_json
    TEXT notes
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__kp_documents {
    UUID id PK
    UUID package_id FK
    UUID supplier_id FK
    UUID file_id
    TIMESTAMP_WITH_TIME_ZONE uploaded_at
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__letters {
    UUID id PK
    UUID package_id FK
    UUID supplier_id FK
    TEXT subject
    TEXT body
    VARCHAR50 status
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__nmc_results {
    UUID id PK
    UUID package_id FK
    TEXT nmc_table_json
    TEXT nmc_table_text
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__packages {
    UUID id PK
    UUID project_id FK
    VARCHAR255 name
    TEXT criteria_text
    NUMERIC6,4 coverage_threshold
    INT suppliers_limit
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__suppliers {
    UUID id PK
    UUID package_id FK
    TEXT name
    TEXT url
    VARCHAR255 email
    NUMERIC14,4 price
    VARCHAR50 unit
    TEXT note
    VARCHAR50 origin
    BOOLEAN selected
    INT coverage_count
    NUMERIC6,4 coverage_ratio
    JSONB matched_items_json
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement__packages ||--o{ procurement__items : ""
  core__users ||--o{ procurement__items : ""
  procurement__kp_documents ||--o{ procurement__kp_analysis : ""
  core__users ||--o{ procurement__kp_analysis : ""
  procurement__packages ||--o{ procurement__kp_documents : ""
  procurement__suppliers ||--o{ procurement__kp_documents : ""
  core__users ||--o{ procurement__kp_documents : ""
  procurement__packages ||--o{ procurement__letters : ""
  procurement__suppliers ||--o{ procurement__letters : ""
  core__users ||--o{ procurement__letters : ""
  procurement__packages ||--o{ procurement__nmc_results : ""
  core__users ||--o{ procurement__nmc_results : ""
  core__projects ||--o{ procurement__packages : ""
  core__users ||--o{ procurement__packages : ""
  procurement__packages ||--o{ procurement__suppliers : ""
  core__users ||--o{ procurement__suppliers : ""
```
