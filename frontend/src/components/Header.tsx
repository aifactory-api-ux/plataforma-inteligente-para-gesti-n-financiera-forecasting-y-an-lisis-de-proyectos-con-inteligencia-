import React from "react";
import { User } from "@/api/types";
import { classNames } from "@/utils/formatters";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onProjectChange: (projectId: number) => void;
}

export default function Header({ user, onLogout, onProjectChange }: HeaderProps) {
  return (
    <header className="h-16 bg-surface-header border-b border-neutral-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-neutral-500 hover:text-neutral-700 relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-semantic-error rounded-full"></span>
        </button>
        <div className="h-6 w-px bg-neutral-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-900">{user?.full_name || "Guest"}</p>
            <p className="text-xs text-neutral-500">{user?.role || "viewer"}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-neutral-500 hover:text-neutral-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
