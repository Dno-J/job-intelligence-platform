import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function CompaniesChart({ data = [] }) {
  const limitedData = data.slice(0, 10);

  const shortenLabel = (label = "") => {
    if (label.length <= 24) return label;
    return `${label.slice(0, 24)}...`;
  };

  const chartData = {
    labels: limitedData.map((item) => shortenLabel(item.company)),
    datasets: [
      {
        label: "Jobs",
        data: limitedData.map((item) => item.jobs),
        backgroundColor: "rgba(34, 197, 94, 0.65)",
        hoverBackgroundColor: "rgba(34, 197, 94, 1)",
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        right: 12,
      },
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
            return limitedData[index]?.company || "";
          },
          label: (context) => `${context.raw || 0} jobs`,
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
        <p className="text-gray-500 text-sm">No company data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow h-[420px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-200">
          Top Companies
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Companies with highest active job listings
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default CompaniesChart;