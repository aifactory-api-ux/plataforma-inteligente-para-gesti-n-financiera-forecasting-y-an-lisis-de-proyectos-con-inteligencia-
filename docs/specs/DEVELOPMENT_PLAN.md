# DEVELOPMENT PLAN: Plataforma Inteligente para Gestión Financiera, Forecasting y Análisis de Proyectos con Inteligencia Artificial

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Frontend (Next.js 14, TypeScript, Tailwind CSS):** Implements the full UI/UX contract, including dashboards, project management, budget versioning, forecasting, analytics, AI assistant, and explainability modules. Strictly follows the Figma design and design tokens.
- **Backend (FastAPI microservices, Python 3.11):**
  - **Auth Service:** JWT authentication, user management.
  - **Project Service:** CRUD for projects, project search/filter.
  - **Budget Service:** Budget versioning, budget items, baseline management.
  - **Forecast Service:** Forecasting (Prophet/XGBoost), scenario simulation, explainability (SHAP).
  - **AI Assistant Service:** Conversational AI (GPT-4/Llama 3), chat history, recommendations.
- **ETL/Integration:** Apache Airflow for ingesting and consolidating data from legacy planning and execution databases into PostgreSQL and S3.
- **Database:** PostgreSQL 15 (projects, budgets, forecasts, users, etc.), Redis 7.x for cache/session.
- **Infrastructure:** Docker Compose for local orchestration, AWS ECS/RDS/S3 for production, healthchecks, secure env management.

**Folder Structure:**
```
project-root/
├── frontend/
│   ├── src/
│   └── Dockerfile
├── backend/
│   ├── shared/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── utils.py
│   │   └── __init__.py
│   ├── auth-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── dependencies.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── project-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── budget-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── forecast-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── ai-assistant-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
├── docs/
│   └── architecture.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .dockerignore
├── run.sh
└── README.md
```

**Models & APIs:**  
- All models (User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPFeatureImportance, ForecastExplainability) are defined in shared/models.py and shared/types.ts.
- All endpoints strictly follow the contracts in SPEC.md §3.

**Frontend:**  
- Implements all Figma screens, layouts, and components as per the UI/UX Design Implementation Contract, using the design tokens and structure provided.

**Infrastructure:**  
- Docker Compose orchestrates all services, with healthchecks and dependency order.
- .env.example documents all required environment variables.
- run.sh automates the full local setup and health validation.

---

## 2. ACCEPTANCE CRITERIA

1. **End-to-end user flow:** A user can log in, create a project (via chat or form), manage budgets with versioning, view dashboards with KPIs, analyze forecasts and explainability, interact with the AI assistant, and export reports, all via the web UI matching the Figma design 1:1.
2. **API contract compliance:** All backend endpoints respond with the exact data contracts and behaviors defined in SPEC.md §3, with input validation, RBAC, and error handling.
3. **Infrastructure readiness:** Running `./run.sh` brings up all services, with healthchecks passing, the frontend accessible at `http://localhost:3000`, and all backend APIs reachable and functional.

---

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)

- **Role:** role-tl (technical_lead)
- **Role:** role-be (backend_developer)
- **Role:** role-fe (frontend_developer)
- **Role:** role-devops (devops_support)

---

## 3. EXECUTABLE ITEMS

---

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config

**Goal:**  
Create ALL shared code that other items will import.  
Includes:  
- All TypeScript interfaces/enums for frontend (shared/types.ts)
- All Pydantic and SQLAlchemy models for backend (shared/models.py, shared/schemas.py)
- Shared config and utility modules (shared/config.ts, shared/utils.ts, shared/config.py, shared/utils.py)
- Complete DB schema (backend/shared/schema.sql)
- Environment variable validation for both stacks

**Files to create:**
- shared/types.ts (create) — All frontend TypeScript interfaces/enums as per SPEC.md §2
- shared/config.ts (create) — Frontend shared config/constants, env validation
- shared/utils.ts (create) — Frontend shared utility functions
- backend/shared/models.py (create) — All SQLAlchemy and Pydantic models per SPEC.md §2
- backend/shared/schemas.py (create) — Pydantic schemas for request/response
- backend/shared/utils.py (create) — Shared Python utility functions
- backend/shared/config.py (create) — Python env validation, shared constants
- backend/shared/schema.sql (create) — Full PostgreSQL schema (tables, indexes, FKs) for all models

