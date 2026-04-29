import React from "react";
import { Recommendation } from "@/api/types";
import { formatRelativeTime } from "@/utils/formatters";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
}

export default function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI Recommendations</h3>
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-neutral-500 text-sm">No recommendations available</p>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-blue/10 rounded-lg">
                  <svg
                    className="w-4 h-4 text-primary-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">{rec.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-neutral-500">
                      {rec.source === "ia" ? "AI Generated" : "Manual"}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      {formatRelativeTime(rec.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
