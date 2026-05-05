import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getJobs,
  getJobById,
  getSavedJobs,
  saveJob,
} from "../services/api";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");

  const [sortBy, setSortBy] = useState("scraped_at");
  const [order, setOrder] = useState("desc");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savingJobId, setSavingJobId] = useState(null);
  const [message, setMessage] = useState("");

  const LIMIT = 10;
  const token = localStorage.getItem("jobintel_token");

  const hasActiveFilters =
    search ||
    location ||
    jobType ||
    experience ||
    sortBy !== "scraped_at" ||
    order !== "desc";

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently scraped";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently scraped";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = (min, max, currency = "USD") => {
    if (!min && !max) return "Salary not listed";

    const money = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    });

    if (min && max) return `${money.format(min)} - ${money.format(max)}`;
    if (min) return `From ${money.format(min)}`;

    return `Up to ${money.format(max)}`;
  };

  const cleanLabel = (value) => {
    if (!value) return "N/A";

    return value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setExperience("");
    setSortBy("scraped_at");
    setOrder("desc");
    setPage(1);
  };

  const loadSavedJobs = useCallback(async () => {
    if (!token) {
      setSavedJobIds([]);
      return;
    }

    try {
      const res = await getSavedJobs();
      const savedJobs = res.data || [];

      setSavedJobIds(savedJobs.map((job) => job.id));
    } catch (err) {
      console.error("Failed to fetch saved jobs", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("jobintel_token");
        localStorage.removeItem("jobintel_user");
        setSavedJobIds([]);
      }
    }
  }, [token]);

  const handleSaveJob = async (jobId) => {
    setMessage("");

    if (!token) {
      setMessage("Please login first to save jobs.");
      navigate("/login");
      return;
    }

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
      console.error("Failed to save job", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("jobintel_token");
        localStorage.removeItem("jobintel_user");
        setMessage("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      setMessage(err.response?.data?.detail || "Failed to save job.");
    } finally {
      setSavingJobId(null);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setDebouncedLocation(location.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, location]);

  useEffect(() => {
    document.body.style.overflow = selectedJob ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedJob]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: LIMIT,
        sort_by: sortBy,
        order,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (debouncedLocation) params.location = debouncedLocation;
      if (jobType) params.job_type = jobType;
      if (experience) params.experience_level = experience;

      const res = await getJobs(params);
      const data = res.data;

      setJobs(data.results || []);
      setTotalPages(data.meta?.total_pages || 1);
      setTotalJobs(data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      setError("Could not load jobs. Please try again.");
      setJobs([]);
      setTotalPages(1);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    debouncedLocation,
    jobType,
    experience,
    sortBy,
    order,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const fetchJobDetail = async (id) => {
    setSelectedJob(id);
    setDetailLoading(true);
    setJobDetail(null);

    try {
      const res = await getJobById(id);
      setJobDetail(res.data);
    } catch (err) {
      console.error("Failed to fetch job detail", err);
      setJobDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setJobDetail(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <section className="mb-8">
          <div className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950 p-8 md:p-10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_34%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_30%)]" />

            <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
              <div>
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300 mb-5">
                  Live Job Search
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Browse intelligent job listings
                </h1>

                <p className="text-gray-400 mt-4 max-w-2xl leading-7">
                  Search scraped jobs, filter by role type and experience level,
                  save opportunities, and inspect detailed job descriptions from
                  your live job intelligence pipeline.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    to="/recommended"
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                  >
                    View Recommended Jobs
                  </Link>

                  <Link
                    to="/saved-jobs"
                    className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-blue-500/50 transition text-sm font-medium text-center"
                  >
                    Application Tracker
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                <div className="rounded-2xl bg-gray-950/70 border border-gray-800 p-4">
                  <p className="text-xs text-gray-500">Total Results</p>
                  <p className="text-3xl font-semibold mt-1">{totalJobs}</p>
                </div>

                <div className="rounded-2xl bg-gray-950/70 border border-gray-800 p-4">
                  <p className="text-xs text-gray-500">Current Page</p>
                  <p className="text-3xl font-semibold mt-1">
                    {page}/{totalPages}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm text-blue-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-6">
          {/* FILTERS */}
          <aside className="lg:sticky lg:top-24 h-fit rounded-3xl border border-gray-800 bg-gray-900/70 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">Filters</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Refine job results
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-300 hover:text-red-200 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Search</label>
                <input
                  type="text"
                  placeholder="Python, React, Backend..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Location</label>
                <input
                  type="text"
                  placeholder="Remote, India, Bengaluru..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                >
                  <option value="">All Levels</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="mt-2 w-full px-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                  >
                    <option value="scraped_at">Latest</option>
                    <option value="salary_min">Salary Min</option>
                    <option value="salary_max">Salary Max</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Order</label>
                  <select
                    value={order}
                    onChange={(e) => {
                      setOrder(e.target.value);
                      setPage(1);
                    }}
                    className="mt-2 w-full px-3 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm outline-none focus:border-blue-500/60"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-4">
                <p className="text-sm text-blue-200 font-medium">
                  Want better matches?
                </p>
                <p className="text-xs text-blue-100/70 mt-2 leading-5">
                  Complete your profile so JobIntel can recommend jobs based on
                  your skills and target role.
                </p>
                <Link
                  to="/profile"
                  className="inline-block mt-3 text-xs text-blue-300 hover:text-blue-200"
                >
                  Update Profile →
                </Link>
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <main>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold">Latest Opportunities</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {jobs.length} of {totalJobs} matching jobs
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {debouncedSearch && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                    Search: {debouncedSearch}
                  </span>
                )}

                {debouncedLocation && (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs">
                    Location: {debouncedLocation}
                  </span>
                )}

                {jobType && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                    {cleanLabel(jobType)}
                  </span>
                )}

                {experience && (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                    {cleanLabel(experience)}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-3xl p-6 animate-pulse"
                  >
                    <div className="h-5 bg-gray-800 rounded w-2/3 mb-4" />
                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-6" />
                    <div className="flex gap-2">
                      <div className="h-7 bg-gray-800 rounded-full w-24" />
                      <div className="h-7 bg-gray-800 rounded-full w-28" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-12 text-center">
                <h3 className="text-xl font-semibold">No jobs found</h3>
                <p className="text-gray-400 mt-2 max-w-md mx-auto">
                  Try changing your search keywords, removing filters, or
                  checking another job type.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
                  >
                    Reset Filters
                  </button>

                  <Link
                    to="/recommended"
                    className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-blue-500/50 transition text-sm font-medium"
                  >
                    Recommended Jobs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      className="w-full text-left group rounded-3xl border border-gray-800 bg-gray-900/70 p-6 hover:border-blue-500/40 hover:bg-gray-900 transition"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {job.source && (
                              <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-xs text-gray-400">
                                {job.source}
                              </span>
                            )}

                            {job.scraped_at && (
                              <span className="px-3 py-1 rounded-full bg-gray-950 border border-gray-800 text-xs text-gray-500">
                                {formatDate(job.scraped_at)}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-300 transition">
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
                        </div>

                        <div className="flex xl:flex-col items-center xl:items-end justify-between gap-3">
                          <button
                            onClick={() => fetchJobDetail(job.id)}
                            className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition text-sm"
                          >
                            View details
                          </button>

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

            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
              >
                Previous
              </button>

              <p className="text-sm text-gray-400 text-center">
                Page <span className="text-white">{page}</span> of{" "}
                <span className="text-white">{totalPages}</span>
              </p>

              <button
                disabled={page >= totalPages || loading}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition"
              >
                Next
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedJob && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-950 border border-gray-800 rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-hidden shadow-2xl"
          >
            <div className="border-b border-gray-800 p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-blue-400 mb-2">Job Details</p>

                {detailLoading ? (
                  <div className="h-6 bg-gray-800 rounded w-64 animate-pulse" />
                ) : (
                  <h2 className="text-2xl font-semibold leading-tight">
                    {jobDetail?.title || "Job details"}
                  </h2>
                )}
              </div>

              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(88vh-100px)]">
              {detailLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-1/2" />
                  <div className="h-4 bg-gray-800 rounded w-1/3" />
                  <div className="h-32 bg-gray-800 rounded-2xl" />
                </div>
              ) : jobDetail ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
                      {jobDetail.company?.name || "Unknown Company"}
                    </span>

                    <span className="px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
                      {jobDetail.location || "Remote"}
                    </span>

                    {jobDetail.job_type && (
                      <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        {cleanLabel(jobDetail.job_type)}
                      </span>
                    )}

                    {jobDetail.experience_level && (
                      <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                        {cleanLabel(jobDetail.experience_level)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="text-sm text-gray-200 mt-1">
                        {formatSalary(
                          jobDetail.salary_min,
                          jobDetail.salary_max,
                          jobDetail.currency
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
                      <p className="text-xs text-gray-500">Source</p>
                      <p className="text-sm text-gray-200 mt-1">
                        {jobDetail.source || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
                      <p className="text-xs text-gray-500">Scraped</p>
                      <p className="text-sm text-gray-200 mt-1">
                        {formatDate(jobDetail.scraped_at)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5">
                    <h3 className="font-medium mb-3">Description</h3>
                    <p className="text-sm text-gray-300 leading-7 whitespace-pre-line">
                      {jobDetail.description || "No description available."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {jobDetail.source_url && (
                      <a
                        href={jobDetail.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                      >
                        Apply / View Job
                      </a>
                    )}

                    <button
                      onClick={() => handleSaveJob(jobDetail.id)}
                      disabled={
                        savedJobIds.includes(jobDetail.id) ||
                        savingJobId === jobDetail.id
                      }
                      className={`px-5 py-3 rounded-xl transition text-sm font-medium ${
                        savedJobIds.includes(jobDetail.id)
                          ? "bg-green-600/20 text-green-300 border border-green-500/20 cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {savingJobId === jobDetail.id
                        ? "Saving..."
                        : savedJobIds.includes(jobDetail.id)
                        ? "Saved"
                        : "Save Job"}
                    </button>

                    <button
                      onClick={closeModal}
                      className="px-5 py-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <p className="text-red-300">Failed to load job details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;