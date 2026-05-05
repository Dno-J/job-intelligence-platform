import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRecommendedJobs, saveJob, getSavedJobs } from "../services/api";

function RecommendedJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("jobintel_token");

  const cleanLabel = (value) => {
    if (!value) return "N/A";

    return value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
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

  const loadRecommendedJobs = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [recommendedRes, savedRes] = await Promise.all([
        getRecommendedJobs({ limit: 20 }),
        getSavedJobs(),
      ]);

      setJobs(recommendedRes.data?.results || []);
      setSavedJobIds((savedRes.data || []).map((job) => job.id));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("jobintel_token");
        localStorage.removeItem("jobintel_user");
        navigate("/login");
        return;
      }

      setError("Could not load recommended jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveJob = async (jobId) => {
    setMessage("");
    setError("");

    if (savedJobIds.includes(jobId)) {
      setMessage("This job is already saved.");
      return;
    }

    setSavingJobId(jobId);

    try {
      await saveJob(jobId);
      setSavedJobIds((prev) => [...prev, jobId]);
      setMessage("Job saved successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(err.response?.data?.detail || "Could not save job.");
    } finally {
      setSavingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-72 bg-gray-800 rounded" />
            <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl" />
            <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl" />
            <div className="h-32 bg-gray-900 border border-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm text-blue-400 font-medium mb-2">
            Personalized matches
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Recommended Jobs
          </h1>

          <p className="text-gray-400 text-sm mt-2 max-w-2xl">
            These jobs are ranked using your profile skills, target role,
            preferred location, job type, and experience level.
          </p>
        </div>

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

        {jobs.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-semibold">
              No recommendations yet
            </h2>

            <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
              Add skills, target role, preferred job type, and location in your
              profile so JobIntel can recommend better jobs.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/profile"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
              >
                Update Profile
              </Link>

              <Link
                to="/jobs"
                className="px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm font-medium"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {jobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);

              return (
                <div
                  key={job.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/40 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-600/15 text-blue-300 text-xs border border-blue-500/20">
                          Match Score: {job.match_score}
                        </span>

                        {job.source && (
                          <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-gray-400 text-xs">
                            {job.source}
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-gray-500 text-xs">
                          {formatDate(job.scraped_at)}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold">
                        {job.title}
                      </h2>

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

                      {job.matched_skills?.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs text-gray-500 mb-2">
                            Matched Skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {job.matched_skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full bg-green-600/15 text-green-300 text-xs border border-green-500/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.reasons?.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs text-gray-500 mb-2">
                            Why recommended
                          </p>

                          <ul className="space-y-1 text-sm text-gray-400">
                            {job.reasons.map((reason) => (
                              <li key={reason}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[150px]">
                      {job.source_url && (
                        <a
                          href={job.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm text-center"
                        >
                          View Job
                        </a>
                      )}

                      <button
                        onClick={() => handleSaveJob(job.id)}
                        disabled={isSaved || savingJobId === job.id}
                        className={`px-4 py-2 rounded-xl text-sm transition ${
                          isSaved
                            ? "bg-green-600/20 text-green-300 border border-green-500/20 cursor-default"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        } disabled:opacity-70`}
                      >
                        {savingJobId === job.id
                          ? "Saving..."
                          : isSaved
                          ? "Saved"
                          : "Save Job"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm text-gray-400 leading-6">
            Recommendation logic is currently rule-based. It ranks jobs using
            profile skills, target role, location, job type, experience level,
            and extracted job skills. Later, it can be upgraded into a smarter
            scoring engine.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecommendedJobs;