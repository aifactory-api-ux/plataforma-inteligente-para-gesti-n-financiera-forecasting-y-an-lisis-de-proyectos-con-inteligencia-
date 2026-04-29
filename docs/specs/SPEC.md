# SPEC.md

## 1. TECHNOLOGY STACK

**Frontend:**
- Next.js 14.1.0
- React 18.2.0
- TypeScript 5.4.x
- Tailwind CSS 3.4.x
- Zustand 4.4.x (state management)
- Axios 1.6.x (API client)
- Chart.js 4.4.x (data visualization)
- React Table 7.8.x (data tables)
- Headless UI 1.7.x (modals, dropdowns)
- Heroicons 2.1.x (icons)
- date-fns 3.6.x (date utilities)

**Backend:**
- Python 3.11
- FastAPI 0.110.x
- Pydantic 2.7.x
- SQLAlchemy 2.0.x
- asyncpg 0.29.x
- Redis-py 5.0.x
- Celery 5.4.x
- Apache Airflow 2.9.x
- Prophet 1.1.x
- XGBoost 2.0.x
- SHAP 0.45.x
- OpenAI 1.23.x (GPT-4 integration)
- llama-cpp-python 0.2.x (Llama 3 integration)
- boto3 1.34.x (AWS S3)
- psycopg2-binary 2.9.x

**Database/Infrastructure:**
- PostgreSQL 15
- Redis 7.x
- Docker 26.x
- docker-compose 2.25.x
- AWS ECS, RDS, S3

---

## 2. DATA CONTRACTS

### Python (Pydantic Models)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, date

class User(BaseModel):
    id: int
    email: str
    full_name: str
    role: Literal["admin", "analyst", "manager"]
    is_active: bool
    created_at: datetime

class Project(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: Literal["active", "archived", "draft"]
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
    status: Literal["on_track", "warning", "over_budget"]
    deviation: float

class ForecastScenario(BaseModel):
    id: int
    project_id: int
    scenario: Literal["optimistic", "expected", "critical"]
    forecast_date: date
    forecast_value: float
    confidence_lower: float
    confidence_upper: float
    generated_at: datetime

class Risk(BaseModel):
    id: int
    project_id: int
    description: str
    probability: float
    impact: float
    status: Literal["open", "mitigated", "closed"]
    created_at: datetime

class Recommendation(BaseModel):
    id: int
    project_id: int
    text: str
    source: Literal["ai", "manual"]
    created_at: datetime

class ChatMessage(BaseModel):
    id: int
    project_id: int
    sender: Literal["user", "assistant"]
    message: str
    timestamp: datetime

class SHAPFeatureImportance(BaseModel):
    feature: str
    importance: float

class ForecastExplainability(BaseModel):
    scenario_id: int
    shap_values: List[SHAPFeatureImportance]
    summary: str
```

### TypeScript (Frontend Interfaces)

```typescript
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "analyst" | "manager";
  is_active: boolean;
  created_at: string; // ISO datetime
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "active" | "archived" | "draft";
  budget_total: number;
  execution_total: number;
  deviation: number;
  start_date: string; // ISO date
  end_date?: string;  // ISO date
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
  status: "on_track" | "warning" | "over_budget";
  deviation: number;
}

export interface ForecastScenario {
  id: number;
  project_id: number;
  scenario: "optimistic" | "expected" | "critical";
  forecast_date: string; // ISO date
  forecast_value: number;
  confidence_lower: number;
  confidence_upper: number;
  generated_at: string; // ISO datetime
}

export interface Risk {
  id: number;
  project_id: number;
  description: string;
  probability: number;
  impact: number;
  status: "open" | "mitigated" | "closed";
  created_at: string; // ISO datetime
}

export interface Recommendation {
  id: number;
  project_id: number;
  text: string;
  source: "ai" | "manual";
  created_at: string; // ISO datetime
}

export interface ChatMessage {
  id: number;
  project_id: number;
  sender: "user" | "assistant";
  message: string;
  timestamp: string; // ISO datetime
}

export interface SHAPFeatureImportance {
  feature: string;
  importance: number;
}

