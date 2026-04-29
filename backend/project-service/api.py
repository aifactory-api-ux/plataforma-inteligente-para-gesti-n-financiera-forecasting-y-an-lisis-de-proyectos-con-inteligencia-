import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import (
    Project, ProjectCreate, ProjectUpdate,
    BudgetVersion, BudgetVersionCreate,
    BudgetItem, BudgetItemUpdate,
    Risk, RiskCreate, RiskUpdate,
    Recommendation, RecommendationCreate,
    SuccessResponse,
)
from backend.shared.db import get_db_session
from backend.shared.auth import get_current_user
from service import ProjectService

logger = logging.getLogger("project-service")
router = APIRouter(prefix="/projects", tags=["projects"])


async def get_project_service(session: AsyncSession = Depends(get_db_session)) -> ProjectService:
    return ProjectService(session)


def project_to_model(p: "ProjectDB") -> Project:
    from shared.models import ProjectStatus as PS
    return Project(
        id=p.id,
        name=p.name,
        description=p.description,
        status=p.status.value if hasattr(p.status, 'value') else p.status,
        budget_total=p.budget_total,
        execution_total=p.execution_total,
        deviation=p.deviation,
        start_date=p.start_date,
        end_date=p.end_date,
        owner_id=p.owner_id,
        created_at=p.created_at,
    )


@router.get("/", response_model=list[Project])
async def list_projects(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    projects = await service.list_projects(search, status)
    return [project_to_model(p) for p in projects]


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    owner_id = int(current_user.get("sub"))
    project = await service.create_project(project_data, owner_id)
    return project_to_model(project)


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project_to_model(project)


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    project = await service.update_project(project_id, project_data)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project_to_model(project)


@router.delete("/{project_id}", response_model=SuccessResponse)
async def delete_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    success = await service.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return SuccessResponse(success=True)


budget_router = APIRouter(prefix="/projects/{project_id}/budgets", tags=["budgets"])


@budget_router.get("/", response_model=list[BudgetVersion])
async def list_budgets(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    budgets = await service.list_budgets(project_id)
    result = []
    for b in budgets:
        items = [
            BudgetItem(
                id=i.id,
                budget_version_id=i.budget_version_id,
                name=i.name,
                phase=i.phase,
                amount_planned=i.amount_planned,
                amount_executed=i.amount_executed,
                deviation=i.deviation,
                status=i.status.value if hasattr(i.status, 'value') else i.status,
                created_at=i.created_at,
            )
            for i in b.items
        ]
        result.append(BudgetVersion(
            id=b.id,
            project_id=b.project_id,
            version=b.version,
            created_at=b.created_at,
            is_baseline=b.is_baseline,
            items=items,
        ))
    return result


@budget_router.post("/", response_model=BudgetVersion, status_code=status.HTTP_201_CREATED)
async def create_budget(
    project_id: int,
    budget_data: BudgetVersionCreate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    budget = await service.create_budget(project_id, budget_data)
    items = [
        BudgetItem(
            id=i.id,
            budget_version_id=i.budget_version_id,
            name=i.name,
            phase=i.phase,
            amount_planned=i.amount_planned,
            amount_executed=i.amount_executed,
            deviation=i.deviation,
            status=i.status.value if hasattr(i.status, 'value') else i.status,
            created_at=i.created_at,
        )
        for i in items
    ]
    return BudgetVersion(
        id=budget.id,
        project_id=budget.project_id,
        version=budget.version,
        created_at=budget.created_at,
        is_baseline=budget.is_baseline,
        items=items,
    )


items_router = APIRouter(prefix="/budgets/{budget_version_id}/items", tags=["budget-items"])


@items_router.get("/", response_model=list[BudgetItem])
async def list_budget_items(
    budget_version_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    items = await service.list_budget_items(budget_version_id)
    return [
        BudgetItem(
            id=i.id,
            budget_version_id=i.budget_version_id,
            name=i.name,
            phase=i.phase,
            amount_planned=i.amount_planned,
            amount_executed=i.amount_executed,
            deviation=i.deviation,
            status=i.status.value if hasattr(i.status, 'value') else i.status,
            created_at=i.created_at,
        )
        for i in items
    ]


item_router = APIRouter(prefix="/budgets/items", tags=["budget-item"])


@item_router.patch("/{item_id}", response_model=BudgetItem)
async def update_budget_item(
    item_id: int,
    item_data: BudgetItemUpdate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    item = await service.update_budget_item(item_id, item_data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget item not found")
    return BudgetItem(
        id=item.id,
        budget_version_id=item.budget_version_id,
        name=item.name,
        phase=item.phase,
        amount_planned=item.amount_planned,
        amount_executed=item.amount_executed,
        deviation=item.deviation,
        status=item.status.value if hasattr(item.status, 'value') else item.status,
        created_at=item.created_at,
    )


risks_router = APIRouter(prefix="/projects/{project_id}/risks", tags=["risks"])


@risks_router.get("/", response_model=list[Risk])
async def list_risks(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    risks = await service.list_risks(project_id)
    return [
        Risk(
            id=r.id,
            project_id=r.project_id,
            description=r.description,
            impact=r.impact.value if hasattr(r.impact, 'value') else r.impact,
            probability=r.probability,
            mitigation=r.mitigation,
            status=r.status.value if hasattr(r.status, 'value') else r.status,
            created_at=r.created_at,
        )
        for r in risks
    ]


@risks_router.post("/", response_model=Risk, status_code=status.HTTP_201_CREATED)
async def create_risk(
    project_id: int,
    risk_data: RiskCreate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    risk = await service.create_risk(project_id, risk_data)
    return Risk(
        id=risk.id,
        project_id=risk.project_id,
        description=risk.description,
        impact=risk.impact.value if hasattr(risk.impact, 'value') else risk.impact,
        probability=risk.probability,
        mitigation=risk.mitigation,
        status=risk.status.value if hasattr(risk.status, 'value') else risk.status,
        created_at=risk.created_at,
    )


risk_router = APIRouter(prefix="/risks", tags=["risk"])


@risk_router.patch("/{risk_id}", response_model=Risk)
async def update_risk(
    risk_id: int,
    risk_data: RiskUpdate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    risk = await service.update_risk(risk_id, risk_data)
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return Risk(
        id=risk.id,
        project_id=risk.project_id,
        description=risk.description,
        impact=risk.impact.value if hasattr(risk.impact, 'value') else risk.impact,
        probability=risk.probability,
        mitigation=risk.mitigation,
        status=risk.status.value if hasattr(risk.status, 'value') else risk.status,
        created_at=risk.created_at,
    )


rec_router = APIRouter(prefix="/projects/{project_id}/recommendations", tags=["recommendations"])


@rec_router.get("/", response_model=list[Recommendation])
async def list_recommendations(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    recs = await service.list_recommendations(project_id)
    return [
        Recommendation(
            id=r.id,
            project_id=r.project_id,
            text=r.text,
            source=r.source.value if hasattr(r.source, 'value') else r.source,
            created_at=r.created_at,
        )
        for r in recs
    ]


@rec_router.post("/", response_model=Recommendation, status_code=status.HTTP_201_CREATED)
async def create_recommendation(
    project_id: int,
    rec_data: RecommendationCreate,
    current_user: dict = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
):
    rec = await service.create_recommendation(project_id, rec_data)
    return Recommendation(
        id=rec.id,
        project_id=rec.project_id,
        text=rec.text,
        source=rec.source.value if hasattr(rec.source, 'value') else rec.source,
        created_at=rec.created_at,
    )
