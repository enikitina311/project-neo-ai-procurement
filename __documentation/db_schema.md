# Database Schema

Generated at 2026-04-14T21:23:07.478Z

> Автоматически сгенерировано из Liquibase databaseChangeLog файлов.

Сервис использует общую базу `projectneo`, но хранит свои данные в отдельных таблицах `procurement__*`.

Важно: у модуля нет отдельного PostgreSQL namespace/schema, но собственная физическая модель данных у него есть.

## Tables

| Table | Columns | Source Files |
|-------|---------|--------------|
| `procurement.items` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.kp_analysis` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.kp_documents` | 9 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.letters` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.nmc_results` | 8 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.packages` | 10 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |
| `procurement.suppliers` | 17 | `src/main/resources/config/procurement/database/procurement_001_schema.xml` |

## procurement.items

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
- FK: `package_id` -> `procurement.packages`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_items_package_id`: `package_id`

---

## procurement.kp_analysis

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
- FK: `kp_document_id` -> `procurement.kp_documents`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_kp_analysis_document_id`: `kp_document_id`

---

## procurement.kp_documents

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
- FK: `package_id` -> `procurement.packages`(`id`)
- FK: `supplier_id` -> `procurement.suppliers`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_kp_documents_package_id`: `package_id`
- `idx_procurement_kp_documents_supplier_id`: `supplier_id`

---

## procurement.letters

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
- FK: `package_id` -> `procurement.packages`(`id`)
- FK: `supplier_id` -> `procurement.suppliers`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_letters_package_id`: `package_id`
- `idx_procurement_letters_supplier_id`: `supplier_id`

---

## procurement.nmc_results

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
- FK: `package_id` -> `procurement.packages`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_nmc_results_package_id`: `package_id`

---

## procurement.packages

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
- FK: `project_id` -> `core.projects`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_packages_project_id`: `project_id`
- `idx_procurement_packages_created_by`: `created_by`

---

## procurement.suppliers

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
- FK: `package_id` -> `procurement.packages`(`id`)
- FK: `created_by` -> `core.users`(`id`)
- FK: `updated_by` -> `core.users`(`id`)

**Indexes**
- `idx_procurement_suppliers_package_id`: `package_id`

---

## Diagram

```mermaid
erDiagram
  procurement.items {
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
  procurement.kp_analysis {
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
  procurement.kp_documents {
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
  procurement.letters {
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
  procurement.nmc_results {
    UUID id PK
    UUID package_id FK
    TEXT nmc_table_json
    TEXT nmc_table_text
    UUID created_by FK
    UUID updated_by FK
    TIMESTAMP_WITH_TIME_ZONE created_at
    TIMESTAMP_WITH_TIME_ZONE updated_at
  }
  procurement.packages {
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
  procurement.suppliers {
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
  procurement.packages ||--o{ procurement.items : ""
  core.users ||--o{ procurement.items : ""
  procurement.kp_documents ||--o{ procurement.kp_analysis : ""
  core.users ||--o{ procurement.kp_analysis : ""
  procurement.packages ||--o{ procurement.kp_documents : ""
  procurement.suppliers ||--o{ procurement.kp_documents : ""
  core.users ||--o{ procurement.kp_documents : ""
  procurement.packages ||--o{ procurement.letters : ""
  procurement.suppliers ||--o{ procurement.letters : ""
  core.users ||--o{ procurement.letters : ""
  procurement.packages ||--o{ procurement.nmc_results : ""
  core.users ||--o{ procurement.nmc_results : ""
  core.projects ||--o{ procurement.packages : ""
  core.users ||--o{ procurement.packages : ""
  procurement.packages ||--o{ procurement.suppliers : ""
  core.users ||--o{ procurement.suppliers : ""
```
