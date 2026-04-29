# DEVELOPMENT PLAN: Plataforma Inteligente para Gestión Financiera, Forecasting y Análisis de Proyectos con Inteligencia Artificial

## 1. ARCHITECTURE OVERVIEW

**Components:**
- **Frontend:** Next.js 14 (TypeScript, Tailwind CSS), implements the Figma UI/UX contract 1:1, including all dashboards, tables, charts, chat, and panels as described.
- **Backend:** Microservices in FastAPI (Python), each with its own Dockerfile:
  - Auth Service (user management, JWT, RBAC)
  - Project Service (projects, budgets, risks, recommendations)
  - Forecasting Service (Prophet/XGBoost/SHAP, scenario simulation)
  - Assistant Service (LLM chat, recommendations)
- **Shared:** All Pydantic/SQLAlchemy models in `shared/models.py`, TypeScript interfaces in `shared/types.ts`, shared config and utilities in both Python and TypeScript.
- **Database:** PostgreSQL 15 (schema defined in SQL), Redis for cache/session.
- **ETL:** Apache Airflow for data integration from legacy DBs to PostgreSQL/S3.
- **Infrastructure:** Docker Compose for local orchestration, AWS ECS/RDS/S3/ElastiCache for production.
- **CI/CD:** GitHub Actions, Trivy for security, blue-green deployment.

**Folder Structure:**
```
project-root/
├── frontend/
│   ├── src/
│   └── Dockerfile
├── backend/
│   ├── shared/
│   │   ├── models.py
│   │   ├── db.py
│   │   ├── auth.py
│   │   └── __init__.py
│   ├── auth-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── project-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── forecasting-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── assistant-service/
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── service.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
├── shared/
│   ├── types.ts
│   ├── config.ts
│   ├── utils.ts
│   ├── models.py
│   ├── config.py
│   └── __init__.py
├── docs/
│   └── architecture.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .dockerignore
├── run.sh
└── README.md
```

## 2. ACCEPTANCE CRITERIA

1. The platform runs locally via `./run.sh`, with all services healthy and accessible, including the frontend at `http://localhost:<PORT>`.
2. The frontend implements the Figma UI/UX contract 1:1, including all dashboards, tables, charts, chat, and panels, matching design tokens and layout.
3. All backend API endpoints specified in the SPEC.md are available, secured with JWT/RBAC, and return data conforming to the shared models.
4. Data flows from legacy DBs through Airflow ETL into PostgreSQL, enabling forecasting and analytics as described.
5. Forecasting and explainability endpoints (Prophet/XGBoost/SHAP) are functional and integrated with the frontend.
6. The chat assistant (LLM) is accessible from the frontend, responds to user queries, and provides recommendations and explanations as per the UI/UX contract.
7. All environment variables are validated on startup; health checks and structured logging are present in every service.
8. No manual steps are required beyond `./run.sh` for local setup; all infrastructure is orchestrated via Docker Compose.

---

## TEAM SCOPE (MANDATORY — PARSED BY THE PIPELINE)
Every executable item includes a role line at the end of the item block.

---

## 3. EXECUTABLE ITEMS

---

### ITEM 1: Foundation — shared types, interfaces, DB schemas, config

**Goal:** Create all shared code and configuration that other items will import. This includes:
- All Pydantic and SQLAlchemy models (User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPExplanation, enums) in `shared/models.py`
- TypeScript interfaces and enums in `shared/types.ts` for frontend type safety
- Shared config and utility modules for both Python and TypeScript
- Database schema in SQL for PostgreSQL, including all tables, indexes, and constraints
- Environment variable validation modules for both Python and TypeScript

**Files to create:**
- shared/models.py (create) — All Pydantic/SQLAlchemy models as per SPEC.md
- shared/config.py (create) — Python env validation, shared constants
- shared/types.ts (create) — All TypeScript interfaces/enums as per SPEC.md
- shared/config.ts (create) — TypeScript env validation, design tokens, constants
- shared/utils.ts (create) — Shared TypeScript utility functions (date formatting, etc.)
- backend/shared/db.py (create) — Shared DB connection logic (SQLAlchemy, asyncpg)
- backend/shared/auth.py (create) — Shared auth utilities (JWT, RBAC)
- backend/shared/__init__.py (create)
- backend/src/db/schema.sql (create) — Full PostgreSQL schema (tables, indexes, FKs) for all models

**Dependencies:** None

**Validation:** 
- All models importable from other backend services without error
- TypeScript interfaces importable in frontend
- `psql < backend/src/db/schema.sql` creates all tables and indexes without error

**Role:** role-tl (technical_lead)

---

### ITEM 2: Auth Service — JWT login, user management, RBAC

**Goal:** Implement the Auth Service as a FastAPI microservice, exposing all endpoints from SPEC.md:
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/users/
- POST /api/users/
- PATCH /api/users/{id}
- DELETE /api/users/{id}
- Enforce JWT authentication and RBAC on all endpoints
- Structured logging, health check, env validation

