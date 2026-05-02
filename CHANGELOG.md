# Changelog

All notable changes to the **procurement** plugin are recorded here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
plugin follows [Semantic Versioning](https://semver.org/).

The version returned by `ProcurementServiceModule.version()` is the
canonical shipping version. Each release entry below also names the
`requiredCoreVersion` the plugin built against — bump it whenever core's
breaking changes affect this plugin.

## [Unreleased]

_No unreleased changes._

## [0.3.0] — 2026-04-26

### Changed
- **Phase 2.6: cross-plugin FK constraints dropped.** New
  `procurement_002_drop_cross_plugin_fk.xml` (module.yml `order=2`)
  drops all 17 hard FKs that pointed at `core.users` and
  `core.projects`. Columns stay as soft UUIDs; integrity is now
  app-level, per ARCHITECTURE_REFACTOR.md §7.3. Intra-plugin FKs
  (packages / suppliers / kp_documents) are untouched.
- `requiredCoreVersion` stays `>=0.2.0` — Phase 2.6 does not require a
  new core release.

## [0.2.0] — 2026-04-26

### Changed (BREAKING)
- **Schema-per-service.** Procurement tables moved from
  `public.procurement__*` to `procurement.*`. The single
  `procurement_001_schema.xml` rewritten in place; new
  `procurement_000_create_schema.xml` registered at `module.yml` `order=0`.
- **Cross-plugin FKs schema-qualified.** References to `core__users` and
  `core__projects` now carry `referencedTableSchemaName="core"`.
- **Java entity layer.** `@Table("procurement__X")` →
  `@Table("procurement.X")` in 8 entity models.
- **Compatibility.** `requiredCoreVersion` bumped to `>=0.2.0` —
  procurement 0.2.x will not load against core 0.1.x.

## [0.1.0] — 2026-04-25

- Baseline. Pre-Phase-2.5 layout (table prefix `procurement__*`, single
  `public` schema). Compatible with core `>=0.1`.
- Phase 2.3 `ProcurementServiceModule implements ServiceModule` declared.
- Phase 2.4 ArchUnit guard `no_cross_plugin_imports` enforced.
- Known tech debt: 4 pre-existing failing tests in
  `ProcurementN8nHelperTest` (`NoClassDefFound StringExtensions /
  XmlMapper`); not yet fixed.
