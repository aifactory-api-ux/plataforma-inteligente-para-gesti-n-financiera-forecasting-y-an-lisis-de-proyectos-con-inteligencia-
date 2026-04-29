import React from "react";
import Head from "next/head";
import { Sidebar, Header, DataTable } from "@/components";
import { useAuth } from "@/api/hooks";
import { APP_NAME } from "@/utils/constants";
import { User } from "@/api/types";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState("admin");

  const userColumns = [
    { key: "full_name", label: "Name", render: (value: string, row: User) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center">
          <span className="text-white text-xs font-medium">{value.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <p className="font-medium text-neutral-900">{value}</p>
          <p className="text-xs text-neutral-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: "role", label: "Role", render: (value: string) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-blue/10 text-primary-blue capitalize">
        {value}
      </span>
    )},
    { key: "is_active", label: "Status", render: (value: boolean) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${value ? "bg-semantic-success/10 text-semantic-success" : "bg-semantic-error/10 text-semantic-error"}`}>
        {value ? "Active" : "Inactive"}
      </span>
    )},
  ];

  const mockUsers: User[] = [
    { id: 1, email: "juan@example.com", full_name: "Juan Diaz", role: "admin", is_active: true, created_at: new Date().toISOString() },
    { id: 2, email: "maria@example.com", full_name: "Maria Garcia", role: "manager", is_active: true, created_at: new Date().toISOString() },
    { id: 3, email: "carlos@example.com", full_name: "Carlos Rodriguez", role: "analyst", is_active: true, created_at: new Date().toISOString() },
  ];

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Head>
        <title>{APP_NAME} - Admin</title>
      </Head>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={logout} onProjectChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-neutral-900">Admin</h2>
          <p className="text-neutral-500 mt-1">System administration</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Users</h3>
            <DataTable columns={userColumns} data={mockUsers} />
          </div>
        </main>
      </div>
    </div>
  );
}
