import { useState, useCallback } from "react";
import { forecastingClient } from "../client";
import { SHAPExplanation } from "@/api/types";

interface UseSHAPReturn {
  explanation: SHAPExplanation | null;
  loading: boolean;
  error: string | null;
  fetchExplanation: (forecastScenarioId: number) => Promise<SHAPExplanation | null>;
}

export function useSHAP(): UseSHAPReturn {
  const [explanation, setExplanation] = useState<SHAPExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (forecastScenarioId: number): Promise<SHAPExplanation | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await forecastingClient.get<SHAPExplanation>(`/forecast/${forecastScenarioId}/shap/`);
      setExplanation(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch SHAP explanation");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    explanation,
    loading,
    error,
    fetchExplanation,
  };
}
