import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
import json

from shared.models import ForecastScenario, ForecastScenarioCreate, SHAPExplanation
from backend.shared.db import get_db_session
from backend.shared.auth import get_current_user
from service import ForecastingService

logger = logging.getLogger("forecasting-service")
router = APIRouter(tags=["forecasting"])


async def get_forecasting_service(session: AsyncSession = Depends(get_db_session)) -> ForecastingService:
    return ForecastingService(session)


@router.get("/projects/{project_id}/forecast/", response_model=list[ForecastScenario])
async def get_forecast(
    project_id: int,
    scenario: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    service: ForecastingService = Depends(get_forecasting_service),
):
    forecasts = await service.list_forecasts(project_id, scenario)
    return [
        ForecastScenario(
            id=f.id,
            project_id=f.project_id,
            scenario=f.scenario.value if hasattr(f.scenario, 'value') else f.scenario,
            forecast_date=f.forecast_date,
            forecast_value=f.forecast_value,
            lower_bound=f.lower_bound,
            upper_bound=f.upper_bound,
            created_at=f.created_at,
        )
        for f in forecasts
    ]


@router.post("/projects/{project_id}/forecast/", response_model=ForecastScenario, status_code=status.HTTP_201_CREATED)
async def create_forecast(
    project_id: int,
    forecast_data: ForecastScenarioCreate,
    current_user: dict = Depends(get_current_user),
    service: ForecastingService = Depends(get_forecasting_service),
):
    try:
        forecast = await service.create_forecast(project_id, forecast_data)
        return ForecastScenario(
            id=forecast.id,
            project_id=forecast.project_id,
            scenario=forecast.scenario.value if hasattr(forecast.scenario, 'value') else forecast.scenario,
            forecast_date=forecast.forecast_date,
            forecast_value=forecast.forecast_value,
            lower_bound=forecast.lower_bound,
            upper_bound=forecast.upper_bound,
            created_at=forecast.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/forecast/{forecast_scenario_id}/shap/", response_model=SHAPExplanation)
async def get_shap_explanation(
    forecast_scenario_id: int,
    current_user: dict = Depends(get_current_user),
    service: ForecastingService = Depends(get_forecasting_service),
):
    shap = await service.get_shap_explanation(forecast_scenario_id)
    if not shap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SHAP explanation not found")
    feature_importances = json.loads(shap.feature_importances) if isinstance(shap.feature_importances, str) else shap.feature_importances
    return SHAPExplanation(
        id=shap.id,
        project_id=shap.project_id,
        forecast_scenario_id=shap.forecast_scenario_id,
        feature_importances=feature_importances,
        created_at=shap.created_at,
    )
