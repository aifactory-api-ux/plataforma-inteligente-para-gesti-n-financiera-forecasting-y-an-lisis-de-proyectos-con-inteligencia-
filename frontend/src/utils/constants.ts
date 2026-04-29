export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8001";
export const PROJECT_SERVICE_URL = import.meta.env.VITE_PROJECT_SERVICE_URL || "http://localhost:8002";
export const FORECASTING_SERVICE_URL = import.meta.env.VITE_FORECASTING_SERVICE_URL || "http://localhost:8003";
export const ASSISTANT_SERVICE_URL = import.meta.env.VITE_ASSISTANT_SERVICE_URL || "http://localhost:8004";

export const APP_NAME = "FinSight";
export const APP_VERSION = "1.0.0";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ANALYST: "analyst",
  VIEWER: "viewer",
} as const;

export const PROJECT_STATUSES = {
  ACTIVO: "activo",
  EN_EJECUCION: "en_ejecucion",
  FINALIZADO: "finalizado",
  CANCELADO: "cancelado",
} as const;

export const BUDGET_ITEM_STATUSES = {
  PENDIENTE: "pendiente",
  EN_PROGRESO: "en_progreso",
  COMPLETADO: "completado",
  REVISAR: "revisar",
} as const;

export const RISK_IMPACTS = {
  BAJO: "bajo",
  MEDIO: "medio",
  ALTO: "alto",
} as const;

export const RISK_STATUSES = {
  ABIERTO: "abierto",
  MITIGADO: "mitigado",
  CERRADO: "cerrado",
} as const;

export const FORECAST_SCENARIOS = {
  OPTIMISTA: "optimista",
  ESPERADO: "esperado",
  CRITICO: "critico",
} as const;

export const SIDEBAR_WIDTH = 256;
export const HEADER_HEIGHT = 64;
export const CHAT_PANEL_WIDTH = 384;
