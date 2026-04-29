export const DESIGN_TOKENS = {
  colors: {
    primary: {
      navy: "#1E293B",
      blue: "#3B82F6",
      lightBlue: "#60A5FA",
      sky: "#0EA5E9",
    },
    semantic: {
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    neutral: {
      gray50: "#F9FAFB",
      gray100: "#F3F4F6",
      gray200: "#E5E7EB",
      gray300: "#D1D5DB",
      gray400: "#9CA3AF",
      gray500: "#6B7280",
      gray600: "#4B5563",
      gray700: "#374151",
      gray800: "#1F2937",
      gray900: "#111827",
    },
    surface: {
      background: "#F9FAFB",
      card: "#FFFFFF",
      sidebar: "#1E293B",
      header: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, -apple-system, sans-serif",
      mono: "JetBrains Mono, Fira Code, monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    DEFAULT: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
} as const;

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
