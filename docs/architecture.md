# FinSight Architecture

## System Overview

FinSight is an AI-powered financial management platform providing project tracking, forecasting, and intelligent recommendations.

## Components

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand + React Query
- **Charts**: Chart.js with react-chartjs-2

### Backend Services

| Service | Port | Responsibility |
|---------|------|----------------|
| auth-service | 8001 | JWT authentication, user management, RBAC |
| project-service | 8002 | Projects, budgets, risks, recommendations |
| forecasting-service | 8003 | Prophet/XGBoost forecasting, SHAP explainability |
| assistant-service | 8004 | LLM chat interface (GPT-4/Llama 3) |

### Data Layer
- **PostgreSQL 15**: Primary data store
- **Redis 7**: Caching and session management
- **S3**: Historical data and model storage

### ETL
- **Apache Airflow**: Legacy DB synchronization DAGs

## Data Flow

```
Legacy DBs → Airflow ETL → PostgreSQL → Backend Services → Frontend
                                      ↓
                                   Redis (cache)
```

## API Gateway Pattern

All backend services expose OpenAPI-compliant endpoints:
- `/api/auth/*` - Authentication
- `/api/projects/*` - Project management
- `/api/budgets/*` - Budget versions
- `/api/forecast/*` - Forecasting scenarios
- `/api/risks/*` - Risk management
- `/api/chat/*` - Assistant interactions

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration for frontend origin
- Password hashing with bcrypt

## Deployment

- Docker Compose for local development
- AWS ECS Fargate for production
- CloudWatch/Prometheus/Grafana for monitoring