export interface ForecastExplainability {
  scenario_id: number;
  shap_values: SHAPFeatureImportance[];
  summary: string;
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

### Project Service

- **GET /api/projects**
  - Query: `?search=string&status=string`
  - Response: `{ projects: Project[] }`

- **POST /api/projects**
  - Request: `{ name: string, description?: string, start_date: string, end_date?: string }`
  - Response: `Project`

- **GET /api/projects/{project_id}**
  - Response: `Project`

- **PUT /api/projects/{project_id}**
  - Request: `{ name?: string, description?: string, status?: string, start_date?: string, end_date?: string }`
  - Response: `Project`

- **DELETE /api/projects/{project_id}**
  - Response: `{ success: boolean }`

### Budget Service

- **GET /api/projects/{project_id}/budgets**
  - Response: `{ versions: BudgetVersion[] }`

- **POST /api/projects/{project_id}/budgets**
  - Request: `{ items: { name: string, phase: string, amount_planned: number }[] }`
  - Response: `BudgetVersion`

- **GET /api/budgets/{budget_version_id}**
  - Response: `BudgetVersion`

- **POST /api/budgets/{budget_version_id}/baseline**
  - Request: `{}`
  - Response: `{ success: boolean }`

### Forecasting Service

- **GET /api/projects/{project_id}/forecast**
  - Response: `{ scenarios: ForecastScenario[] }`

- **POST /api/projects/{project_id}/forecast/simulate**
  - Request: `{ scenario: "optimistic" | "expected" | "critical" }`
  - Response: `ForecastScenario`

- **GET /api/forecast/{scenario_id}/explainability**
  - Response: `ForecastExplainability`

### Risk & Recommendation Service

- **GET /api/projects/{project_id}/risks**
  - Response: `{ risks: Risk[] }`

- **POST /api/projects/{project_id}/risks**
  - Request: `{ description: string, probability: number, impact: number }`
  - Response: `Risk`

- **GET /api/projects/{project_id}/recommendations**
  - Response: `{ recommendations: Recommendation[] }`

### Chat/AI Assistant Service

- **GET /api/projects/{project_id}/chat**
  - Response: `{ messages: ChatMessage[] }`

- **POST /api/projects/{project_id}/chat**
  - Request: `{ message: string }`
  - Response: `{ reply: string, message: ChatMessage }`

### Analytics & Reports

- **GET /api/projects/{project_id}/analytics**
  - Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ kpis: { name: string, value: number }[], charts: any }`

- **POST /api/projects/{project_id}/reports**
  - Request: `{ format: "pdf" | "csv" | "xlsx", filters?: any }`
  - Response: `{ url: string }`

---

## 4. FILE STRUCTURE

```
.
├── docker-compose.yml                # Orchestrates all services (frontend, backend, db, redis, airflow)
├── .env.example                      # Template for environment variables
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
├── run.sh                            # Root startup script
├── backend/
│   ├── shared/                       # Shared Python modules (models, utils, schemas)
│   │   ├── models.py                 # Shared SQLAlchemy models
│   │   ├── schemas.py                # Shared Pydantic schemas
│   │   ├── utils.py                  # Shared utility functions
│   │   └── __init__.py
│   ├── auth-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8001, CMD uvicorn --port 8001)
│   │   ├── api.py                    # Auth endpoints
│   │   ├── dependencies.py           # Auth dependencies (JWT, password hashing)
│   │   ├── service.py                # Auth business logic
│   │   ├── Dockerfile                # Auth service Dockerfile (EXPOSE 8001)
│   │   └── requirements.txt
│   ├── project-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8002, CMD uvicorn --port 8002)
│   │   ├── api.py                    # Project endpoints
│   │   ├── service.py                # Project business logic
│   │   ├── Dockerfile                # Project service Dockerfile (EXPOSE 8002)
│   │   └── requirements.txt
│   ├── budget-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8003, CMD uvicorn --port 8003)
│   │   ├── api.py                    # Budget endpoints
│   │   ├── service.py                # Budget business logic
│   │   ├── Dockerfile                # Budget service Dockerfile (EXPOSE 8003)
│   │   └── requirements.txt
│   ├── forecast-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8004, CMD uvicorn --port 8004)
│   │   ├── api.py                    # Forecast endpoints
│   │   ├── service.py                # Forecast logic (Prophet, XGBoost, SHAP)
│   │   ├── Dockerfile                # Forecast service Dockerfile (EXPOSE 8004)
│   │   └── requirements.txt
│   ├── ai-assistant-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8005, CMD uvicorn --port 8005)
│   │   ├── api.py                    # Chat endpoints
│   │   ├── service.py                # LLM integration logic
│   │   ├── Dockerfile                # AI assistant Dockerfile (EXPOSE 8005)
│   │   └── requirements.txt
│   ├── analytics-service/
│   │   ├── main.py                   # FastAPI entrypoint (EXPOSE 8006, CMD uvicorn --port 8006)
│   │   ├── api.py                    # Analytics endpoints
│   │   ├── service.py                # Analytics logic
│   │   ├── Dockerfile                # Analytics Dockerfile (EXPOSE 8006)
│   │   └── requirements.txt
│   ├── airflow/
│   │   ├── dags/
│   │   │   └── etl_pipeline.py       # ETL DAGs for data ingestion
│   │   ├── Dockerfile                # Airflow Dockerfile (EXPOSE 8080)
│   │   └── requirements.txt
│   └── start.sh                      # Backend startup script
├── frontend/
│   ├── Dockerfile                    # Frontend Dockerfile (EXPOSE 3000)
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── public/
│   │   └── index.html                # HTML entrypoint
│   ├── src/
│   │   ├── main.tsx                  # React/Next.js entrypoint
│   │   ├── App.tsx                   # App root
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts        # Auth API hooks
│   │   │   │   ├── useProjects.ts    # Project API hooks
│   │   │   │   ├── useBudgets.ts     # Budget API hooks
│   │   │   │   ├── useForecast.ts    # Forecast API hooks
│   │   │   │   ├── useRisks.ts       # Risk API hooks
│   │   │   │   ├── useRecommendations.ts # Recommendation API hooks
│   │   │   │   ├── useChat.ts        # Chat/AI API hooks
│   │   │   │   ├── useAnalytics.ts   # Analytics API hooks
│   │   │   │   └── useUser.ts        # User API hooks
│   │   ├── state/
│   │   │   ├── authStore.ts          # Zustand store for auth
│   │   │   ├── projectStore.ts       # Zustand store for projects
│   │   │   ├── budgetStore.ts        # Zustand store for budgets
│   │   │   ├── forecastStore.ts      # Zustand store for forecasting
│   │   │   ├── chatStore.ts          # Zustand store for chat
│   │   │   └── uiStore.ts            # Zustand store for UI state
│   │   ├── components/
│   │   │   ├── Sidebar.tsx           # Sidebar navigation
│   │   │   ├── Header.tsx            # Header with project selector, notifications, profile
│   │   │   ├── ProjectSelector.tsx   # Project dropdown
│   │   │   ├── KpiCard.tsx           # KPI card
│   │   │   ├── DataTable.tsx         # Generic data table
│   │   │   ├── BudgetTable.tsx       # Budget items table
│   │   │   ├── LineChart.tsx         # Budget vs execution chart
│   │   │   ├── ForecastChart.tsx     # Forecasting chart
│   │   │   ├── RiskPanel.tsx         # Risks panel
│   │   │   ├── RecommendationPanel.tsx # AI recommendations panel
│   │   │   ├── ChatPanel.tsx         # Chat with FinSight Assistant
│   │   │   ├── ExplainabilityPanel.tsx # SHAP/feature importance
│   │   │   ├── ScenarioSimulator.tsx # Scenario simulation
│   │   │   ├── Modal.tsx             # Modal dialog
│   │   │   ├── Button.tsx            # Primary/secondary/IA buttons
│   │   │   ├── Badge.tsx             # Status badge
│   │   │   ├── Tooltip.tsx           # Tooltip
│   │   │   └── EmptyState.tsx        # Empty state
│   │   ├── pages/
│   │   │   ├── index.tsx             # Dashboard principal
│   │   │   ├── projects.tsx          # Project list
│   │   │   ├── project/[id].tsx      # Project detail
│   │   │   ├── budget/[id].tsx       # Budget detail
│   │   │   ├── analytics.tsx         # Analytics dashboards
│   │   │   ├── forecasting.tsx       # Forecasting view
│   │   │   ├── reports.tsx           # Reports page
│   │   │   ├── admin.tsx             # Admin/configuration
│   │   │   └── login.tsx             # Login page
│   │   ├── styles/
│   │   │   ├── globals.css           # Tailwind base styles
│   │   │   └── tokens.css            # Design tokens (colors, typography)
│   │   └── utils/
│   │       ├── format.ts             # Formatting helpers
│   │       └── constants.ts          # App constants
│   └── start.sh                      # Frontend startup script
```

### PORT TABLE

| Service                | Listening Port | Path                        |
|------------------------|---------------|-----------------------------|
| auth-service           | 8001          | backend/auth-service/       |
| project-service        | 8002          | backend/project-service/    |
| budget-service         | 8003          | backend/budget-service/     |
| forecast-service       | 8004          | backend/forecast-service/   |
| ai-assistant-service   | 8005          | backend/ai-assistant-service/ |
| analytics-service      | 8006          | backend/analytics-service/  |

### SHARED MODULES

| Shared path         | Imported by services                                             |
|---------------------|------------------------------------------------------------------|
| backend/shared/     | auth-service, project-service, budget-service, forecast-service, ai-assistant-service, analytics-service |

---

## 5. ENVIRONMENT VARIABLES

| Name                        | Type    | Description                                         | Example Value                          |
|-----------------------------|---------|-----------------------------------------------------|----------------------------------------|
| POSTGRES_HOST               | string  | PostgreSQL hostname                                 | db                                    |
| POSTGRES_PORT               | int     | PostgreSQL port                                     | 5432                                  |
| POSTGRES_DB                 | string  | PostgreSQL database name                            | fin_platform                          |
| POSTGRES_USER               | string  | PostgreSQL username                                 | admin                                 |
| POSTGRES_PASSWORD           | string  | PostgreSQL password                                 | secret                                |
| REDIS_HOST                  | string  | Redis hostname                                      | redis                                 |
| REDIS_PORT                  | int     | Redis port                                          | 6379                                  |
| AIRFLOW__CORE__SQL_ALCHEMY_CONN | string | Airflow DB connection string                        | postgresql+psycopg2://...             |
| AIRFLOW__CORE__FERNET_KEY   | string  | Airflow Fernet key                                  | <32-byte-base64>                      |
| SECRET_KEY                  | string  | JWT secret key                                      | supersecretkey                        |
| JWT_ALGORITHM               | string  | JWT algorithm                                       | HS256                                 |
| ACCESS_TOKEN_EXPIRE_MINUTES | int     | JWT access token expiration (minutes)               | 60                                    |
| S3_BUCKET                   | string  | AWS S3 bucket for storage                           | fin-platform-data                     |
| AWS_ACCESS_KEY_ID           | string  | AWS access key                                      | AKIA...                               |
| AWS_SECRET_ACCESS_KEY       | string  | AWS secret key                                      | ...                                   |
| OPENAI_API_KEY              | string  | OpenAI API key for GPT-4                            | sk-...                                |
| LLAMA_MODEL_PATH            | string  | Path to Llama 3 model file                          | /models/llama-3.bin                   |
| FRONTEND_URL                | string  | Public URL of frontend                              | https://fin-platform.example.com       |
| BACKEND_URL                 | string  | Public URL of API gateway                           | https://api.fin-platform.example.com   |
| NODE_ENV                    | string  | Node.js environment                                 | production                            |
| NEXT_PUBLIC_API_URL         | string  | API base URL for frontend                           | https://api.fin-platform.example.com   |

---

## 6. IMPORT CONTRACTS

**Python (backend/shared/):**
- `from backend.shared.models import User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPFeatureImportance, ForecastExplainability`
- `from backend.shared.schemas import User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPFeatureImportance, ForecastExplainability`
- `from backend.shared.utils import get_db, hash_password, verify_password, create_access_token`

**Frontend (TypeScript):**
- `import { User, Project, BudgetVersion, BudgetItem, ForecastScenario, Risk, Recommendation, ChatMessage, SHAPFeatureImportance, ForecastExplainability } from '../api/types'`
- `import { useAuth } from '../api/hooks/useAuth'`
- `import { useProjects } from '../api/hooks/useProjects'`
- `import { useBudgets } from '../api/hooks/useBudgets'`
- `import { useForecast } from '../api/hooks/useForecast'`
- `import { useRisks } from '../api/hooks/useRisks'`
- `import { useRecommendations } from '../api/hooks/useRecommendations'`
- `import { useChat } from '../api/hooks/useChat'`
- `import { useAnalytics } from '../api/hooks/useAnalytics'`
- `import { useUser } from '../api/hooks/useUser'`
- `import { authStore } from '../state/authStore'`
- `import { projectStore } from '../state/projectStore'`
- `import { budgetStore } from '../state/budgetStore'`
- `import { forecastStore } from '../state/forecastStore'`
- `import { chatStore } from '../state/chatStore'`
- `import { uiStore } from '../state/uiStore'`

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### Zustand Stores

- `authStore` → { user: User | null, accessToken: string | null, loading: boolean, login(email: string, password: string): Promise<void>, logout(): void }
- `projectStore` → { projects: Project[], selectedProject: Project | null, loading: boolean, fetchProjects(): Promise<void>, selectProject(id: number): void, createProject(data: Partial<Project>): Promise<Project> }
- `budgetStore` → { budgets: BudgetVersion[], selectedBudget: BudgetVersion | null, loading: boolean, fetchBudgets(projectId: number): Promise<void>, selectBudget(id: number): void, createBudget(items: BudgetItem[]): Promise<BudgetVersion> }
- `forecastStore` → { scenarios: ForecastScenario[], loading: boolean, fetchForecasts(projectId: number): Promise<void>, simulateScenario(scenario: "optimistic" | "expected" | "critical"): Promise<ForecastScenario>, explainability: ForecastExplainability | null, fetchExplainability(scenarioId: number): Promise<void> }
- `chatStore` → { messages: ChatMessage[], loading: boolean, sendMessage(message: string): Promise<void>, fetchMessages(projectId: number): Promise<void> }
- `uiStore` → { sidebarOpen: boolean, chatPanelOpen: boolean, modalOpen: boolean, setSidebarOpen(open: boolean): void, setChatPanelOpen(open: boolean): void, setModalOpen(open: boolean): void }

### API Hooks

- `useAuth()` → { user, loading, error, login, logout }
- `useProjects()` → { projects, loading, error, fetchProjects, createProject, selectProject, selectedProject }
- `useBudgets()` → { budgets, loading, error, fetchBudgets, createBudget, selectedBudget }
- `useForecast()` → { scenarios, loading, error, fetchForecasts, simulateScenario, explainability, fetchExplainability }
- `useRisks()` → { risks, loading, error, fetchRisks, createRisk }
- `useRecommendations()` → { recommendations, loading, error, fetchRecommendations }
- `useChat()` → { messages, loading, error, sendMessage, fetchMessages }
- `useAnalytics()` → { kpis, charts, loading, error, fetchAnalytics }
- `useUser()` → { user, loading, error, fetchUser }

### Component Props/Inputs

- `Sidebar` props: { open: boolean, onToggle: () => void }
- `Header` props: { user: User, onLogout: () => void, selectedProject: Project | null, onProjectChange: (id: number) => void }
- `ProjectSelector` props: { projects: Project[], selectedProject: Project | null, onSelect: (id: number) => void }
- `KpiCard` props: { title: string, value: number, trend?: "up" | "down" | "neutral", color?: string }
- `DataTable` props: { columns: any[], data: any[], loading: boolean }
- `BudgetTable` props: { items: BudgetItem[], loading: boolean }
- `LineChart` props: { data: { labels: string[], planned: number[], executed: number[] }, height?: number }
- `ForecastChart` props: { scenarios: ForecastScenario[], height?: number }
- `RiskPanel` props: { risks: Risk[], onAddRisk: (risk: Omit<Risk, "id" | "created_at">) => void }
- `RecommendationPanel` props: { recommendations: Recommendation[] }
- `ChatPanel` props: { messages: ChatMessage[], onSend: (message: string) => void, loading: boolean }
- `ExplainabilityPanel` props: { explainability: ForecastExplainability | null }
- `ScenarioSimulator` props: { onSimulate: (scenario: "optimistic" | "expected" | "critical") => void, loading: boolean }
- `Modal` props: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }
- `Button` props: { children: React.ReactNode, variant?: "primary" | "secondary" | "ia", onClick: () => void, disabled?: boolean }
- `Badge` props: { status: "on_track" | "warning" | "over_budget" | "open" | "mitigated" | "closed" }
- `Tooltip` props: { content: string, children: React.ReactNode }
- `EmptyState` props: { title: string, description?: string, action?: React.ReactNode }

### Page Hierarchy

- `/` (Dashboard): Sidebar, Header, ProjectSelector, KpiCard[], LineChart, ForecastChart, BudgetTable, RiskPanel, RecommendationPanel, ChatPanel, ExplainabilityPanel
- `/projects`: Sidebar, Header, DataTable (projects), Button (Crear proyecto)
- `/project/[id]`: Sidebar, Header, ProjectSelector, KpiCard[], BudgetTable, RiskPanel, RecommendationPanel, ChatPanel
- `/budget/[id]`: Sidebar, Header, BudgetTable, Button (Comparar versiones, Guardar línea base)
- `/analytics`: Sidebar, Header, DataTable, LineChart, Button (Exportar)
- `/forecasting`: Sidebar, Header, ForecastChart, ScenarioSimulator, ExplainabilityPanel
- `/reports`: Sidebar, Header, DataTable, Button (Descargar)
- `/admin`: Sidebar, Header, DataTable (usuarios, conectores, logs)
- `/login`: Login form

---

## 8. FILE EXTENSION CONVENTION

- All frontend files use `.tsx` for React components and pages.
- The project is TypeScript-only (no `.js` or `.jsx` files).
- Entry point: `/frontend/src/main.tsx` (referenced in `/frontend/public/index.html` as `<script src="/src/main.tsx">`).
- All backend Python files use `.py`.
- All configuration files use their standard extensions (`.yml`, `.env.example`, `.json`, `.css`, etc.).
- No mixing of JavaScript and TypeScript in frontend; all code, hooks, and components are `.tsx` or `.ts`.