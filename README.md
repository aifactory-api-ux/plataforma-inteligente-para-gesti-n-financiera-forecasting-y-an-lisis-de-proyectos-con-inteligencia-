# FinSight - Intelligent Financial Management Platform

AI-powered platform for project financial management, forecasting, and analytics.

## Architecture

- **Frontend**: Next.js 14 (TypeScript, Tailwind CSS)
- **Backend**: FastAPI microservices
  - Auth Service (JWT, user management)
  - Project Service (projects, budgets, risks)
  - Forecasting Service (Prophet/XGBoost/SHAP)
  - Assistant Service (LLM chat)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ETL**: Apache Airflow

## Quick Start

```bash
./run.sh
```

This will build and start all services. Access the platform at http://localhost:3000

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application |
| Auth Service | 8001 | Authentication & user management |
| Project Service | 8002 | Projects, budgets, risks |
| Forecasting Service | 8003 | ML forecasting & SHAP |
| Assistant Service | 8004 | LLM chat assistant |
| Airflow | 8080 | ETL orchestration |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `POSTGRES_*` - PostgreSQL connection
- `REDIS_*` - Redis connection
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key (optional)

## Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
├── backend/
│   ├── shared/          # Shared modules
│   ├── auth-service/     # Auth microservice
│   ├── project-service/  # Project microservice
│   ├── forecasting-svc/  # Forecasting microservice
│   ├── assistant-service/# Chat microservice
│   └── etl/              # Airflow ETL
├── frontend/             # Next.js app
├── shared/               # Shared types & config
└── docker-compose.yml    # Orchestration
```

## API Documentation

Once running, API docs are available at:
- Auth Service: http://localhost:8001/docs
- Project Service: http://localhost:8002/docs
- Forecasting Service: http://localhost:8003/docs
- Assistant Service: http://localhost:8004/docs

## Troubleshooting

### Services not starting
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection errors
Ensure PostgreSQL is healthy before starting backend services:
```bash
docker-compose ps postgres
```

### View all logs
```bash
docker-compose logs -f
```
