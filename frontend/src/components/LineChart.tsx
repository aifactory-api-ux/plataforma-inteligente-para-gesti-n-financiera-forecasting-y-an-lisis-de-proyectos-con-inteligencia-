import React, { useEffect, useRef } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ChartDataPoint {
  date: string;
  planned: number;
  executed: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
}

export default function LineChart({ data, width = 600, height = 300 }: LineChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Planned",
        data: data.map((d) => d.planned),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Executed",
        data: data.map((d) => d.executed),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
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
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#E5E7EB",
        },
      },
    },
  };

  return (
    <div className="card" style={{ width, height }}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Budget vs Execution</h3>
      <div style={{ height: height - 80 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
