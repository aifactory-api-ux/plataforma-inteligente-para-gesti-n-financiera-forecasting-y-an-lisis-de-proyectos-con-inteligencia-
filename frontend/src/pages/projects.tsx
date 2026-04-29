import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Sidebar, Header, DataTable, Modal, ProjectSelector } from "@/components";
import { useAuth } from "@/api/hooks";
import { useProjects } from "@/api/hooks";
import { APP_NAME, PROJECT_STATUSES } from "@/utils/constants";
import { Project } from "@/api/types";

export default function ProjectsPage() {
  const { user, logout } = useAuth();
  const { projects, fetchProjects, createProject, deleteProject, setSelectedProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState("projects");

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Project", render: (value: string, row: Project) => (
      <div>
        <p className="font-medium text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{row.description}</p>
      </div>
    )},
    { key: "status", label: "Status", render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === PROJECT_STATUSES.ACTIVO ? "bg-semantic-success/10 text-semantic-success" :
        value === PROJECT_STATUSES.EN_EJECUCION ? "bg-primary-blue/10 text-primary-blue" :
        value === PROJECT_STATUSES.FINALIZADO ? "bg-neutral-100 text-neutral-600" :
        "bg-semantic-error/10 text-semantic-error"
      }`}>
        {value}
      </span>
    )},
    { key: "budget_total", label: "Budget", render: (value: number) => `€${value.toLocaleString()}` },
    { key: "execution_total", label: "Executed", render: (value: number) => `€${value.toLocaleString()}` },
    { key: "deviation", label: "Deviation", render: (value: number) => (
      <span className={value > 0 ? "text-semantic-success" : value < 0 ? "text-semantic-error" : ""}>
        {value > 0 ? "+" : ""}{value.toFixed(1)}%
      </span>
    )},
    { key: "start_date", label: "Start Date", render: (value: string) => new Date(value).toLocaleDateString() },
  ];

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Head>
        <title>{APP_NAME} - Projects</title>
      </Head>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} onProjectChange={(id) => setSelectedProject(projects.find(p => p.id === id) || null)} />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Projects</h2>
              <p className="text-neutral-500 mt-1">Manage your projects</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + New Project
            </button>
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredProjects} onRowClick={(row) => setSelectedProject(row)} />
        </main>
      </div>

      <Modal open={showCreateModal} title="Create Project" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input" placeholder="Project name" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} placeholder="Project description" />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
