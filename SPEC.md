# SPEC.md

## 1. TECHNOLOGY STACK

**Frontend:**
- Next.js 14.1.0 (React 18.2.0, App Router)
- TypeScript 5.4.x
- Tailwind CSS 3.4.x
- React Query 5.x
- Zustand 4.x (state management)
- Axios 1.x (API client)
- Chart.js 4.x (data visualization)
- date-fns 3.x (date utilities)
- Headless UI 1.7.x (modals, dropdowns)
- Heroicons 2.x (icons)
- ESLint, Prettier

**Backend:**
- Python 3.11
- FastAPI 0.110.x
- Pydantic 2.7.x
- SQLAlchemy 2.x
- asyncpg 0.29.x
- Redis-py 5.x
- Celery 5.x (background tasks)
- Apache Airflow 2.9.x (ETL orchestration)
- Prophet 1.1.x (forecasting)
- XGBoost 2.x (ML)
- SHAP 0.45.x (explainability)
- OpenAI GPT-4 API or Llama 3 (LLM integration)
- Uvicorn 0.29.x (ASGI server)
- Gunicorn 21.x (production server)
- PostgreSQL 15 (AWS RDS)
- Redis 7.x (AWS ElastiCache)
- AWS S3 (historical data, model storage)
- Docker 26.x
- docker-compose 2.x

**Infrastructure:**
- AWS ECS (Fargate)
- AWS RDS (PostgreSQL 15)
- AWS S3
- AWS ElastiCache (Redis)
- Terraform 1.7.x (infra as code)
- GitHub Actions (CI/CD)
- Trivy (security scanning)
- Prometheus, Grafana, CloudWatch (monitoring)

---

## 2. DATA CONTRACTS

### Python (Pydantic) Models

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime

class User(BaseModel):
    id: int
    email: str
    full_name: str
    role: Literal["admin", "manager", "analyst", "viewer"]
    is_active: bool
    created_at: datetime

class Project(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: Literal["activo", "en_ejecucion", "finalizado", "cancelado"]
    budget_total: float
    execution_total: float
    deviation: float
    start_date: date
    end_date: Optional[date]
    owner_id: int
    created_at: datetime

class BudgetVersion(BaseModel):
    id: int
    project_id: int
    version: int
    created_at: datetime
    is_baseline: bool
    items: List["BudgetItem"]

class BudgetItem(BaseModel):
    id: int
    budget_version_id: int
    name: str
    phase: str
    amount_planned: float
    amount_executed: float
    deviation: float
    status: Literal["pendiente", "en_progreso", "completado", "revisar"]
    created_at: datetime

class ForecastScenario(BaseModel):
    id: int
    project_id: int
    scenario: Literal["optimista", "esperado", "critico"]
    forecast_date: date
    forecast_value: float
    lower_bound: float
    upper_bound: float
    created_at: datetime

class Risk(BaseModel):
    id: int
    project_id: int
    description: str
    impact: Literal["bajo", "medio", "alto"]
    probability: float
    mitigation: Optional[str]
    status: Literal["abierto", "mitigado", "cerrado"]
    created_at: datetime

class Recommendation(BaseModel):
    id: int
    project_id: int
    text: str
    source: Literal["ia", "manual"]
    created_at: datetime

class ChatMessage(BaseModel):
    id: int
    project_id: int
    sender: Literal["user", "assistant"]
    message: str
    timestamp: datetime

class SHAPExplanation(BaseModel):
    id: int
    project_id: int
    forecast_scenario_id: int
    feature_importances: dict[str, float]
    created_at: datetime
```

### TypeScript Interfaces

```typescript
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "analyst" | "viewer";
  is_active: boolean;
  created_at: string; // ISO datetime
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "activo" | "en_ejecucion" | "finalizado" | "cancelado";
  budget_total: number;
  execution_total: number;
  deviation: number;
  start_date: string; // ISO date
  end_date?: string; // ISO date
  owner_id: number;
  created_at: string; // ISO datetime
}

