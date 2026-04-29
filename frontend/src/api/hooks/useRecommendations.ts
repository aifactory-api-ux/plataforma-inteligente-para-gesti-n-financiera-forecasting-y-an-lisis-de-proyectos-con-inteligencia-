import { useState, useCallback } from "react";
import { projectClient } from "../client";
import { Recommendation, RecommendationCreate } from "@/api/types";

interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: (projectId: number) => Promise<void>;
  createRecommendation: (projectId: number, data: RecommendationCreate) => Promise<Recommendation>;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.get<Recommendation[]>(`/projects/${projectId}/recommendations/`);
      setRecommendations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecommendation = useCallback(async (projectId: number, data: RecommendationCreate): Promise<Recommendation> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.post<Recommendation>(`/projects/${projectId}/recommendations/`, data);
      setRecommendations((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create recommendation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    createRecommendation,
  };
}
