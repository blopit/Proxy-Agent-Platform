# 📚 Documentation Hub

**Last Updated**: November 13, 2025

> **📝 Documentation Reorganization Complete (Nov 13, 2025)**
>
> All primary documentation is now in **[`agent_resources/`](../agent_resources/README.md)** for better organization.
> This directory contains specialized documentation only.

---

## 🤖 Primary Documentation (agent_resources/)

**✨ All organized documentation is now in [agent_resources/](../agent_resources/README.md)**

Start here:
- **[Quick Start Guide](../agent_resources/QUICKSTART.md)** - 5-minute overview
- **[Complete Sitemap](../agent_resources/SITEMAP.md)** - All 92 docs cataloged
- **[Project Status](../agent_resources/STATUS.md)** - Current state
- **[Backend Guide](../agent_resources/backend/README.md)** - Backend development
- **[Frontend Guide](../agent_resources/frontend/README.md)** - Frontend development
- **[Architecture Guide](../agent_resources/architecture/README.md)** - System design
- **[Testing Guide](../agent_resources/testing/README.md)** - Testing strategies

---

## 📁 Specialized Documentation (docs/)

This directory now contains only specialized operational documentation:

### Architecture & Vision
High-level architecture and vision documents (referenced by agent_resources/):
- [System Overview](architecture/system-overview.md) - Complete system architecture
- [AI System Architecture](architecture/AI_SYSTEM_ARCHITECTURE.md) - AI/agent design
- [AI System Enhancement Proposal](architecture/AI_SYSTEM_ENHANCEMENT_PROPOSAL.md) - Proposed improvements
- [Agent Architecture Overview](architecture/agent-architecture-overview.md) - Agent patterns
- [Digital Task Delegation Vision](architecture/digital-task-delegation-vision.md) - Task delegation system

### Development Resources
Operational development documentation:
- [Deprecation Notice](development/DEPRECATION_NOTICE.md) - Deprecated code and migration guide
- [Developer Guide](development/README.md) - Comprehensive developer guide
- [Product Development Playbook](development/PRODUCT_DEVELOPMENT_PLAYBOOK.md) - Product processes
- [Integration Guide](development/INTEGRATION_GUIDE.md) - Integration patterns
- [Quick Wins](development/QUICK_WINS.md) - Quick improvement tasks

### DevOps & Deployment
Deployment and operational documentation:
- [DevOps README](devops/README.md) - DevOps overview
- [CI/CD Guide](devops/cicd.md) - Continuous integration/deployment
- [Deployment Guide](devops/deployment.md) - Deployment procedures
- [Docker Setup](devops/docker.md) - Container configuration
- [Environment Setup](devops/environment-setup.md) - Environment configuration
- [Monitoring](devops/monitoring.md) - System monitoring

### Integration Specifications
Third-party integration documentation:
- [Pipelex Integration](integration/pipelex/README.md) - Complete Pipelex integration spec (15 docs)
- [Pipelex Integration Spec](integration/PIPELEX_INTEGRATION_SPEC.md) - Integration overview

### Workflow Documentation
Team workflow and process documentation:
- [AI Coding Workflows](workflows/AI_CODING_WORKFLOWS.md) - AI-assisted development workflows
- [Human Testing Process](workflows/HUMAN_TESTING_PROCESS.md) - Manual testing procedures

### Status & Planning
Current status tracking (consolidated):
- [Status README](status/README.md) - Status documentation overview

### Historical Documentation
- [Archive](archive/) - Archived documentation (200+ files)

---

## 🔍 Finding Documentation

### Search Documentation
```bash
# Search agent_resources (primary docs)
./scripts/search-docs.sh "keyword"

# Or use ripgrep directly
rg "keyword" agent_resources/ -i

# Search specialized docs
rg "keyword" docs/architecture/ docs/devops/ docs/integration/ -i
```

### By Role
- **Backend Developer**: Start at [agent_resources/backend/README.md](../agent_resources/backend/README.md)
- **Frontend Developer**: Start at [agent_resources/frontend/README.md](../agent_resources/frontend/README.md)
- **Architect**: Start at [agent_resources/architecture/README.md](../agent_resources/architecture/README.md) then [docs/architecture/](architecture/)
- **DevOps**: Start at [docs/devops/README.md](devops/README.md)
- **QA Engineer**: Start at [agent_resources/testing/README.md](../agent_resources/testing/README.md)

### By Topic
- **Getting Started**: [agent_resources/QUICKSTART.md](../agent_resources/QUICKSTART.md)
- **Architecture**: [docs/architecture/system-overview.md](architecture/system-overview.md)
- **API Reference**: [agent_resources/backend/api/](../agent_resources/backend/api/)
- **Testing**: [agent_resources/testing/](../agent_resources/testing/)
- **Deployment**: [docs/devops/](devops/)
- **Integrations**: [docs/integration/](integration/)

---

## 📊 Documentation Structure Summary

| Location | Purpose | File Count |
|----------|---------|------------|
| **agent_resources/** | Primary documentation hub | 92 files |
| **docs/architecture/** | High-level architecture vision | 11 files |
| **docs/development/** | Operational dev docs | 5 files |
| **docs/devops/** | Deployment & operations | 6 files |
| **docs/integration/** | Integration specifications | 17 files |
| **docs/workflows/** | Team workflows | 2 files |
| **docs/status/** | Status tracking | 1 file |
| **docs/archive/** | Historical documentation | 200+ files |

**Total Active Documentation**: ~140 files (92 in agent_resources + ~48 in docs)

---

## 🎯 Quick Links

### Essential Files
- **[CLAUDE.md](../CLAUDE.md)** - Development standards
- **[README.md](../README.md)** - Project overview
- **[START_HERE.md](../START_HERE.md)** - Weekly guide
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute

### Documentation Navigation
- **[agent_resources/SITEMAP.md](../agent_resources/SITEMAP.md)** - Complete doc index
- **[agent_resources/README.md](../agent_resources/README.md)** - Main doc hub
- **[agent_resources/STATUS.md](../agent_resources/STATUS.md)** - Project status

---

## 📞 Help

### Can't Find What You Need?
1. **Search**: Use `./scripts/search-docs.sh "keyword"`
2. **Browse**: Check [SITEMAP.md](../agent_resources/SITEMAP.md)
3. **Ask**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

### Documentation Issues?
- Outdated? Update it!
- Missing? Create it in `agent_resources/`!
- Confusing? Clarify it!

---

**Navigation**: [↑ Project Root](../) | [📚 Agent Resources](../agent_resources/) | [🎯 Quick Start](../agent_resources/QUICKSTART.md)

*Last major reorganization: November 13, 2025*