**Dependencies:** None  
**Validation:**  
- `tsc --noEmit shared/types.ts` passes (strict types)
- `python -m py_compile backend/shared/models.py backend/shared/schemas.py backend/shared/utils.py backend/shared/config.py`
- `psql < backend/shared/schema.sql` creates all tables and indexes without error

**Role:** role-tl (technical_lead)

---

### ITEM 2: Backend — Auth Service (JWT, RBAC, User endpoints)

**Goal:**  
Implement the Auth Service as per SPEC.md §3:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- JWT authentication, password hashing, RBAC enforcement
- Healthcheck endpoint
- Structured logging, env validation

**Files to create:**
- backend/auth-service/main.py (create) — FastAPI entrypoint (EXPOSE 8001, CMD: uvicorn main:app --port 8001)
- backend/auth-service/api.py (create) — Auth endpoints
- backend/auth-service/dependencies.py (create) — JWT, password hashing, RBAC
- backend/auth-service/service.py (create) — Auth business logic
- backend/auth-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8001, COPY ../shared
- backend/auth-service/requirements.txt (create) — All required Python libs

**Dependencies:** Item 1  
**Validation:**  
- `docker build -t auth-service backend/auth-service/` succeeds
- `curl http://localhost:8001/health` returns healthy
- All endpoints respond as per SPEC.md

**Role:** role-be (backend_developer)

---

### ITEM 3: Backend — Project & Budget Services

**Goal:**  
Implement Project and Budget microservices:
- Project Service: CRUD for projects, search/filter, healthcheck
- Budget Service: Budget versioning, budget items, baseline management, healthcheck
- Structured logging, env validation

**Files to create:**
- backend/project-service/main.py (create) — FastAPI entrypoint (EXPOSE 8002, CMD: uvicorn main:app --port 8002)
- backend/project-service/api.py (create) — Project endpoints
- backend/project-service/service.py (create) — Project business logic
- backend/project-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8002, COPY ../shared
- backend/project-service/requirements.txt (create)
- backend/budget-service/main.py (create) — FastAPI entrypoint (EXPOSE 8003, CMD: uvicorn main:app --port 8003)
- backend/budget-service/api.py (create) — Budget endpoints
- backend/budget-service/service.py (create) — Budget business logic
- backend/budget-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8003, COPY ../shared
- backend/budget-service/requirements.txt (create)

**Dependencies:** Item 1  
**Validation:**  
- `docker build` for both services succeeds
- `curl http://localhost:8002/health` and `curl http://localhost:8003/health` return healthy
- All endpoints respond as per SPEC.md

**Role:** role-be (backend_developer)

---

### ITEM 4: Backend — Forecast & AI Assistant Services

**Goal:**  
Implement:
- Forecast Service: GET/POST endpoints for forecasting, scenario simulation, explainability (Prophet, XGBoost, SHAP), healthcheck
- AI Assistant Service: Chat endpoints, LLM integration (GPT-4/Llama 3), recommendations, healthcheck
- Structured logging, env validation

**Files to create:**
- backend/forecast-service/main.py (create) — FastAPI entrypoint (EXPOSE 8004, CMD: uvicorn main:app --port 8004)
- backend/forecast-service/api.py (create) — Forecast endpoints
- backend/forecast-service/service.py (create) — Forecast logic (Prophet, XGBoost, SHAP)
- backend/forecast-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8004, COPY ../shared
- backend/forecast-service/requirements.txt (create)
- backend/ai-assistant-service/main.py (create) — FastAPI entrypoint (EXPOSE 8005, CMD: uvicorn main:app --port 8005)
- backend/ai-assistant-service/api.py (create) — Chat endpoints
- backend/ai-assistant-service/service.py (create) — LLM integration logic
- backend/ai-assistant-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8005, COPY ../shared
- backend/ai-assistant-service/requirements.txt (create)

**Dependencies:** Item 1  
**Validation:**  
- `docker build` for both services succeeds
- `curl http://localhost:8004/health` and `curl http://localhost:8005/health` return healthy
- All endpoints respond as per SPEC.md

**Role:** role-be (backend_developer)

---

### ITEM 5: Backend — ETL/Integration (Airflow DAGs for legacy DBs)

**Goal:**  
Implement ETL pipelines using Apache Airflow:
- DAGs to extract from legacy planning/execution DBs, transform, and load into PostgreSQL/S3
- Logging, error handling, healthcheck DAG
- Airflow Dockerfile and requirements

