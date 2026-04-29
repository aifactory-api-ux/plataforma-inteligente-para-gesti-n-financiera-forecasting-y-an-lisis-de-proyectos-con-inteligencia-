import React from "react";
import { Project } from "@/api/types";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectSelector({ projects, selectedProjectId, onSelect }: ProjectSelectorProps) {
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="relative">
      <select
        value={selectedProjectId || ""}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="appearance-none w-full pl-4 pr-10 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
