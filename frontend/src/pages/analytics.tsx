import React from "react";
import Head from "next/head";
import { Sidebar, Header } from "@/components";
import { useAuth } from "@/api/hooks";
import { APP_NAME } from "@/utils/constants";

export default function AnalyticsPage() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("analytics");

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Head>
        <title>{APP_NAME} - Analytics</title>
      </Head>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} onProjectChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-neutral-900">Analytics</h2>
          <p className="text-neutral-500 mt-1">Detailed project analytics</p>
        </main>
      </div>
    </div>
  );
}
