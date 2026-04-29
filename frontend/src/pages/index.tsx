import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Sidebar, Header, KpiCard, LineChart, RiskPanel, RecommendationPanel, ChatPanel } from "@/components";
import { useAuth } from "@/api/hooks";
import { useProjectStore } from "@/state";
import { APP_NAME } from "@/utils/constants";

export default function DashboardPage() {
  const { user, logout, fetchUser } = useAuth();
  const { projects, selectedProject, setSelectedProject, fetchProjects } = useProjectStore();
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, []);

  const handleProjectChange = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project || null);
  };

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Head>
        <title>{APP_NAME} - Dashboard</title>
      </Head>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} onProjectChange={handleProjectChange} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
            <p className="text-neutral-500 mt-1">Overview of your projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KpiCard
              title="Total Budget"
              value="€1,250,000"
              trend="up"
              color="primary-blue"
              icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
            <KpiCard
              title="Total Execution"
              value="€875,000"
              trend="neutral"
              color="primary-blue"
              icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
            <KpiCard
              title="Deviation"
              value="-8.5%"
              trend="down"
              color="semantic-error"
              icon="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
            <KpiCard
              title="Active Projects"
              value="5"
              trend="up"
              color="semantic-success"
              icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LineChart
                data={[
                  { date: "Jan", planned: 100000, executed: 85000 },
                  { date: "Feb", planned: 150000, executed: 140000 },
                  { date: "Mar", planned: 200000, executed: 185000 },
                  { date: "Apr", planned: 250000, executed: 220000 },
                  { date: "May", planned: 300000, executed: 280000 },
                ]}
              />
            </div>
            <div>
              <RecommendationPanel recommendations={[]} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <RiskPanel risks={[]} onMitigate={(id) => console.log("Mitigate", id)} />
            <ChatPanel messages={[]} onSend={(msg) => console.log("Send", msg)} loading={false} />
          </div>
        </main>
      </div>
    </div>
  );
}
