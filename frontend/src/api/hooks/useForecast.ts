import { useState, useCallback } from "react";
import { forecastingClient } from "../client";
import { ForecastScenario, ForecastScenarioCreate, SHAPExplanation } from "@/api/types";

interface UseForecastReturn {
  forecasts: ForecastScenario[];
  loading: boolean;
  error: string | null;
  fetchForecasts: (projectId: number, scenario?: string) => Promise<void>;
  createForecast: (projectId: number, data: ForecastScenarioCreate) => Promise<ForecastScenario>;
  fetchSHAP: (forecastScenarioId: number) => Promise<SHAPExplanation | null>;
}

export function useForecast(): UseForecastReturn {
  const [forecasts, setForecasts] = useState<ForecastScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = useCallback(async (projectId: number, scenario?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (scenario) params.scenario = scenario;
      const response = await forecastingClient.get<ForecastScenario[]>(`/projects/${projectId}/forecast/`, { params });
      setForecasts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch forecasts");
    } finally {
      setLoading(false);
    }
  }, []);

  const createForecast = useCallback(async (projectId: number, data: ForecastScenarioCreate): Promise<ForecastScenario> => {
    setLoading(true);
    setError(null);
    try {
      const response = await forecastingClient.post<ForecastScenario>(`/projects/${projectId}/forecast/`, data);
      setForecasts((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create forecast");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSHAP = useCallback(async (forecastScenarioId: number): Promise<SHAPExplanation | null> => {
    try {
      const response = await forecastingClient.get<SHAPExplanation>(`/forecast/${forecastScenarioId}/shap/`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch SHAP explanation");
      return null;
    }
  }, []);

  return {
    forecasts,
    loading,
    error,
    fetchForecasts,
    createForecast,
    fetchSHAP,
  };
}
