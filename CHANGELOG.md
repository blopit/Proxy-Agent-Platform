# 📋 Changelog

All notable changes to the Proxy Agent Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🏗️ Repository Organization
#### Added
- Comprehensive repository reorganization for improved navigation
- New `.data/` directory for runtime data (databases, logs)
- `agent_resources/` directory for documentation and status tracking
- `examples/` directory (renamed from `use-cases/`)
- Comprehensive navigation README files in all major directories
- `docs/INDEX.md` - Central documentation hub
- `reports/README.md` - Report management guide
- `examples/README.md` - Example code catalog
- `archive/README.md` - Enhanced archival policy
- `.data/README.md` - Runtime data documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - This file

#### Changed
- Moved all database files to `.data/databases/`
- Moved logs to `.data/logs/`
- Reorganized `docs/` with 24+ subdirectories
- Updated `docs/INDEX.md` with comprehensive navigation
- Enhanced `archive/README.md` with clear archival policy
- Moved cleanup reports to `archive/2025-11-06/`
- Moved status documents to `docs/status/`
- Renamed `use-cases/` to `examples/`
- Root directory now has only 3 markdown files (README, CLAUDE, START_HERE)

#### Improved
- Documentation structure with clear hierarchy
- Navigation between related documents
- Archival system with date-based organization
- Finding information with search examples
- Onboarding experience for new developers

## [0.9.0] - 2025-11-02

### Added
- Task Statistics Service with productivity metrics
- Focus Timer with cyan goal color and white streak effect
- Test suite improvements (887 tests collected)
- Delegation system for task assignment (BE-00)

### Fixed
- Test suite errors resolved (0 errors)
- FocusTimer progress bar color cycles
- Task assignment validation

### Changed
- Updated test suite structure
- Improved task management API

## [0.8.0] - 2025-10-30

### Added
- Task delegation system
- Agent capability tracking
- Task assignment workflow
- Enhanced database schema with 11 tables

### Changed
- Refactored agent architecture
- Improved database relationships
- Updated API endpoints

## [0.7.0] - 2025-10-25

### Added
- Mobile Phase 1: 5 biological workflow modes
- Dopamine reward system
- Beautiful React/Next.js dashboard
- Tailwind CSS integration

### Changed
- Frontend component structure
- Mobile UX optimization for ADHD

## Earlier Releases

See [reports/archive/](reports/archive/) for historical release notes and completion reports.

---

## Types of Changes

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements

## Release Schedule

- **Major releases** (X.0.0): Breaking changes, major features
- **Minor releases** (0.X.0): New features, backward compatible
- **Patch releases** (0.0.X): Bug fixes, minor improvements

## How to Update This File

1. **During development**: Add entries to `[Unreleased]` section
2. **Before release**: Move unreleased changes to new version section
3. **Version format**: `[X.Y.Z] - YYYY-MM-DD`
4. **Categorize changes**: Use types listed above
5. **Link issues**: Reference GitHub issues when applicable

Example entry:
```markdown
### Added
- New feature description (#123)
- Another feature (#456)

### Fixed
- Bug fix description (#789)
```

---

**Last Updated**: November 6, 2025

**Navigation**: [↑ README](README.md) | [📚 Docs](docs/INDEX.md) | [📊 Status](agent_resources/STATUS.md)
