import React from "react";
import { Risk } from "@/api/types";
import { classNames } from "@/utils/formatters";

interface RiskPanelProps {
  risks: Risk[];
  onMitigate: (id: number) => void;
}

export default function RiskPanel({ risks, onMitigate }: RiskPanelProps) {
  const impactColors = {
    bajo: "bg-semantic-success/10 text-semantic-success",
    medio: "bg-semantic-warning/10 text-semantic-warning",
    alto: "bg-semantic-error/10 text-semantic-error",
  };

  const statusColors = {
    abierto: "bg-neutral-100 text-neutral-700",
    mitigado: "bg-semantic-info/10 text-semantic-info",
    cerrado: "bg-neutral-200 text-neutral-500",
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Risks</h3>
      <div className="space-y-3">
        {risks.length === 0 ? (
          <p className="text-neutral-500 text-sm">No risks identified</p>
        ) : (
          risks.map((risk) => (
            <div
              key={risk.id}
              className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{risk.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={classNames(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        impactColors[risk.impact]
                      )}
                    >
                      {risk.impact.toUpperCase()}
                    </span>
                    <span
                      className={classNames(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        statusColors[risk.status]
                      )}
                    >
                      {risk.status}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {Math.round(risk.probability * 100)}% probability
                    </span>
                  </div>
                </div>
                {risk.status === "abierto" && (
                  <button
                    onClick={() => onMitigate(risk.id)}
                    className="text-sm text-primary-blue hover:text-primary-lightBlue"
                  >
                    Mitigate
                  </button>
                )}
              </div>
              {risk.mitigation && (
                <p className="text-xs text-neutral-500 mt-2">Mitigation: {risk.mitigation}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
