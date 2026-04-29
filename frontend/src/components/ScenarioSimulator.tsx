import React, { useState } from "react";
import { ForecastScenario } from "@/api/types";
import { classNames } from "@/utils/formatters";

interface ScenarioSimulatorProps {
  scenarios: ForecastScenario[];
  onSimulate: (params: any) => void;
}

export default function ScenarioSimulator({ scenarios, onSimulate }: ScenarioSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<"optimista" | "esperado" | "critico">("esperado");
  const [uncertainty, setUncertainty] = useState(0.1);

  const handleSimulate = () => {
    onSimulate({ scenario: selectedScenario, parameters: { uncertainty } });
  };

  const scenarioOptions = [
    { id: "optimista", label: "Optimistic", color: "bg-semantic-success", description: "Best case scenario with 10% improvement" },
    { id: "esperado", label: "Expected", color: "bg-primary-blue", description: "Most likely scenario" },
    { id: "critico", label: "Critical", color: "bg-semantic-error", description: "Worst case scenario with 15% decline" },
  ] as const;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Scenario Simulator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="label">Scenario Type</label>
          <div className="grid grid-cols-3 gap-3">
            {scenarioOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedScenario(option.id)}
                className={classNames(
                  "p-3 border rounded-lg text-left transition-all",
                  selectedScenario === option.id
                    ? "border-primary-blue bg-primary-blue/5"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={classNames("w-3 h-3 rounded-full", option.color)}></div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <p className="text-xs text-neutral-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Uncertainty Margin: {(uncertainty * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0.01"
            max="0.3"
            step="0.01"
            value={uncertainty}
            onChange={(e) => setUncertainty(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-blue"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        <button onClick={handleSimulate} className="btn-primary w-full">
          Run Simulation
        </button>

        {scenarios.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">Simulation Results</h4>
            <div className="space-y-2">
              {scenarios.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <span className="text-sm font-medium capitalize">{s.scenario}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold">€{s.forecast_value.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">
                      €{s.lower_bound.toLocaleString()} - €{s.upper_bound.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
