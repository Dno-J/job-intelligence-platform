import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useState } from "react";
import { useAnalytics } from "../context/AnalyticsContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function SkillsChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const { filters, setFilters } = useAnalytics();

  const limitedData = data.slice(0, 10);
  const total = limitedData.reduce((sum, item) => sum + (item.count || 0), 0);

  const shortenLabel = (label = "") => {
    if (label.length <= 22) return label;
    return `${label.slice(0, 22)}...`;
  };

  const chartData = {
    labels: limitedData.map((item) => shortenLabel(item.skill)),
    datasets: [
      {
        label: "Demand",
        data: limitedData.map((item) => item.count),
        backgroundColor: limitedData.map((item, index) => {
          const isSelected = filters.skill === item.skill;
          const isHovered = index === activeIndex;

          if (isSelected) return "rgba(34, 197, 94, 1)";
          if (isHovered) return "rgba(96, 165, 250, 1)";
          return "rgba(59, 130, 246, 0.55)";
        }),
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 300,
    },

    layout: {
      padding: {
        right: 12,
      },
    },

    onHover: (event, elements) => {
      if (elements.length > 0) {
        setActiveIndex(elements[0].index);
      } else {
        setActiveIndex(null);
      }
    },

    onClick: (event, elements) => {
      if (!elements.length) return;

      const index = elements[0].index;
      const skill = limitedData[index]?.skill;

      if (!skill) return;

      setFilters((prev) => ({
        ...prev,
        skill: prev.skill === skill ? null : skill,
      }));
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,

        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return limitedData[index]?.skill || "";
          },
          label: (context) => {
            const value = context.raw || 0;
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${value} jobs (${percent}%)`;
          },
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "#9ca3af",
          precision: 0,
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#1f2937",
        },
      },
      y: {
        ticks: {
          color: "#9ca3af",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  if (!data.length) {
    return (
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow h-[420px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No skills data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow h-[420px] flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-gray-200 tracking-tight">
            Top Skills Demand
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Click a skill to filter analytics
          </p>
        </div>

        {filters.skill && (
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                skill: null,
              }))
            }
            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default SkillsChart;