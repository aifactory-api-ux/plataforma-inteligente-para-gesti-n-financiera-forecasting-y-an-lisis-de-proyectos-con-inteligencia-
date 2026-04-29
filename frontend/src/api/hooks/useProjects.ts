import { useState, useCallback } from "react";
import { projectClient } from "../client";
import { Project, ProjectCreate, ProjectUpdate } from "@/api/types";

interface UseProjectsReturn {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: (search?: string, status?: string) => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: number, data: ProjectUpdate) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (search?: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await projectClient.get<Project[]>("/projects/", { params });
      setProjects(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: ProjectCreate): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.post<Project>("/projects/", data);
      setProjects((prev) => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id: number, data: ProjectUpdate): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectClient.patch<Project>(`/projects/${id}`, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? response.data : p)));
      if (selectedProject?.id === id) {
        setSelectedProject(response.data);
      }
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  const deleteProject = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await projectClient.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  return {
    projects,
    selectedProject,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setSelectedProject,
  };
}