**Files to create:**
- backend/airflow/dags/etl_projects.py (create) — DAG for project data integration
- backend/airflow/dags/etl_budgets.py (create) — DAG for budget data integration
- backend/airflow/dags/etl_execution.py (create) — DAG for execution data integration
- backend/airflow/dags/healthcheck.py (create) — DAG for Airflow healthcheck
- backend/airflow/Dockerfile (create) — Airflow image, EXPOSE 8080
- backend/airflow/requirements.txt (create)

**Dependencies:** Item 1  
**Validation:**  
- `docker build -t airflow backend/airflow/` succeeds
- Airflow UI accessible at `localhost:8080`, DAGs listed and can be triggered

**Role:** role-be (backend_developer)

---

### ITEM 6: Frontend — UI/UX Contract Implementation (Next.js, Tailwind, Zustand, Chart.js)

**Goal:**  
Implement the entire frontend as per the UI/UX Design Implementation Contract and Figma:
- All screens, layouts, and components (dashboard, projects, budgets, forecasting, analytics, chat, explainability, admin)
- Use design tokens, spacing, colors, typography, radii, shadows, and interactions 1:1 with Figma
- Responsive layout as per contract (desktop-first, mobile optional)
- API client (Axios) for all backend endpoints
- State management (Zustand)
- Data visualization (Chart.js, React Table)
- All required pages/components/hooks as per contract

**Files to create:**
- frontend/package.json (create) — Next.js, Tailwind, Zustand, Chart.js, Axios, etc.
- frontend/tailwind.config.js (create) — Tailwind setup with design tokens
- frontend/src/main.tsx (create) — App entrypoint
- frontend/src/App.tsx (create) — App root, layout
- frontend/src/index.css (create) — Global styles, Tailwind base, Figma tokens
- frontend/src/shared/types.ts (create) — Frontend interfaces (from Item 1)
- frontend/src/shared/config.ts (create) — Frontend config/constants (from Item 1)
- frontend/src/components/Sidebar.tsx (create) — Sidebar navigation
- frontend/src/components/Header.tsx (create) — Header with project selector, notifications, profile
- frontend/src/components/KPICard.tsx (create) — KPI cards
- frontend/src/components/ProjectTable.tsx (create) — Projects table (React Table)
- frontend/src/components/BudgetTable.tsx (create) — Budget items table
- frontend/src/components/ForecastChart.tsx (create) — Forecasting chart (Chart.js)
- frontend/src/components/ExecutionChart.tsx (create) — Budget vs execution chart
- frontend/src/components/RiskPanel.tsx (create) — Risks panel
- frontend/src/components/RecommendationPanel.tsx (create) — Recommendations panel
- frontend/src/components/ChatPanel.tsx (create) — FinSight Assistant chat
- frontend/src/components/ExplainabilityPanel.tsx (create) — SHAP explainability
- frontend/src/components/ScenarioSimulator.tsx (create) — Scenario simulation
- frontend/src/components/Modal.tsx (create) — Modal (Headless UI)
- frontend/src/components/Tooltip.tsx (create) — Tooltip
- frontend/src/hooks/useApi.ts (create) — API client hooks (Axios)
- frontend/Dockerfile (create) — Multi-stage, non-root, Next.js 14, EXPOSE 3000

**Dependencies:** Item 1  
**Validation:**  
- `docker build -t frontend frontend/` succeeds
- App accessible at `http://localhost:3000`, all UI matches Figma 1:1
- All API calls work, data renders correctly, interactions/animations match contract

**Role:** role-fe (frontend_developer)

---

### ITEM 7: Infrastructure & Deployment (REQUIRED — PROJECT MUST RUN)

**Goal:**  
Complete Docker orchestration for all services and frontend:
- docker-compose.yml with all services, healthchecks, depends_on
- .env.example with all variables and descriptions
- .gitignore, .dockerignore for all relevant files
- run.sh for automated build/start/healthcheck
- README.md with setup, usage, endpoints
- docs/architecture.md with diagrams and component descriptions

**Files to create:**
- docker-compose.yml (create)
- .env.example (create)
- .gitignore (create)
- .dockerignore (create)
- run.sh (create)
- README.md (create)
- docs/architecture.md (create)

**Dependencies:** All previous items  
**Validation:**  
- `./run.sh` completes without errors
- All services report healthy
- Frontend accessible at `http://localhost:3000`
- All API endpoints functional

**Role:** role-devops (devops_support)

---