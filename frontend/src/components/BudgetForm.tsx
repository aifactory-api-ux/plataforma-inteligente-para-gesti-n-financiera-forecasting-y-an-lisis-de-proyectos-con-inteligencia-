import React from "react";
import { BudgetVersion } from "@/api/types";
import { classNames } from "@/utils/formatters";

interface BudgetFormProps {
  budget?: BudgetVersion;
  onSubmit: (data: BudgetVersion) => void;
  loading?: boolean;
}

export default function BudgetForm({ budget, onSubmit, loading }: BudgetFormProps) {
  const [version, setVersion] = React.useState(budget?.version || 1);
  const [isBaseline, setIsBaseline] = React.useState(budget?.is_baseline || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: budget?.id || 0,
      project_id: budget?.project_id || 0,
      version,
      is_baseline: isBaseline,
      created_at: budget?.created_at || new Date().toISOString(),
      items: budget?.items || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        {budget ? "Edit Budget Version" : "Create Budget Version"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="label">Version Number</label>
          <input
            type="number"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value))}
            className="input"
            min={1}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="baseline"
            checked={isBaseline}
            onChange={(e) => setIsBaseline(e.target.checked)}
            className="w-4 h-4 text-primary-blue rounded border-neutral-300 focus:ring-primary-blue"
          />
          <label htmlFor="baseline" className="text-sm font-medium text-neutral-700">
            Set as baseline version
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