export interface BudgetVersion {
  id: number;
  project_id: number;
  version: number;
  created_at: string; // ISO datetime
  is_baseline: boolean;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: number;
  budget_version_id: number;
  name: string;
  phase: string;
  amount_planned: number;
  amount_executed: number;
  deviation: number;
  status: "pendiente" | "en_progreso" | "completado" | "revisar";
  created_at: string; // ISO datetime
}

export interface ForecastScenario {
  id: number;
  project_id: number;
  scenario: "optimista" | "esperado" | "critico";
  forecast_date: string; // ISO date
  forecast_value: number;
  lower_bound: number;
  upper_bound: number;
  created_at: string; // ISO datetime
}

export interface Risk {
  id: number;
  project_id: number;
  description: string;
  impact: "bajo" | "medio" | "alto";
  probability: number;
  mitigation?: string;
  status: "abierto" | "mitigado" | "cerrado";
  created_at: string; // ISO datetime
}

export interface Recommendation {
  id: number;
  project_id: number;
  text: string;
  source: "ia" | "manual";
  created_at: string; // ISO datetime
}

export interface ChatMessage {
  id: number;
  project_id: number;
  sender: "user" | "assistant";
  message: string;
  timestamp: string; // ISO datetime
}

export interface SHAPExplanation {
  id: number;
  project_id: number;
  forecast_scenario_id: number;
  feature_importances: Record<string, number>;
  created_at: string; // ISO datetime
}
```

---

## 3. API ENDPOINTS

### Auth Service

- **POST /api/auth/login**
  - Request: `{ email: string, password: string }`
  - Response: `{ access_token: string, token_type: "bearer", user: User }`

- **POST /api/auth/logout**
  - Request: `{}`
  - Response: `{ success: boolean }`

- **GET /api/auth/me**
  - Response: `User`

### User Management

- **GET /api/users/**
  - Response: `User[]`

- **POST /api/users/**
  - Request: `{ email: string, full_name: string, role: string, password: string }`
  - Response: `User`

- **PATCH /api/users/{id}**
  - Request: `{ full_name?: string, role?: string, is_active?: boolean }`
  - Response: `User`

- **DELETE /api/users/{id}**
  - Response: `{ success: boolean }`

### Project Service

- **GET /api/projects/**
  - Query: `?search=&status=`
  - Response: `Project[]`

- **POST /api/projects/**
  - Request: `{ name: string, description?: string, start_date: string, end_date?: string }`
  - Response: `Project`

- **GET /api/projects/{id}**
  - Response: `Project`

- **PATCH /api/projects/{id}**
  - Request: `{ name?: string, description?: string, status?: string, end_date?: string }`
  - Response: `Project`

- **DELETE /api/projects/{id}**
  - Response: `{ success: boolean }`

### Budget Service

- **GET /api/projects/{project_id}/budgets/**
  - Response: `BudgetVersion[]`

- **POST /api/projects/{project_id}/budgets/**
  - Request: `{ version: number, is_baseline: boolean, items: BudgetItem[] }`
  - Response: `BudgetVersion`

- **GET /api/budgets/{budget_version_id}/items/**
  - Response: `BudgetItem[]`

- **PATCH /api/budgets/items/{id}**
  - Request: `{ amount_planned?: number, amount_executed?: number, status?: string }`
  - Response: `BudgetItem`

### Forecasting Service

- **GET /api/projects/{project_id}/forecast/**
  - Query: `?scenario=optimista|esperado|critico`
  - Response: `ForecastScenario[]`

- **POST /api/projects/{project_id}/forecast/**
  - Request: `{ scenario: string, parameters: dict }`
  - Response: `ForecastScenario`

- **GET /api/forecast/{forecast_scenario_id}/shap/**
  - Response: `SHAPExplanation`

### Risk & Recommendation Service

- **GET /api/projects/{project_id}/risks/**
  - Response: `Risk[]`

- **POST /api/projects/{project_id}/risks/**
  - Request: `{ description: string, impact: string, probability: number, mitigation?: string }`
  - Response: `Risk`

- **PATCH /api/risks/{id}**
  - Request: `{ status?: string, mitigation?: string }`
  - Response: `Risk`

- **GET /api/projects/{project_id}/recommendations/**
  - Response: `Recommendation[]`

- **POST /api/projects/{project_id}/recommendations/**
  - Request: `{ text: string, source: string }`
  - Response: `Recommendation`

### Chat/Assistant Service

- **GET /api/projects/{project_id}/chat/**
  - Response: `ChatMessage[]`

- **POST /api/projects/{project_id}/chat/**
  - Request: `{ message: string }`
  - Response: `ChatMessage`

---

## 4. FILE STRUCTURE

```
.
├── docker-compose.yml                # Multi-service orchestration (frontend, backend, db, redis, airflow)
├── .env.example                      # Template for all required environment variables
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
├── run.sh                            # Root startup script
├── backend/
│   ├── shared/                       # Shared Python modules (models, utils, schemas)
│   │   ├── models.py                 # Shared Pydantic models
│   │   ├── db.py                     # Shared DB connection logic
│   │   ├── auth.py                   # Shared auth utilities
│   │   └── __init__.py
│   ├── auth-service/
│   │   ├── main.py                   # FastAPI app entrypoint (EXPOSE 8001)
│   │   ├── api.py                    # Auth/user endpoints
│   │   ├── service.py                # Auth logic
│   │   ├── Dockerfile                # Auth service Dockerfile (EXPOSE 8001)
│   │   └── requirements.txt
│   ├── project-service/
│   │   ├── main.py                   # FastAPI app entrypoint (EXPOSE 8002)
│   │   ├── api.py                    # Project, budget, risk, recommendation endpoints
│   │   ├── service.py                # Business logic
│   │   ├── Dockerfile                # Project service Dockerfile (EXPOSE 8002)
│   │   └── requirements.txt
│   ├── forecasting-service/
│   │   ├── main.py                   # FastAPI app entrypoint (EXPOSE 8003)
│   │   ├── api.py                    # Forecast, SHAP endpoints
│   │   ├── service.py                # ML logic (Prophet, XGBoost, SHAP)
│   │   ├── Dockerfile                # Forecasting service Dockerfile (EXPOSE 8003)
│   │   └── requirements.txt
│   ├── assistant-service/
│   │   ├── main.py                   # FastAPI app entrypoint (EXPOSE 8004)
│   │   ├── api.py                    # Chat endpoints (LLM)
│   │   ├── service.py                # LLM integration logic
│   │   ├── Dockerfile                # Assistant service Dockerfile (EXPOSE 8004)
│   │   └── requirements.txt
│   ├── airflow/
│   │   ├── dags/
│   │   │   └── etl_pipeline.py       # ETL DAGs for data ingestion
│   │   ├── Dockerfile                # Airflow Dockerfile (EXPOSE 8080)
│   │   └── requirements.txt
│   └── start.sh                      # Backend startup script
├── frontend/
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── next.config.js                # Next.js config
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.tsx                  # Entry point (Next.js custom _app)
│   │   ├── App.tsx                   # Root app shell (layout)
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts        # Auth state/query hook
│   │   │   │   ├── useProjects.ts    # Project list/query hook
│   │   │   │   ├── useBudgets.ts     # Budget/versions hook
│   │   │   │   ├── useForecast.ts    # Forecast/scenario hook
│   │   │   │   ├── useRisks.ts       # Risks hook
│   │   │   │   ├── useRecommendations.ts # Recommendations hook
│   │   │   │   ├── useChat.ts        # Chat/assistant hook
│   │   │   │   ├── useSHAP.ts        # SHAP explainability hook
│   │   │   │   └── index.ts
│   │   ├── state/
│   │   │   ├── authStore.ts          # Zustand auth store
│   │   │   ├── projectStore.ts       # Zustand project store
│   │   │   ├── uiStore.ts            # Sidebar, modal, panel state
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── Sidebar.tsx           # Main navigation sidebar
│   │   │   ├── Header.tsx            # Top header bar
│   │   │   ├── ProjectSelector.tsx   # Project dropdown
│   │   │   ├── KpiCard.tsx           # KPI card
│   │   │   ├── DataTable.tsx         # Generic sortable/filterable table
│   │   │   ├── LineChart.tsx         # Budget vs execution chart
│   │   │   ├── ForecastChart.tsx     # Forecast chart with confidence band
│   │   │   ├── RiskPanel.tsx         # Risks panel
│   │   │   ├── RecommendationPanel.tsx # IA recommendations panel
│   │   │   ├── ChatPanel.tsx         # FinSight Assistant chat panel
│   │   │   ├── SHAPExplanation.tsx   # Explainability module
│   │   │   ├── ScenarioSimulator.tsx # Scenario simulation module
│   │   │   ├── BudgetForm.tsx        # Budget version form
│   │   │   ├── Modal.tsx             # Modal dialog
│   │   │   ├── Tooltip.tsx           # Tooltip component
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── index.tsx             # Dashboard page
│   │   │   ├── projects.tsx          # Projects list page
│   │   │   ├── project/[id].tsx      # Project detail page
│   │   │   ├── budget/[id].tsx       # Budget detail/versioning page
│   │   │   ├── analytics.tsx         # Analytics dashboards
│   │   │   ├── forecasting.tsx       # Forecasting scenarios
│   │   │   ├── reports.tsx           # Reports page
│   │   │   ├── admin.tsx             # Admin/configuration page
│   │   │   └── _app.tsx              # Next.js custom app
│   │   ├── styles/
│   │   │   ├── globals.css           # Tailwind base styles
│   │   │   └── tokens.css            # Design tokens (colors, typography)
│   │   └── utils/
│   │       ├── formatters.ts         # Date/number formatting
│   │       └── constants.ts          # App-wide constants
│   └── Dockerfile                    # Frontend Dockerfile (EXPOSE 3000)
│   └── start.sh                      # Frontend startup script
```

### PORT TABLE

| Service              | Listening Port | Path                        |
|----------------------|---------------|-----------------------------|
| auth-service         | 8001          | backend/auth-service/       |
| project-service      | 8002          | backend/project-service/    |
| forecasting-service  | 8003          | backend/forecasting-service/|
| assistant-service    | 8004          | backend/assistant-service/  |
| airflow              | 8080          | backend/airflow/            |

### SHARED MODULES

| Shared path         | Imported by services                                 |
|---------------------|-----------------------------------------------------|
| backend/shared/     | auth-service, project-service, forecasting-service, assistant-service |

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type    | Description                                             | Example Value                           |
|-----------------------------|---------|---------------------------------------------------------|-----------------------------------------|
| POSTGRES_HOST               | string  | PostgreSQL host (RDS endpoint)                          | db.example.com                          |
| POSTGRES_PORT               | int     | PostgreSQL port                                         | 5432                                    |
| POSTGRES_DB                 | string  | PostgreSQL database name                                | fin_platform                            |
| POSTGRES_USER               | string  | PostgreSQL username                                     | admin                                   |
| POSTGRES_PASSWORD           | string  | PostgreSQL password                                     | secretpw                                |
| REDIS_HOST                  | string  | Redis host (ElastiCache endpoint)                       | redis.example.com                       |
| REDIS_PORT                  | int     | Redis port                                              | 6379                                    |
| REDIS_PASSWORD              | string  | Redis password (if set)                                 | ""                                      |
| JWT_SECRET                  | string  | JWT signing secret                                      | supersecretkey                          |
| JWT_EXPIRE_MINUTES          | int     | JWT expiration in minutes                               | 60                                      |
| AWS_ACCESS_KEY_ID           | string  | AWS access key for S3                                   | AKIA...                                 |
| AWS_SECRET_ACCESS_KEY       | string  | AWS secret key for S3                                   | ...                                     |
| AWS_REGION                  | string  | AWS region                                              | us-east-1                               |
| S3_BUCKET                   | string  | S3 bucket for data/models                               | fin-platform-data                       |
| AIRFLOW__CORE__SQL_ALCHEMY_CONN | string | Airflow DB connection string                        | postgresql+psycopg2://...               |
| AIRFLOW__CORE__FERNET_KEY   | string  | Airflow Fernet key                                      | ...                                     |
| OPENAI_API_KEY              | string  | OpenAI GPT-4 API key (if using GPT-4)                   | sk-...                                  |
| LLAMA3_API_URL              | string  | Llama 3 API endpoint (if using Llama 3)                 | https://llama3.example.com/v1/chat      |
| LLM_PROVIDER                | string  | LLM provider: "openai" or "llama3"                      | openai                                  |
| CELERY_BROKER_URL           | string  | Celery broker URL (Redis)                               | redis://:password@redis.example.com:6379/0 |
| CELERY_RESULT_BACKEND       | string  | Celery result backend (Redis)                           | redis://:password@redis.example.com:6379/1 |
| FRONTEND_URL                | string  | Public frontend URL                                     | https://fin-platform.example.com        |
| API_GATEWAY_URL             | string  | API Gateway base URL                                    | https://api.fin-platform.example.com    |

---

## 6. IMPORT CONTRACTS

### Backend (Python)

- `from shared.models import User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPExplanation`
- `from shared.db import get_db_session, Base`
- `from shared.auth import get_current_user, create_access_token, verify_password, hash_password`
- `from auth-service.api import login, logout, get_me, create_user, update_user, delete_user`
- `from project-service.api import list_projects, create_project, get_project, update_project, delete_project, list_budgets, create_budget, list_budget_items, update_budget_item, list_risks, create_risk, update_risk, list_recommendations, create_recommendation`
- `from forecasting-service.api import get_forecast, create_forecast, get_shap_explanation`
- `from assistant-service.api import list_chat_messages, create_chat_message`

### Frontend (TypeScript/React)

- `import { User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPExplanation } from '@/api/types'`
- `import { useAuth } from '@/api/hooks/useAuth'`
- `import { useProjects } from '@/api/hooks/useProjects'`
- `import { useBudgets } from '@/api/hooks/useBudgets'`
- `import { useForecast } from '@/api/hooks/useForecast'`
- `import { useRisks } from '@/api/hooks/useRisks'`
- `import { useRecommendations } from '@/api/hooks/useRecommendations'`
- `import { useChat } from '@/api/hooks/useChat'`
- `import { useSHAP } from '@/api/hooks/useSHAP'`
- `import { authStore } from '@/state/authStore'`
- `import { projectStore } from '@/state/projectStore'`
- `import { uiStore } from '@/state/uiStore'`
- `import Sidebar from '@/components/Sidebar'`
- `import Header from '@/components/Header'`
- `import ProjectSelector from '@/components/ProjectSelector'`
- `import KpiCard from '@/components/KpiCard'`
- `import DataTable from '@/components/DataTable'`
- `import LineChart from '@/components/LineChart'`
- `import ForecastChart from '@/components/ForecastChart'`
- `import RiskPanel from '@/components/RiskPanel'`
- `import RecommendationPanel from '@/components/RecommendationPanel'`
- `import ChatPanel from '@/components/ChatPanel'`
- `import SHAPExplanation from '@/components/SHAPExplanation'`
- `import ScenarioSimulator from '@/components/ScenarioSimulator'`
- `import BudgetForm from '@/components/BudgetForm'`
- `import Modal from '@/components/Modal'`
- `import Tooltip from '@/components/Tooltip'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Shared State Primitives