**Files to create:**
- backend/auth-service/main.py (create) — FastAPI app entrypoint (EXPOSE 8001), health check
- backend/auth-service/api.py (create) — All auth/user endpoints
- backend/auth-service/service.py (create) — Auth logic (JWT, password hashing, RBAC)
- backend/auth-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8001, CMD: uvicorn main:app --host 0.0.0.0 --port 8001
- backend/auth-service/requirements.txt (create) — All required Python libs (fastapi, sqlalchemy, pydantic, python-jose, passlib, redis, etc.)

**Dependencies:** Item 1

**Validation:** 
- `docker build` and `docker run` expose all endpoints, health check returns healthy, JWT/RBAC enforced

**Role:** role-be-auth (backend_developer)

---

### ITEM 3: Project Service — projects, budgets, risks, recommendations

**Goal:** Implement the Project Service as a FastAPI microservice, exposing all endpoints from SPEC.md:
- Project CRUD: GET/POST/PATCH/DELETE /api/projects/
- Budget versioning: GET/POST /api/projects/{project_id}/budgets/
- Budget items: GET /api/budgets/{budget_version_id}/items/, PATCH /api/budgets/items/{id}
- Risks: GET/POST/PATCH /api/projects/{project_id}/risks/, /api/risks/{id}
- Recommendations: GET/POST /api/projects/{project_id}/recommendations/
- Structured logging, health check, env validation

**Files to create:**
- backend/project-service/main.py (create) — FastAPI app entrypoint (EXPOSE 8002), health check
- backend/project-service/api.py (create) — All project, budget, risk, recommendation endpoints
- backend/project-service/service.py (create) — Business logic for all endpoints
- backend/project-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8002, CMD: uvicorn main:app --host 0.0.0.0 --port 8002
- backend/project-service/requirements.txt (create) — All required Python libs (fastapi, sqlalchemy, pydantic, redis, etc.)

**Dependencies:** Item 1

**Validation:** 
- `docker build` and `docker run` expose all endpoints, health check returns healthy, endpoints return correct data

**Role:** role-be-project (backend_developer)

---

### ITEM 4: Forecasting Service — Prophet/XGBoost/SHAP, scenario simulation

**Goal:** Implement the Forecasting Service as a FastAPI microservice, exposing all endpoints from SPEC.md:
- GET/POST /api/projects/{project_id}/forecast/ (scenario simulation)
- GET /api/forecast/{forecast_scenario_id}/shap/ (SHAP explainability)
- Integrate Prophet, XGBoost, SHAP for forecasting and explainability
- Structured logging, health check, env validation

**Files to create:**
- backend/forecasting-service/main.py (create) — FastAPI app entrypoint (EXPOSE 8003), health check
- backend/forecasting-service/api.py (create) — Forecast and SHAP endpoints
- backend/forecasting-service/service.py (create) — ML logic (Prophet, XGBoost, SHAP)
- backend/forecasting-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8003, CMD: uvicorn main:app --host 0.0.0.0 --port 8003
- backend/forecasting-service/requirements.txt (create) — All required Python libs (fastapi, prophet, xgboost, shap, etc.)

**Dependencies:** Item 1

**Validation:** 
- `docker build` and `docker run` expose all endpoints, health check returns healthy, forecasting and SHAP endpoints return correct data

**Role:** role-be-forecast (backend_developer)

---

### ITEM 5: Assistant Service — LLM chat, recommendations

**Goal:** Implement the Assistant Service as a FastAPI microservice, exposing all endpoints from SPEC.md:
- GET/POST /api/projects/{project_id}/chat/ (chat history, send message)
- Integrate with GPT-4 or Llama 3 for LLM responses
- Structured logging, health check, env validation

**Files to create:**
- backend/assistant-service/main.py (create) — FastAPI app entrypoint (EXPOSE 8004), health check
- backend/assistant-service/api.py (create) — Chat endpoints
- backend/assistant-service/service.py (create) — LLM integration logic
- backend/assistant-service/Dockerfile (create) — Multi-stage, non-root, EXPOSE 8004, CMD: uvicorn main:app --host 0.0.0.0 --port 8004
- backend/assistant-service/requirements.txt (create) — All required Python libs (fastapi, openai, llama-cpp, etc.)

**Dependencies:** Item 1

**Validation:** 
- `docker build` and `docker run` expose all endpoints, health check returns healthy, chat endpoint returns LLM responses

**Role:** role-be-assistant (backend_developer)

---

### ITEM 6: ETL/Integration — Airflow DAGs for legacy DB sync

**Goal:** Implement ETL pipelines using Apache Airflow to:
- Extract data from legacy planning and execution DBs
- Transform and load into PostgreSQL and S3 as per architecture
- DAGs for regular sync, error handling, logging
- Health check endpoint for Airflow webserver

