import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getSavedJobs,
  getSavedJobStats,
  updateSavedJob,
  unsaveJob,
} from "../services/api";

function SavedJobs() {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [editingNotes, setEditingNotes] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("jobintel_token");

  const statusOptions = [
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
  ];

  const statusCards = [
    {
      key: "total",
      label: "Total",
      description: "All tracked jobs",
    },
    {
      key: "saved",
      label: "Saved",
      description: "Bookmarked jobs",
    },
    {
      key: "applied",
      label: "Applied",
      description: "Applications sent",
    },
    {
      key: "interviewing",
      label: "Interviewing",
      description: "Active interviews",
    },
    {
      key: "offer",
      label: "Offers",
      description: "Positive outcomes",
    },
    {
      key: "rejected",
      label: "Rejected",
      description: "Closed outcomes",
    },
  ];

  const cleanLabel = (value) => {
    if (!value) return "N/A";

    return value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not set";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not set";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (min, max, currency = "USD") => {
    if (!min && !max) return "Salary not listed";

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    });

    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;

    return `Up to ${formatter.format(max)}`;
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-600/15 text-blue-300 border-blue-500/20";
      case "interviewing":
        return "bg-purple-600/15 text-purple-300 border-purple-500/20";
      case "offer":
        return "bg-green-600/15 text-green-300 border-green-500/20";
      case "rejected":
        return "bg-red-600/15 text-red-300 border-red-500/20";
      default:
        return "bg-gray-700/30 text-gray-300 border-gray-600/30";
    }
  };

  const progressPercent = useMemo(() => {
    const total = stats.total || 0;

    if (!total) return 0;

    const movedForward =
      (stats.applied || 0) +
      (stats.interviewing || 0) +
      (stats.offer || 0) +
      (stats.rejected || 0);

    return Math.round((movedForward / total) * 100);
  }, [stats]);

  const loadSavedJobs = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = statusFilter ? { status_filter: statusFilter } : {};

      const [jobsRes, statsRes] = await Promise.all([
        getSavedJobs(params),
        getSavedJobStats(),
      ]);

      const jobs = jobsRes.data || [];

      setSavedJobs(jobs);
      setStats(
        statsRes.data || {
          total: 0,
          saved: 0,
          applied: 0,
          interviewing: 0,
          offer: 0,
          rejected: 0,
        }
      );

      const notesMap = {};
      jobs.forEach((job) => {
        notesMap[job.id] = job.notes || "";
      });
      setEditingNotes(notesMap);
    } catch (err) {
      setError("Could not load application tracker.");

      if (err.response?.status === 401) {
        localStorage.removeItem("jobintel_token");
        localStorage.removeItem("jobintel_user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (jobId, newStatus) => {
    setUpdatingId(jobId);
    setMessage("");
    setError("");

    try {
      await updateSavedJob(jobId, {
        status: newStatus,
      });

      setMessage("Application status updated.");
      await loadSavedJobs();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesChange = (jobId, value) => {
    setEditingNotes((prev) => ({
      ...prev,
      [jobId]: value,
    }));
  };

  const handleSaveNotes = async (jobId) => {
    setUpdatingId(jobId);
    setMessage("");
    setError("");

    try {
      await updateSavedJob(jobId, {
        notes: editingNotes[jobId] || "",
      });

      setMessage("Notes updated.");
      await loadSavedJobs();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update notes.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUnsave = async (jobId) => {
    setRemovingId(jobId);
    setMessage("");
    setError("");

    try {
      await unsaveJob(jobId);
      setMessage("Job removed from tracker.");
      await loadSavedJobs();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not remove job.");
    } finally {
      setRemovingId(null);
    }
  };

  const getStatusCardClass = (cardKey) => {
    const isActive =
      (cardKey === "total" && statusFilter === "") || statusFilter === cardKey;

    if (isActive) {
      return "border-blue-500 bg-blue-600/15 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10";
    }

    return "border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/60";
  };

  const getStatusTextClass = (cardKey) => {
    const isActive =
      (cardKey === "total" && statusFilter === "") || statusFilter === cardKey;

    if (isActive) {
      return {
        label: "text-blue-300",
        value: "text-white",
        description: "text-blue-100/70",
      };
    }

    return {
      label: "text-gray-400",
      value: "text-white",
      description: "text-gray-500",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-56 bg-gray-900 border border-gray-800 rounded-3xl" />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-28 bg-gray-900 border border-gray-800 rounded-2xl"
                />
              ))}
            </div>

            <div className="h-20 bg-gray-900 border border-gray-800 rounded-2xl" />
            <div className="h-56 bg-gray-900 border border-gray-800 rounded-3xl" />
            <div className="h-56 bg-gray-900 border border-gray-800 rounded-3xl" />
            <div className="h-56 bg-gray-900 border border-gray-800 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_30%)]" />

            <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
              <div>
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300 mb-5">
                  Application Workflow
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Application Tracker
                </h1>

                <p className="text-gray-400 mt-4 max-w-2xl leading-7">
                  Turn saved jobs into a real job-search workflow. Track
                  progress, update application stages, keep notes, and manage
                  outcomes from one workspace.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    to="/recommended"
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                  >
                    Recommended Jobs
                  </Link>

                  <Link
                    to="/jobs"
                    className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-blue-500/50 transition text-sm font-medium text-center"
                  >
                    Browse Jobs
                  </Link>

                  <Link
                    to="/profile"
                    className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-green-500/50 transition text-sm font-medium text-center"
                  >
                    Update Profile
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-5 min-w-[260px]">
                <p className="text-xs text-gray-500">Application Progress</p>

                <div className="mt-3 flex items-end justify-between">
                  <h2 className="text-3xl font-semibold">
                    {progressPercent}%
                  </h2>
                  <span className="text-xs text-gray-500">
                    moved past saved
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-4 leading-5">
                  Based on jobs marked applied, interviewing, offer, or
                  rejected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statusCards.map((card) => {
            const textClass = getStatusTextClass(card.key);
            const isActive =
              (card.key === "total" && statusFilter === "") ||
              statusFilter === card.key;

            return (
              <button
                key={card.key}
                onClick={() =>
                  setStatusFilter(card.key === "total" ? "" : card.key)
                }
                className={`relative rounded-2xl border p-5 text-left transition-all duration-200 ${getStatusCardClass(
                  card.key
                )}`}
              >
                {isActive && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-medium text-white">
                    Active
                  </span>
                )}

                <p className={`text-xs ${textClass.label}`}>{card.label}</p>

                <h3 className={`text-3xl font-semibold mt-2 ${textClass.value}`}>
                  {stats?.[card.key] ?? 0}
                </h3>

                <p className={`text-xs mt-2 ${textClass.description}`}>
                  {card.description}
                </p>
              </button>
            );
          })}
        </section>

        <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Tracked Jobs</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {savedJobs.length} jobs
                {statusFilter
                  ? ` with status "${cleanLabel(statusFilter)}"`
                  : " across all statuses"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-56 rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-sm"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </section>

        {savedJobs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✓</span>
            </div>

            <h2 className="text-2xl font-semibold">No jobs in this view</h2>

            <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto leading-6">
              Save jobs from the Jobs or Recommended pages to start tracking
              your applications. Then move them through stages as your job
              search progresses.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/jobs"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
              >
                Browse Jobs
              </Link>

              <Link
                to="/recommended"
                className="px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm font-medium"
              >
                View Recommended
              </Link>
            </div>
          </div>
        ) : (
          <section className="space-y-5">
            {savedJobs.map((job) => (
              <article
                key={job.id}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-blue-500/30 transition"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${statusBadgeClass(
                          job.application_status
                        )}`}
                      >
                        {cleanLabel(job.application_status)}
                      </span>

                      {job.source && (
                        <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-xs text-gray-400">
                          {job.source}
                        </span>
                      )}

                      <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-xs text-gray-500">
                        Saved {formatDate(job.saved_at)}
                      </span>

                      {job.applied_at && (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20 text-xs">
                          Applied {formatDate(job.applied_at)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold leading-tight">
                      {job.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      {job.company || "Unknown Company"} •{" "}
                      {job.location || "Remote"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.job_type && (
                        <span className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full">
                          {cleanLabel(job.job_type)}
                        </span>
                      )}

                      {job.experience_level && (
                        <span className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
                          {cleanLabel(job.experience_level)}
                        </span>
                      )}

                      <span className="text-xs px-3 py-1.5 bg-gray-950 text-gray-400 border border-gray-800 rounded-full">
                        {formatSalary(
                          job.salary_min,
                          job.salary_max,
                          job.currency
                        )}
                      </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-950 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <label className="block text-sm font-medium text-gray-300">
                          Application Notes
                        </label>

                        <span className="text-xs text-gray-500">
                          Recruiter names, links, follow-up dates, reminders...
                        </span>
                      </div>

                      <textarea
                        value={editingNotes[job.id] || ""}
                        onChange={(e) =>
                          handleNotesChange(job.id, e.target.value)
                        }
                        placeholder="Add notes like applied link, recruiter name, follow-up date..."
                        rows="3"
                        className="w-full rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                      />

                      <button
                        onClick={() => handleSaveNotes(job.id)}
                        disabled={updatingId === job.id}
                        className="mt-3 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
                      >
                        {updatingId === job.id ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>

                  <aside className="xl:w-60 space-y-3">
                    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
                      <label className="block text-xs text-gray-500 mb-2">
                        Application Status
                      </label>

                      <select
                        value={job.application_status || "saved"}
                        onChange={(e) =>
                          handleStatusChange(job.id, e.target.value)
                        }
                        disabled={updatingId === job.id}
                        className="w-full rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>

                      <p className="text-xs text-gray-500 mt-3 leading-5">
                        Move this job through your application workflow.
                      </p>
                    </div>

                    {job.source_url && (
                      <a
                        href={job.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                      >
                        View Job
                      </a>
                    )}

                    <button
                      onClick={() => handleUnsave(job.id)}
                      disabled={removingId === job.id}
                      className="w-full px-4 py-3 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm"
                    >
                      {removingId === job.id ? "Removing..." : "Remove"}
                    </button>
                  </aside>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-600/10 p-6">
          <h2 className="text-lg font-semibold text-blue-100">
            Why this feature matters
          </h2>
          <p className="text-sm text-blue-100/75 mt-2 leading-6">
            This tracker turns JobIntel from a job search dashboard into a
            complete job-search workflow. Recruiters can see that the app
            supports real user behavior: saving opportunities, tracking status,
            and recording notes.
          </p>
        </section>
      </div>
    </div>
  );
}

export default SavedJobs;