#### Zustand Stores

- `authStore` → { user, isAuthenticated, login, logout, loading, error }
- `projectStore` → { projects, selectedProject, setSelectedProject, fetchProjects, loading, error }
- `uiStore` → { sidebarOpen, setSidebarOpen, chatPanelOpen, setChatPanelOpen, modalOpen, setModalOpen }

#### React Query Hooks

- `useAuth()` → { user, isAuthenticated, login, logout, loading, error }
- `useProjects()` → { projects, fetchProjects, createProject, updateProject, deleteProject, loading, error }
- `useBudgets(projectId)` → { budgets, fetchBudgets, createBudget, updateBudgetItem, loading, error }
- `useForecast(projectId, scenario)` → { forecast, fetchForecast, createForecast, loading, error }
- `useRisks(projectId)` → { risks, fetchRisks, createRisk, updateRisk, loading, error }
- `useRecommendations(projectId)` → { recommendations, fetchRecommendations, createRecommendation, loading, error }
- `useChat(projectId)` → { messages, fetchMessages, sendMessage, loading, error }
- `useSHAP(forecastScenarioId)` → { explanation, fetchExplanation, loading, error }

### Component Props/Inputs

- `Sidebar` props: { currentPage: string, onNavigate: (page: string) => void }
- `Header` props: { user: User, onLogout: () => void, onProjectChange: (projectId: number) => void }
- `ProjectSelector` props: { projects: Project[], selectedProjectId: number, onSelect: (id: number) => void }
- `KpiCard` props: { title: string, value: number | string, trend?: "up" | "down" | "neutral", color: string }
- `DataTable<T>` props: { columns: ColumnDef<T>[], data: T[], loading: boolean, onRowClick?: (row: T) => void }
- `LineChart` props: { data: { date: string, planned: number, executed: number }[], width?: number, height?: number }
- `ForecastChart` props: { data: ForecastScenario[], scenario: "optimista" | "esperado" | "critico" }
- `RiskPanel` props: { risks: Risk[], onMitigate: (id: number) => void }
- `RecommendationPanel` props: { recommendations: Recommendation[] }
- `ChatPanel` props: { messages: ChatMessage[], onSend: (msg: string) => void, loading: boolean }
- `SHAPExplanation` props: { explanation: SHAPExplanation }
- `ScenarioSimulator` props: { scenarios: ForecastScenario[], onSimulate: (params: any) => void }
- `BudgetForm` props: { budget?: BudgetVersion, onSubmit: (data: BudgetVersion) => void, loading: boolean }
- `Modal` props: { open: boolean, title: string, children: React.ReactNode, onClose: () => void }
- `Tooltip` props: { content: string, children: React.ReactNode }

