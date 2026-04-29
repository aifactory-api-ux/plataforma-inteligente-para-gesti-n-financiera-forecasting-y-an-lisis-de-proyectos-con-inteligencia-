export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "analyst" | "viewer";
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "activo" | "en_ejecucion" | "finalizado" | "cancelado";
  budget_total: number;
  execution_total: number;
  deviation: number;
  start_date: string;
  end_date?: string;
  owner_id: number;
  created_at: string;
}

export interface BudgetVersion {
  id: number;
  project_id: number;
  version: number;
  created_at: string;
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
  created_at: string;
}

export interface ForecastScenario {
  id: number;
  project_id: number;
  scenario: "optimista" | "esperado" | "critico";
  forecast_date: string;
  forecast_value: number;
  lower_bound: number;
  upper_bound: number;
  created_at: string;
}

export interface Risk {
  id: number;
  project_id: number;
  description: string;
  impact: "bajo" | "medio" | "alto";
  probability: number;
  mitigation?: string;
  status: "abierto" | "mitigado" | "cerrado";
  created_at: string;
}

export interface Recommendation {
  id: number;
  project_id: number;
  text: string;
  source: "ia" | "manual";
  created_at: string;
}

export interface ChatMessage {
  id: number;
  project_id: number;
  sender: "user" | "assistant";
  message: string;
  timestamp: string;
}

export interface SHAPExplanation {
  id: number;
  project_id: number;
  forecast_scenario_id: number;
  feature_importances: Record<string, number>;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: "activo" | "en_ejecucion" | "finalizado" | "cancelado";
  end_date?: string;
}

export interface BudgetVersionCreate {
  version: number;
  is_baseline: boolean;
  items: BudgetItem[];
}

export interface BudgetItemUpdate {
  amount_planned?: number;
  amount_executed?: number;
  status?: "pendiente" | "en_progreso" | "completado" | "revisar";
}

export interface ForecastScenarioCreate {
  scenario: "optimista" | "esperado" | "critico";
  parameters: Record<string, unknown>;
}

export interface RiskCreate {
  description: string;
  impact: "bajo" | "medio" | "alto";
  probability: number;
  mitigation?: string;
}

export interface RiskUpdate {
  status?: "abierto" | "mitigado" | "cerrado";
  mitigation?: string;
}

export interface RecommendationCreate {
  text: string;
  source: "ia" | "manual";
}

export interface ChatMessageCreate {
  message: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  role: "admin" | "manager" | "analyst" | "viewer";
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  role?: "admin" | "manager" | "analyst" | "viewer";
  is_active?: boolean;
}
