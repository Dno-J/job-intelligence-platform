import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";
import { useAnalytics } from "../context/AnalyticsContext";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function TrendsChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const { filters, setFilters } = useAnalytics();

  const totalJobs = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const chartData = {
    labels: data.map((item) => formatDateLabel(item.date)),
    datasets: [
      {
        label: "Jobs",
        data: data.map((item) => item.count),

        borderColor: filters.date
          ? "rgba(34, 197, 94, 1)"
          : "rgba(139, 92, 246, 1)",

        backgroundColor: filters.date
          ? "rgba(34, 197, 94, 0.14)"
          : "rgba(139, 92, 246, 0.14)",

        borderWidth: 3,
        tension: 0.4,
        fill: true,

        pointRadius: data.map((item, index) => {
          if (filters.date === item.date) return 6;
          if (index === activeIndex) return 6;
          return 3;
        }),

        pointHoverRadius: 7,

        pointBackgroundColor: data.map((item) =>
          filters.date === item.date ? "#22c55e" : "#8b5cf6"
        ),

        pointBorderColor: "#020617",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    animation: {
      duration: 500,
      easing: "easeOutQuart",
    },

    layout: {
      padding: {
        top: 8,
        right: 12,
      },
    },

    onHover: (_, elements) => {
      if (elements.length > 0) {
        setActiveIndex(elements[0].index);
      } else {
        setActiveIndex(null);
      }
    },

    onClick: (_, elements) => {
      if (!elements.length) return;

      const index = elements[0].index;
      const date = data[index]?.date;

      if (!date) return;

      setFilters((prev) => ({
        ...prev,
        date: prev.date === date ? null : date,
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
            return data[index]?.date || "";
          },
          label: (context) => `${context.raw || 0} jobs scraped`,
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },

      y: {
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
    },
  };

  if (!data.length) {
    return (
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow h-[420px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow h-[420px] flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-gray-200 tracking-tight">
            Job Trends Over Time
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Click a date point to filter analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-gray-400">
            {totalJobs} total jobs
          </span>

          {filters.date && (
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  date: null,
                }))
              }
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default TrendsChart;