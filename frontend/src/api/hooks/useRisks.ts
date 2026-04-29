import { useState, useCallback } from "react";
import { projectClient } from "../client";
import { Risk, RiskCreate, RiskUpdate } from "@/api/types";

interface UseRisksReturn {
  risks: Risk[];
  loading: boolean;
  error: string | null;
  fetchRisks: (projectId: number) => Promise<void>;
  createRisk: (projectId: number, data: RiskCreate) => Promise<Risk>;
  updateRisk: (riskId: number, data: RiskUpdate) => Promise<Risk>;
}

export function useRisks(): UseRisksReturn {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisks = useCallback(async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.get<Risk[]>(`/projects/${projectId}/risks/`);
      setRisks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch risks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRisk = useCallback(async (projectId: number, data: RiskCreate): Promise<Risk> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.post<Risk>(`/projects/${projectId}/risks/`, data);
      setRisks((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create risk");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRisk = useCallback(async (riskId: number, data: RiskUpdate): Promise<Risk> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.patch<Risk>(`/risks/${riskId}`, data);
      setRisks((prev) => prev.map((r) => (r.id === riskId ? response.data : r)));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update risk");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    risks,
    loading,
    error,
    fetchRisks,
    createRisk,
    updateRisk,
  };
}
