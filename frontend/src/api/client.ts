import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { DESIGN_TOKENS } from "./config";

const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8001";
const PROJECT_SERVICE_URL = import.meta.env.VITE_PROJECT_SERVICE_URL || "http://localhost:8002";
const FORECASTING_SERVICE_URL = import.meta.env.VITE_FORECASTING_SERVICE_URL || "http://localhost:8003";
const ASSISTANT_SERVICE_URL = import.meta.env.VITE_ASSISTANT_SERVICE_URL || "http://localhost:8004";

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const authClient = createClient(`${AUTH_SERVICE_URL}/api`);
export const projectClient = createClient(`${PROJECT_SERVICE_URL}/api`);
export const forecastingClient = createClient(`${FORECASTING_SERVICE_URL}/api`);
export const assistantClient = createClient(`${ASSISTANT_SERVICE_URL}/api`);

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export default createClient;
