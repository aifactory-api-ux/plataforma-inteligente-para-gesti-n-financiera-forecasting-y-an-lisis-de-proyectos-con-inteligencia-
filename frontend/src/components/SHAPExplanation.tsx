import React from "react";
import { SHAPExplanation } from "@/api/types";

interface SHAPExplanationProps {
  explanation: SHAPExplanation | null;
}

export default function SHAPExplanationComponent({ explanation }: SHAPExplanationProps) {
  if (!explanation) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">SHAP Explainability</h3>
        <p className="text-neutral-500 text-sm">No explanation available</p>
      </div>
    );
  }

  const features = Object.entries(explanation.feature_importances).sort(
    (a, b) => b[1] - a[1]
  );

  const maxValue = Math.max(...features.map(([, v]) => v));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">SHAP Feature Importance</h3>
      <div className="space-y-3">
        {features.map(([feature, value]) => (
          <div key={feature}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700 capitalize">
                {feature.replace(/_/g, " ")}
              </span>
              <span className="text-sm text-neutral-500">
                {(value * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${(value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          Generated: {new Date(explanation.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
