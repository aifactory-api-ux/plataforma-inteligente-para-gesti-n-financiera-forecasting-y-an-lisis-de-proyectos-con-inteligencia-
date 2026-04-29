import { useState, useCallback } from "react";
import { projectClient } from "../client";
import { BudgetVersion, BudgetVersionCreate, BudgetItem, BudgetItemUpdate } from "@/api/types";

interface UseBudgetsReturn {
  budgets: BudgetVersion[];
  loading: boolean;
  error: string | null;
  fetchBudgets: (projectId: number) => Promise<void>;
  createBudget: (projectId: number, data: BudgetVersionCreate) => Promise<BudgetVersion>;
  updateBudgetItem: (itemId: number, data: BudgetItemUpdate) => Promise<BudgetItem>;
  fetchBudgetItems: (budgetVersionId: number) => Promise<BudgetItem[]>;
}

export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<BudgetVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async (projectId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.get<BudgetVersion[]>(`/projects/${projectId}/budgets/`);
      setBudgets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (projectId: number, data: BudgetVersionCreate): Promise<BudgetVersion> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.post<BudgetVersion>(`/projects/${projectId}/budgets/`, data);
      setBudgets((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create budget");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudgetItem = useCallback(async (itemId: number, data: BudgetItemUpdate): Promise<BudgetItem> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.patch<BudgetItem>(`/budgets/items/${itemId}`, data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update budget item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudgetItems = useCallback(async (budgetVersionId: number): Promise<BudgetItem[]> => {
    try {
      const response = await projectClient.get<BudgetItem[]>(`/budgets/${budgetVersionId}/items/`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch budget items");
      return [];
    }
  }, []);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createBudget,
    updateBudgetItem,
    fetchBudgetItems,
  };
}