### Page Hierarchy

- `/` (Dashboard): Sidebar, Header, ProjectSelector, KpiCard[], LineChart, ForecastChart, DataTable (phases), RiskPanel, RecommendationPanel, ChatPanel, SHAPExplanation
- `/projects`: Sidebar, Header, DataTable (projects), ProjectSelector, Modal (create project)
- `/project/[id]`: Sidebar, Header, ProjectSelector, KpiCard[], DataTable (budget items), RiskPanel, RecommendationPanel, ChatPanel
- `/budget/[id]`: Sidebar, Header, BudgetForm, DataTable (budget items), Modal (compare versions)
- `/analytics`: Sidebar, Header, DataTable (analytics), LineChart, ForecastChart
- `/forecasting`: Sidebar, Header, ScenarioSimulator, ForecastChart, SHAPExplanation
- `/reports`: Sidebar, Header, DataTable (reports), Modal (export)
- `/admin`: Sidebar, Header, DataTable (users), DataTable (connectors), DataTable (logs)

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` (TypeScript React).
- The project is TypeScript-only (no `.js` or `.jsx` files).
- Entry point: `/frontend/src/main.tsx` (referenced in Next.js as custom `_app`).
- All backend Python files use `.py`.
- All configuration files use their standard extensions (`.yml`, `.env.example`, `.json`, `.js`, `.css`).
- No mixing of JavaScript and TypeScript in frontend.
- All React components, hooks, and state files use `.tsx` or `.ts` as appropriate.