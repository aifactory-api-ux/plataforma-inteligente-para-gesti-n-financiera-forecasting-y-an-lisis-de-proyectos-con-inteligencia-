import logging
from datetime import datetime
from typing import Optional, List
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from shared.models import (
    ProjectDB, ProjectCreate, ProjectUpdate, Project,
    BudgetVersionDB, BudgetVersionCreate, BudgetVersion,
    BudgetItemDB, BudgetItemCreate, BudgetItemUpdate, BudgetItem,
    RiskDB, RiskCreate, RiskUpdate, Risk,
    RecommendationDB, RecommendationCreate, Recommendation,
    SuccessResponse,
)

logger = logging.getLogger("project-service")


class ProjectService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_projects(self, search: Optional[str] = None, status: Optional[str] = None) -> List[ProjectDB]:
        query = select(ProjectDB)
        if search:
            query = query.where(ProjectDB.name.ilike(f"%{search}%"))
        if status:
            query = query.where(ProjectDB.status == status)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create_project(self, project_data: ProjectCreate, owner_id: int) -> ProjectDB:
        project = ProjectDB(
            name=project_data.name,
            description=project_data.description,
            start_date=project_data.start_date,
            end_date=project_data.end_date,
            owner_id=owner_id,
        )
        self.session.add(project)
        await self.session.flush()
        await self.session.refresh(project)
        return project

    async def get_project(self, project_id: int) -> Optional[ProjectDB]:
        result = await self.session.execute(select(ProjectDB).where(ProjectDB.id == project_id))
        return result.scalar_one_or_none()

    async def update_project(self, project_id: int, project_data: ProjectUpdate) -> Optional[ProjectDB]:
        project = await self.get_project(project_id)
        if not project:
            return None
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.status is not None:
            project.status = project_data.status
        if project_data.end_date is not None:
            project.end_date = project_data.end_date
        await self.session.flush()
        await self.session.refresh(project)
        return project

    async def delete_project(self, project_id: int) -> bool:
        project = await self.get_project(project_id)
        if not project:
            return False
        await self.session.delete(project)
        return True

    async def list_budgets(self, project_id: int) -> List[BudgetVersionDB]:
        result = await self.session.execute(
            select(BudgetVersionDB)
            .where(BudgetVersionDB.project_id == project_id)
            .options(selectinload(BudgetVersionDB.items))
        )
        return list(result.scalars().all())

    async def create_budget(self, project_id: int, budget_data: BudgetVersionCreate) -> BudgetVersionDB:
        budget = BudgetVersionDB(
            project_id=project_id,
            version=budget_data.version,
            is_baseline=budget_data.is_baseline,
        )
        self.session.add(budget)
        await self.session.flush()
        for item_data in budget_data.items:
            item = BudgetItemDB(
                budget_version_id=budget.id,
                name=item_data.name,
                phase=item_data.phase,
                amount_planned=item_data.amount_planned,
                amount_executed=item_data.amount_executed,
                status=item_data.status,
            )
            self.session.add(item)
        await self.session.flush()
        await self.session.refresh(budget)
        return budget

    async def list_budget_items(self, budget_version_id: int) -> List[BudgetItemDB]:
        result = await self.session.execute(
            select(BudgetItemDB).where(BudgetItemDB.budget_version_id == budget_version_id)
        )
        return list(result.scalars().all())

    async def update_budget_item(self, item_id: int, item_data: BudgetItemUpdate) -> Optional[BudgetItemDB]:
        result = await self.session.execute(select(BudgetItemDB).where(BudgetItemDB.id == item_id))
        item = result.scalar_one_or_none()
        if not item:
            return None
        if item_data.amount_planned is not None:
            item.amount_planned = item_data.amount_planned
        if item_data.amount_executed is not None:
            item.amount_executed = item_data.amount_executed
        if item_data.status is not None:
            item.status = item_data.status
        item.deviation = item.amount_planned - item.amount_executed
        await self.session.flush()
        await self.session.refresh(item)
        return item

    async def list_risks(self, project_id: int) -> List[RiskDB]:
        result = await self.session.execute(select(RiskDB).where(RiskDB.project_id == project_id))
        return list(result.scalars().all())

    async def create_risk(self, project_id: int, risk_data: RiskCreate) -> RiskDB:
        risk = RiskDB(
            project_id=project_id,
            description=risk_data.description,
            impact=risk_data.impact,
            probability=risk_data.probability,
            mitigation=risk_data.mitigation,
        )
        self.session.add(risk)
        await self.session.flush()
        await self.session.refresh(risk)
        return risk

    async def update_risk(self, risk_id: int, risk_data: RiskUpdate) -> Optional[RiskDB]:
        result = await self.session.execute(select(RiskDB).where(RiskDB.id == risk_id))
        risk = result.scalar_one_or_none()
        if not risk:
            return None
        if risk_data.status is not None:
            risk.status = risk_data.status
        if risk_data.mitigation is not None:
            risk.mitigation = risk_data.mitigation
        await self.session.flush()
        await self.session.refresh(risk)
        return risk

    async def list_recommendations(self, project_id: int) -> List[RecommendationDB]:
        result = await self.session.execute(select(RecommendationDB).where(RecommendationDB.project_id == project_id))
        return list(result.scalars().all())

    async def create_recommendation(self, project_id: int, rec_data: RecommendationCreate) -> RecommendationDB:
        rec = RecommendationDB(
            project_id=project_id,
            text=rec_data.text,
            source=rec_data.source,
        )
        self.session.add(rec)
        await self.session.flush()
        await self.session.refresh(rec)
        return rec
