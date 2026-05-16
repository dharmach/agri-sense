# Project Context: agri-sense

**Last Updated**: 2026-05-15
**Updated By**: Feature init

## Project Identity

- **Name**: agri-sense
- **Type**: web-app / agent
- **Purpose**: Autonomous plant health diagnosis system combining visual, NDVI, and voice inputs (Triple-Triangulation) for comprehensive analysis.
- **Domain**: Agritech / Agriculture

## Technology Stack

### Languages & Versions
- Python: >=3.12

### Frameworks & Libraries
- google-adk: >=1.0.0
- toolbox-core: >=1.0.0
- google-genai: >=1.0.0
- uvicorn: >=0.30.0
- FastAPI: (Wrapped by ADK)

### Storage
- Cloud SQL for PostgreSQL (pg8000)

### Testing
- Not explicitly defined in config yet.

## Project Structure

```
.agents/
  rules/
  skills/
  workflows/
.env.example
.gitignore
.specify/
  memory/
  scripts/
  templates/
LICENSE
README.md
database_setup.log
plant_health/
  __init__.py
  agent.py
pyproject.toml
scripts/
  setup_database.sh
server.py
skills-lock.json
specs/
  001-intervention-scheduling/
tools.yaml
uv.lock
```

## API Surface

| Method | Path | Purpose |
|--------|------|---------|
| Any | Various | Handled by ADK fast_api wrapper on port 8080 |

## Runtime Dependency Graph

```
[Browser / Client] → [uvicorn :8080] → [MCP Toolbox :5000] → [Cloud SQL: agri-sense-db]
```

- **uvicorn API**: Runs ADK Agent logic, listens on `PORT` (8080)
- **MCP Toolbox**: Provides PostgreSQL connection for tools, runs on `TOOLBOX_URL` (5000)

## Local Dev Runbook

1. Ensure MCP Toolbox is running on port 5000 (`TOOLBOX_URL=http://127.0.0.1:5000`)
2. Set environment variables (GOOGLE_CLOUD_PROJECT, REGION, DB_PASSWORD).
3. Run `python server.py` to start the uvicorn server on port 8080.

## Data Model Overview

### Entities (Cross-Feature)
- **disease_reference_library**:
  - Purpose: Stores technical knowledge of pests/diseases and their treatments based on visual symptoms.
  - Key fields: visual_symptoms, disease_name, treatment, organic_alt, risk_level
- **agricultural_ndvi**:
  - Purpose: Tracks the vegetation health index trends for specific fields.
  - Key fields: field_id, observation_date, ndvi_value
- **treatment_catalog**:
  - Purpose: Maps farmer voice keywords to specific remedy dosing instructions.
  - Key fields: keywords, remedy_name, dosage, method

### Tool Definitions
- **query_agronomy_knowledge**: disease_reference_library — SELECT
- **get_ndvi_trend**: agricultural_ndvi — SELECT
- **match_voice_to_remedy**: treatment_catalog — SELECT

## Domain Glossary

| Term | Definition |
|------|-----------|
| Triple-Triangulation | Diagnostic approach combining Image (Visual), NDVI (Metabolic), and Voice (Contextual) data. |
| NDVI | Normalized Difference Vegetation Index; measures systemic plant health and vigor. |
| Farm Memory | State management mechanism (`manage_farm_memory`) to retain context across conversational turns. |

## External Integrations

- **Cloud SQL for PostgreSQL**: Target database for agronomy knowledge, NDVI trends, and treatments.
  - Authentication: Provided via `DB_PASSWORD` and connection config in `tools.yaml`.
- **Gemini 2.5 Flash**: Multimodal LLM powering the core reasoning agent.

## Development Workflow

- **Branch Strategy**: Speckit feature branches (`###-feature-name`)
- **Workflow Standard**: Speckit (Specification-First Development)

## Architecture Patterns

- **Code Organization**: Agent-based architecture. Main logic in `plant_health/agent.py`. Tools definitions externalized to `tools.yaml`.
- **State Management**: Utilizes `tool_context.state` (specifically `farm_memory`) for autonomous contextual tracking.

## Recent Features

- init: Added core `agri_autonomous` agent with Triple-Triangulation capabilities.

## Configuration

- **Config Files**: `pyproject.toml`, `tools.yaml`, `.env.example`

### Environment Variable Dependency Chain

| Variable | Consumed By | What Breaks If Missing |
|----------|-------------|----------------------|
| GOOGLE_CLOUD_PROJECT | tools.yaml (Cloud SQL) | Database connection fails |
| REGION | tools.yaml (Cloud SQL) | Database connection fails |
| DB_PASSWORD | tools.yaml (Cloud SQL) | Authentication to DB fails |
| TOOLBOX_URL | plant_health/agent.py | Agent cannot load SQL tools (defaults to port 5000) |
| PORT | server.py | Uvicorn server startup (defaults to 8080) |

## Known Constraints

- (None currently documented)

<!-- MANUAL ADDITIONS START -->
<!-- Add any manual context below this line -->
<!-- MANUAL ADDITIONS END -->
