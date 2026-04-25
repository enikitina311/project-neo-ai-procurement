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

## [0.1.0] — 2026-04-25

- Baseline. Pre-Phase-2.5 layout (table prefix `procurement__*`, single
  `public` schema). Compatible with core `>=0.1`.
- Phase 2.3 `ProcurementServiceModule implements ServiceModule` declared.
- Phase 2.4 ArchUnit guard `no_cross_plugin_imports` enforced.
- Known tech debt: 4 pre-existing failing tests in
  `ProcurementN8nHelperTest` (`NoClassDefFound StringExtensions /
  XmlMapper`); not yet fixed.
