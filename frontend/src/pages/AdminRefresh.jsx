import { useState } from "react";
import { runManualScrape } from "../services/api";

function AdminRefresh() {
  const [adminSecret, setAdminSecret] = useState("");
  const [source, setSource] = useState("all");
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    if (!adminSecret.trim()) {
      setError("Admin secret is required.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await runManualScrape({
        source,
        limit,
        adminSecret: adminSecret.trim(),
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Manual refresh failed. Check the admin secret or backend logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = result
    ? [
        { label: "Seen", value: result.jobs_seen },
        { label: "Inserted", value: result.jobs_inserted },
        { label: "Refreshed", value: result.jobs_refreshed },
        { label: "Skipped", value: result.jobs_skipped },
        { label: "Skills Linked", value: result.skills_linked },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-sm text-blue-400 font-medium mb-2">
            Admin Only
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Manual Job Refresh
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-2xl">
            Refresh production job data on demand without running scraper
            containers continuously. This page is hidden from navigation and
            requires the backend admin secret.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-300 mb-2">
                Admin Secret
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Paste ADMIN_SECRET_KEY"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                This value is not stored in the frontend code. Paste it only
                when you want to refresh jobs.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="remotive">Remotive</option>
                <option value="remoteok">RemoteOK</option>
                <option value="arbeitnow">Arbeitnow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Limit per Source
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-sm font-medium transition"
              >
                {loading ? "Refreshing..." : "Refresh Jobs"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-5 border border-red-800 bg-red-950/40 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {card.value ?? 0}
                  </p>
                </div>
              ))}
            </div>

            {Array.isArray(result.sources) && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Source Breakdown
                </h2>

                <div className="space-y-4">
                  {result.sources.map((item) => (
                    <div
                      key={item.source}
                      className="border border-gray-800 rounded-xl p-4 bg-gray-950"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium capitalize">
                          {item.source}
                        </h3>

                        {item.error ? (
                          <span className="text-xs text-red-300 bg-red-950/50 px-3 py-1 rounded-full">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs text-green-300 bg-green-950/50 px-3 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      {item.error ? (
                        <p className="text-sm text-red-300">
                          {item.error}
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <p className="text-gray-400">
                            Seen:{" "}
                            <span className="text-white">
                              {item.jobs_seen}
                            </span>
                          </p>
                          <p className="text-gray-400">
                            Inserted:{" "}
                            <span className="text-white">
                              {item.jobs_inserted}
                            </span>
                          </p>
                          <p className="text-gray-400">
                            Refreshed:{" "}
                            <span className="text-white">
                              {item.jobs_refreshed}
                            </span>
                          </p>
                          <p className="text-gray-400">
                            Skipped:{" "}
                            <span className="text-white">
                              {item.jobs_skipped}
                            </span>
                          </p>
                          <p className="text-gray-400">
                            Skills:{" "}
                            <span className="text-white">
                              {item.skills_linked}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">
                Raw Response
              </h2>
              <pre className="text-xs text-gray-300 bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRefresh;