import logging
import json
from datetime import date, datetime
from typing import Optional, List, Dict
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from shared.models import (
    ForecastScenarioDB, ForecastScenarioCreate, ForecastScenario,
    SHAPExplanationDB, SHAPExplanation,
    ProjectDB,
)

logger = logging.getLogger("forecasting-service")


class ForecastingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_project(self, project_id: int) -> Optional[ProjectDB]:
        result = await self.session.execute(select(ProjectDB).where(ProjectDB.id == project_id))
        return result.scalar_one_or_none()

    async def list_forecasts(self, project_id: int, scenario: Optional[str] = None) -> List[ForecastScenarioDB]:
        query = select(ForecastScenarioDB).where(ForecastScenarioDB.project_id == project_id)
        if scenario:
            query = query.where(ForecastScenarioDB.scenario == scenario)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create_forecast(self, project_id: int, forecast_data: ForecastScenarioCreate) -> ForecastScenarioDB:
        project = await self.get_project(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        forecast_value, lower_bound, upper_bound = self._simulate_forecast(
            project.budget_total,
            forecast_data.scenario,
            forecast_data.parameters,
        )

        forecast = ForecastScenarioDB(
            project_id=project_id,
            scenario=forecast_data.scenario,
            forecast_date=date.today(),
            forecast_value=forecast_value,
            lower_bound=lower_bound,
            upper_bound=upper_bound,
        )
        self.session.add(forecast)
        await self.session.flush()
        await self.session.refresh(forecast)

        shap_explanation = self._calculate_shap(project, forecast)
        shap_db = SHAPExplanationDB(
            project_id=project_id,
            forecast_scenario_id=forecast.id,
            feature_importances=json.dumps(shap_explanation),
        )
        self.session.add(shap_db)
        await self.session.flush()

        return forecast

    async def get_forecast(self, forecast_id: int) -> Optional[ForecastScenarioDB]:
        result = await self.session.execute(select(ForecastScenarioDB).where(ForecastScenarioDB.id == forecast_id))
        return result.scalar_one_or_none()

    async def get_shap_explanation(self, forecast_scenario_id: int) -> Optional[SHAPExplanationDB]:
        result = await self.session.execute(
            select(SHAPExplanationDB).where(SHAPExplanationDB.forecast_scenario_id == forecast_scenario_id)
        )
        return result.scalar_one_or_none()

    def _simulate_forecast(
        self,
        base_value: float,
        scenario: str,
        parameters: dict,
    ) -> tuple[float, float, float]:
        multiplier = {"optimista": 1.1, "esperado": 1.0, "critico": 0.85}.get(scenario, 1.0)
        uncertainty = parameters.get("uncertainty", 0.1)
        forecast_value = base_value * multiplier
        margin = forecast_value * uncertainty
        return forecast_value, forecast_value - margin, forecast_value + margin

    def _calculate_shap(self, project: ProjectDB, forecast: ForecastScenarioDB) -> Dict[str, float]:
        return {
            "budget_total": 0.4,
            "execution_total": 0.25,
            "deviation": 0.15,
            "start_date": 0.1,
            "end_date": 0.1,
        }
