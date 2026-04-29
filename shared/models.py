from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    analyst = "analyst"
    viewer = "viewer"


class ProjectStatus(str, Enum):
    activo = "activo"
    en_ejecucion = "en_ejecucion"
    finalizado = "finalizado"
    cancelado = "cancelado"


class BudgetItemStatus(str, Enum):
    pendiente = "pendiente"
    en_progreso = "en_progreso"
    completado = "completado"
    revisar = "revisar"


class RiskImpact(str, Enum):
    bajo = "bajo"
    medio = "medio"
    alto = "alto"


class RiskStatus(str, Enum):
    abierto = "abierto"
    mitigado = "mitigado"
    cerrado = "cerrado"


class RecommendationSource(str, Enum):
    ia = "ia"
    manual = "manual"


class ForecastScenarioType(str, Enum):
    optimista = "optimista"
    esperado = "esperado"
    critico = "critico"


class ChatSender(str, Enum):
    user = "user"
    assistant = "assistant"


class User(BaseModel):
    id: int
    email: str
    full_name: str
    role: Literal["admin", "manager", "analyst", "viewer"]
    is_active: bool
    created_at: datetime


class UserCreate(BaseModel):
    email: str
    full_name: str
    role: Literal["admin", "manager", "analyst", "viewer"]
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[Literal["admin", "manager", "analyst", "viewer"]] = None
    is_active: Optional[bool] = None


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


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["activo", "en_ejecucion", "finalizado", "cancelado"]] = None
    end_date: Optional[date] = None


class BudgetVersion(BaseModel):
    id: int
    project_id: int
    version: int
    created_at: datetime
    is_baseline: bool
    items: List["BudgetItem"] = []


class BudgetVersionCreate(BaseModel):
    version: int
    is_baseline: bool
    items: List["BudgetItem"] = []


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


class BudgetItemCreate(BaseModel):
    name: str
    phase: str
    amount_planned: float
    amount_executed: float
    status: Literal["pendiente", "en_progreso", "completado", "revisar"]


class BudgetItemUpdate(BaseModel):
    amount_planned: Optional[float] = None
    amount_executed: Optional[float] = None
    status: Optional[Literal["pendiente", "en_progreso", "completado", "revisar"]] = None


class ForecastScenario(BaseModel):
    id: int
    project_id: int
    scenario: Literal["optimista", "esperado", "critico"]
    forecast_date: date
    forecast_value: float
    lower_bound: float
    upper_bound: float
    created_at: datetime


class ForecastScenarioCreate(BaseModel):
    scenario: Literal["optimista", "esperado", "critico"]
    parameters: dict = {}


class Risk(BaseModel):
    id: int
    project_id: int
    description: str
    impact: Literal["bajo", "medio", "alto"]
    probability: float
    mitigation: Optional[str]
    status: Literal["abierto", "mitigado", "cerrado"]
    created_at: datetime


class RiskCreate(BaseModel):
    description: str
    impact: Literal["bajo", "medio", "alto"]
    probability: float
    mitigation: Optional[str] = None


class RiskUpdate(BaseModel):
    status: Optional[Literal["abierto", "mitigado", "cerrado"]] = None
    mitigation: Optional[str] = None


class Recommendation(BaseModel):
    id: int
    project_id: int
    text: str
    source: Literal["ia", "manual"]
    created_at: datetime


class RecommendationCreate(BaseModel):
    text: str
    source: Literal["ia", "manual"]


class ChatMessage(BaseModel):
    id: int
    project_id: int
    sender: Literal["user", "assistant"]
    message: str
    timestamp: datetime


class ChatMessageCreate(BaseModel):
    message: str


class SHAPExplanation(BaseModel):
    id: int
    project_id: int
    forecast_scenario_id: int
    feature_importances: dict[str, float]
    created_at: datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]
    user: User


class LogoutResponse(BaseModel):
    success: bool


class SuccessResponse(BaseModel):
    success: bool


fromsqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import ARRAY

Base = declarative_base()


class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.viewer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("ProjectDB", back_populates="owner")


class ProjectDB(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(ProjectStatus), nullable=False, default=ProjectStatus.activo)
    budget_total = Column(Float, default=0.0)
    execution_total = Column(Float, default=0.0)
    deviation = Column(Float, default=0.0)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("UserDB", back_populates="projects")
    budget_versions = relationship("BudgetVersionDB", back_populates="project")
    risks = relationship("RiskDB", back_populates="project")
    recommendations = relationship("RecommendationDB", back_populates="project")
    chat_messages = relationship("ChatMessageDB", back_populates="project")


class BudgetVersionDB(Base):
    __tablename__ = "budget_versions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_baseline = Column(Boolean, default=False)

    project = relationship("ProjectDB", back_populates="budget_versions")
    items = relationship("BudgetItemDB", back_populates="budget_version")


class BudgetItemDB(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    budget_version_id = Column(Integer, ForeignKey("budget_versions.id"), nullable=False)
    name = Column(String(255), nullable=False)
    phase = Column(String(255), nullable=False)
    amount_planned = Column(Float, default=0.0)
    amount_executed = Column(Float, default=0.0)
    deviation = Column(Float, default=0.0)
    status = Column(SQLEnum(BudgetItemStatus), default=BudgetItemStatus.pendiente)
    created_at = Column(DateTime, default=datetime.utcnow)

    budget_version = relationship("BudgetVersionDB", back_populates="items")


class ForecastScenarioDB(Base):
    __tablename__ = "forecast_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    scenario = Column(SQLEnum(ForecastScenarioType), nullable=False)
    forecast_date = Column(Date, nullable=False)
    forecast_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB")
    shap_explanations = relationship("SHAPExplanationDB", back_populates="forecast_scenario")


class RiskDB(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    description = Column(Text, nullable=False)
    impact = Column(SQLEnum(RiskImpact), nullable=False)
    probability = Column(Float, default=0.0)
    mitigation = Column(Text, nullable=True)
    status = Column(SQLEnum(RiskStatus), default=RiskStatus.abierto)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="risks")


class RecommendationDB(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    text = Column(Text, nullable=False)
    source = Column(SQLEnum(RecommendationSource), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="recommendations")


class ChatMessageDB(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sender = Column(SQLEnum(ChatSender), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="chat_messages")


class SHAPExplanationDB(Base):
    __tablename__ = "shap_explanations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    forecast_scenario_id = Column(Integer, ForeignKey("forecast_scenarios.id"), nullable=False)
    feature_importances = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    forecast_scenario = relationship("ForecastScenarioDB", back_populates="shap_explanations")
