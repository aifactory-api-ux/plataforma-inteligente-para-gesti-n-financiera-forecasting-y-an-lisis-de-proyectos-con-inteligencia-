import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ForecastScenario } from "@/api/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ForecastChartProps {
  data: ForecastScenario[];
  scenario: "optimista" | "esperado" | "critico";
}

export default function ForecastChart({ data, scenario }: ForecastChartProps) {
  const scenarioColors = {
    optimista: { border: "#22C55E", background: "rgba(34, 197, 94, 0.1)" },
    esperado: { border: "#3B82F6", background: "rgba(59, 130, 246, 0.1)" },
    critico: { border: "#EF4444", background: "rgba(239, 68, 68, 0.1)" },
  };

  const colors = scenarioColors[scenario];

  const chartData = {
    labels: data.map((d) => d.forecast_date),
    datasets: [
      {
        label: "Upper Bound",
        data: data.map((d) => d.upper_bound),
        borderColor: colors.border,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Forecast",
        data: data.map((d) => d.forecast_value),
        borderColor: colors.border,
        backgroundColor: colors.background,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Lower Bound",
        data: data.map((d) => d.lower_bound),
        borderColor: colors.border,
        backgroundColor: "transparent",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Forecast - {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
      </h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
