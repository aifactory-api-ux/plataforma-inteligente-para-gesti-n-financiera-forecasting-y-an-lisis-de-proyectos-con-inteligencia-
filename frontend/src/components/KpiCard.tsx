import React from "react";
import { classNames } from "@/utils/formatters";

interface KpiCardProps {
  title: string;
  value: number | string;
  trend?: "up" | "down" | "neutral";
  color?: string;
  icon?: string;
}

export default function KpiCard({ title, value, trend, color = "primary-blue", icon }: KpiCardProps) {
  const trendColors = {
    up: "text-semantic-success",
    down: "text-semantic-error",
    neutral: "text-neutral-500",
  };

  const trendIcons = {
    up: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    down: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6",
    neutral: "M5 12h14",
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{value}</p>
          {trend && (
            <div className={classNames("flex items-center gap-1 mt-2", trendColors[trend])}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendIcons[trend]} />
              </svg>
              <span className="text-sm font-medium">
                {trend === "up" ? "+12%" : trend === "down" ? "-8%" : "0%"}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={classNames("p-3 rounded-lg bg-primary-blue/10 text-primary-blue")}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