**Files to create:**
- backend/etl/airflow/dags/etl_projects.py (create) — DAG for projects sync
- backend/etl/airflow/dags/etl_budgets.py (create) — DAG for budgets sync
- backend/etl/airflow/dags/etl_execution.py (create) — DAG for execution data sync
- backend/etl/airflow/Dockerfile (create) — Airflow image, EXPOSE 8080, CMD: airflow webserver
- backend/etl/airflow/requirements.txt (create) — airflow, psycopg2, etc.

**Dependencies:** Item 1

**Validation:** 
- Airflow webserver runs, DAGs visible and triggerable, data loads into PostgreSQL/S3

**Role:** role-be-etl (backend_developer)

---

### ITEM 7: Frontend — Next.js 14 app implementing UI/UX contract 1:1

**Goal:** Implement the entire frontend as a Next.js 14 (TypeScript, Tailwind CSS) app, faithfully reproducing the Figma UI/UX contract:
- Sidebar (Strategic Navy), header, main area, right IA panel (FinSight Assistant)
- Dashboard: project selector, KPI cards, budget vs execution chart, forecasting chart, phases table, risks panel, IA recommendations, chat, SHAP explainability
- Projects list: search/filter, table, create project (chat-assisted)
- Budget detail: version selector, table, compare versions, save baseline, download report
- Forecasting: scenario simulation, confidence bands, explainability
- Chat: full panel, history, suggestions
- Admin: user management, connectors, logs
- All design tokens (colors, typography, spacing, radii, shadows) as per contract
- Responsive behavior as specified (desktop-first, mobile optional)
- API client/hooks for all backend endpoints, using React Query and Zustand for state
- Structured logging, env validation, health check endpoint

**Files to create:**
- frontend/package.json (create) — Next.js 14, TypeScript, Tailwind CSS, React Query, Zustand, Chart.js, Headless UI, Heroicons, Axios, ESLint, Prettier
- frontend/tsconfig.json (create) — TypeScript config, strict mode
- frontend/tailwind.config.js (create) — Tailwind config with design tokens
- frontend/postcss.config.js (create) — PostCSS config
- frontend/src/main.tsx (create) — App entrypoint
- frontend/src/App.tsx (create) — Root layout, routing, providers
- frontend/src/index.css (create) — Global styles, Tailwind base, design tokens
- frontend/src/components/Sidebar.tsx (create) — Sidebar navigation
- frontend/src/components/Header.tsx (create) — Header with project selector, notifications, profile
- frontend/src/components/KPICard.tsx (create) — KPI card component
- frontend/src/components/ChartBudgetVsExecution.tsx (create) — Budget vs execution chart (Chart.js)
- frontend/src/components/ChartForecast.tsx (create) — Forecasting chart with confidence band
- frontend/src/components/PhasesTable.tsx (create) — Table of phases/partidas
- frontend/src/components/RisksPanel.tsx (create) — Risks panel
- frontend/src/components/RecommendationsPanel.tsx (create) — IA recommendations panel
- frontend/src/components/ChatPanel.tsx (create) — Chat with FinSight Assistant
- frontend/src/components/SHAPExplanation.tsx (create) — SHAP explainability module
- frontend/src/components/ProjectList.tsx (create) — Projects table, search/filter, create project
- frontend/src/components/BudgetDetail.tsx (create) — Budget version selector, table, compare, baseline, download
- frontend/src/components/ForecastSimulator.tsx (create) — Scenario simulation, explainability
- frontend/src/components/AdminPanel.tsx (create) — User management, connectors, logs
- frontend/src/hooks/useApi.ts (create) — API client (Axios), React Query hooks for all endpoints
- frontend/Dockerfile (create) — Multi-stage, non-root, Next.js 14, EXPOSE 3000, CMD: npm run start

**Dependencies:** Item 1

**Validation:** 
- `docker build` and `docker run` serve the app at `http://localhost:3000`
- UI matches Figma contract 1:1 (visual regression), all API calls functional

**Role:** role-fe (frontend_developer)

---

### ITEM 8: Infrastructure & Deployment (REQUIRED — PROJECT MUST RUN)

**Goal:** Complete Docker orchestration for all services and frontend, zero manual steps:
- docker-compose.yml: all services (frontend, backend microservices, Airflow, PostgreSQL, Redis), healthchecks, depends_on with service_healthy
- .env.example: all required variables, descriptions, example values
- .gitignore: exclude node_modules, dist, .env, __pycache__, *.pyc, etc.
- .dockerignore: exclude node_modules, .git, *.log, dist
- run.sh: validates Docker, builds, starts, waits for healthy, prints access URL
- README.md: prerequisites, clone, run, endpoints, troubleshooting
- docs/architecture.md: system diagram, component descriptions

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
- `./run.sh` completes without errors, all services report healthy, web app accessible at localhost:3000, all API endpoints respond correctly

**Role:** role-devops (devops_support)

---