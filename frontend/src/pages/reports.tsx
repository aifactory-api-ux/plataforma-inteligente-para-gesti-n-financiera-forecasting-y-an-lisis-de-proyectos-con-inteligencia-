import React from "react";
import Head from "next/head";
import { Sidebar, Header } from "@/components";
import { useAuth } from "@/api/hooks";
import { APP_NAME } from "@/utils/constants";

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("reports");

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Head>
        <title>{APP_NAME} - Reports</title>
      </Head>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} onProjectChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-neutral-900">Reports</h2>
          <p className="text-neutral-500 mt-1">Generate and download reports</p>
        </main>
      </div>
    </div>
  );
}
