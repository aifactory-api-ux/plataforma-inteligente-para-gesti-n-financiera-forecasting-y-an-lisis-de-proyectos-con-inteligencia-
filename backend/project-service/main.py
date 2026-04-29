import logging
import sys
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shared.config import FRONTEND_URL

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("project-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Project service starting up...")
    yield
    logger.info("Project service shutting down...")


app = FastAPI(
    title="Project Service",
    description="Project, budget, risk, and recommendation management service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    duration = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} ({duration:.3f}s)")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "project-service", "timestamp": datetime.utcnow().isoformat()}


from api import router
app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=False)
