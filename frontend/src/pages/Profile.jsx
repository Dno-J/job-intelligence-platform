import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getCurrentUser,
  getProfile,
  getSavedJobs,
  getSavedJobStats,
  updateProfile,
} from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  const [trackerStats, setTrackerStats] = useState({
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  });

  const [form, setForm] = useState({
    full_name: "",
    headline: "",
    target_role: "",
    experience_level: "",
    preferred_location: "",
    preferred_job_type: "",
    skills: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const cleanLabel = (value) => {
    if (!value) return "Not set";

    return value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const hydrateForm = (profileData) => {
    setForm({
      full_name: profileData.full_name || "",
      headline: profileData.headline || "",
      target_role: profileData.target_role || "",
      experience_level: profileData.experience_level || "",
      preferred_location: profileData.preferred_location || "",
      preferred_job_type: profileData.preferred_job_type || "",
      skills: Array.isArray(profileData.skills)
        ? profileData.skills.join(", ")
        : "",
      github_url: profileData.github_url || "",
      linkedin_url: profileData.linkedin_url || "",
      portfolio_url: profileData.portfolio_url || "",
      resume_url: profileData.resume_url || "",
      bio: profileData.bio || "",
    });
  };

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [userRes, profileRes, savedJobsRes, statsRes] = await Promise.all([
        getCurrentUser(),
        getProfile(),
        getSavedJobs(),
        getSavedJobStats(),
      ]);

      setUser(userRes.data);
      setProfile(profileRes.data);
      hydrateForm(profileRes.data);

      setSavedJobsCount(savedJobsRes.data?.length || 0);
      setTrackerStats(
        statsRes.data || {
          total: 0,
          saved: 0,
          applied: 0,
          interviewing: 0,
          offer: 0,
          rejected: 0,
        }
      );
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseSkills = (value) => {
    return value
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean)
      .filter((skill, index, array) => array.indexOf(skill) === index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        full_name: form.full_name.trim() || null,
        headline: form.headline.trim() || null,
        target_role: form.target_role.trim() || null,
        experience_level: form.experience_level || null,
        preferred_location: form.preferred_location.trim() || null,
        preferred_job_type: form.preferred_job_type || null,
        skills: parseSkills(form.skills),
        github_url: form.github_url.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        portfolio_url: form.portfolio_url.trim() || null,
        resume_url: form.resume_url.trim() || null,
        bio: form.bio.trim() || null,
      };

      const res = await updateProfile(payload);

      setProfile(res.data);
      hydrateForm(res.data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const skillList = profile?.skills || [];

  const completion = useMemo(() => {
    if (!profile) return 0;

    const checks = [
      profile.full_name,
      profile.headline,
      profile.target_role,
      profile.experience_level,
      profile.preferred_location,
      profile.preferred_job_type,
      profile.skills?.length > 0,
      profile.github_url,
      profile.linkedin_url,
      profile.portfolio_url || profile.resume_url,
      profile.bio,
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [profile]);

  const recommendationSignals = [
    {
      label: "Target Role",
      value: profile?.target_role || "Not set",
      active: Boolean(profile?.target_role),
    },
    {
      label: "Experience",
      value: cleanLabel(profile?.experience_level),
      active: Boolean(profile?.experience_level),
    },
    {
      label: "Location",
      value: profile?.preferred_location || "Not set",
      active: Boolean(profile?.preferred_location),
    },
    {
      label: "Job Type",
      value: cleanLabel(profile?.preferred_job_type),
      active: Boolean(profile?.preferred_job_type),
    },
    {
      label: "Skills",
      value: `${skillList.length} added`,
      active: skillList.length > 0,
    },
  ];

  const trackerCards = [
    { label: "Saved", value: trackerStats.saved || 0 },
    { label: "Applied", value: trackerStats.applied || 0 },
    { label: "Interviewing", value: trackerStats.interviewing || 0 },
    { label: "Offers", value: trackerStats.offer || 0 },
    { label: "Rejected", value: trackerStats.rejected || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-56 bg-gray-900 border border-gray-800 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
              <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
              <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
              <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="h-[700px] bg-gray-900 border border-gray-800 rounded-3xl" />
              <div className="h-[700px] bg-gray-900 border border-gray-800 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email || "User";
  const joinedDate = formatDate(user?.created_at || profile?.created_at);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_34%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_30%)]" />

            <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/20 shrink-0">
                  {displayName.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <p className="text-sm text-blue-400 font-medium mb-2">
                    Career Control Center
                  </p>

                  <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                    {displayName}
                  </h1>

                  <p className="text-gray-400 mt-3 max-w-2xl leading-7">
                    {profile?.headline ||
                      "Manage your career profile, preferences, application tracker, and personalized job signals."}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Member since {joinedDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/recommended"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                >
                  Recommended Jobs
                </Link>

                <Link
                  to="/saved-jobs"
                  className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-blue-500/50 transition text-sm font-medium text-center"
                >
                  Application Tracker
                </Link>

                <Link
                  to="/tools"
                  className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-950 hover:border-green-500/50 transition text-sm font-medium text-center"
                >
                  Career Tools
                </Link>
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

        {/* TOP CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-400">Profile Completion</p>

            <div className="mt-3 flex items-end justify-between">
              <h3 className="text-3xl font-semibold">{completion}%</h3>
              <span className="text-xs text-gray-500">
                {completion >= 80 ? "Strong" : "Needs details"}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-gray-800 mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  completion >= 80
                    ? "bg-green-500"
                    : completion >= 50
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-400">Tracked Jobs</p>
            <h3 className="text-3xl font-semibold mt-2">
              {trackerStats.total || savedJobsCount}
            </h3>
            <Link
              to="/saved-jobs"
              className="inline-block text-sm text-blue-400 hover:text-blue-300 mt-4"
            >
              Open tracker →
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-400">Target Role</p>
            <h3 className="text-2xl font-semibold mt-2 truncate">
              {profile?.target_role || "Not set"}
            </h3>
            <p className="text-sm text-gray-500 mt-3">
              Used for personalized recommendations.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-400">Career Level</p>
            <h3 className="text-2xl font-semibold mt-2">
              {cleanLabel(profile?.experience_level)}
            </h3>
            <p className="text-sm text-gray-500 mt-3">
              Helps match jobs by experience level.
            </p>
          </div>
        </section>

        {/* APPLICATION TRACKER SUMMARY */}
        <section className="mb-8 rounded-3xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-semibold">
                Application Tracker Snapshot
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Quick summary of your saved job workflow.
              </p>
            </div>

            <Link
              to="/saved-jobs"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Manage applications →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trackerCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-800 bg-gray-950 p-4"
              >
                <p className="text-xs text-gray-500">{card.label}</p>
                <h3 className="text-2xl font-semibold mt-2">{card.value}</h3>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6"
          >
            <div className="mb-6">
              <p className="text-sm text-blue-400 font-medium mb-1">
                Profile Details
              </p>

              <h2 className="text-xl font-semibold">Edit profile</h2>

              <p className="text-sm text-gray-400 mt-2">
                These fields power recommendations, matching, profile summary,
                and career tools.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-600/10 p-4">
              <p className="text-sm text-blue-200 font-medium">
                Recommendation Signals
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                {recommendationSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className={`rounded-xl border p-3 ${
                      signal.active
                        ? "border-green-500/20 bg-green-500/10"
                        : "border-gray-800 bg-gray-950"
                    }`}
                  >
                    <p className="text-xs text-gray-500">{signal.label}</p>
                    <p
                      className={`text-sm mt-1 truncate ${
                        signal.active ? "text-green-300" : "text-gray-400"
                      }`}
                    >
                      {signal.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Dino Jackson"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Headline
                </label>
                <input
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder="Python / Full Stack Developer"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Target Role
                </label>
                <input
                  name="target_role"
                  value={form.target_role}
                  onChange={handleChange}
                  placeholder="Backend Developer"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Preferred Location
                </label>
                <input
                  name="preferred_location"
                  value={form.preferred_location}
                  onChange={handleChange}
                  placeholder="Remote, India, Bengaluru..."
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Experience Level
                </label>
                <select
                  name="experience_level"
                  value={form.experience_level}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Preferred Job Type
                </label>
                <select
                  name="preferred_job_type"
                  value={form.preferred_job_type}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  name="github_url"
                  value={form.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Portfolio URL
                </label>
                <input
                  name="portfolio_url"
                  value={form.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Resume URL
                </label>
                <input
                  name="resume_url"
                  value={form.resume_url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm text-gray-300 mb-2">
                Skills
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="python, fastapi, react, docker, postgresql"
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate skills using commas.
              </p>
            </div>

            <div className="mt-5">
              <label className="block text-sm text-gray-300 mb-2">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="5"
                placeholder="Write a short career summary..."
                className="w-full rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          {/* RIGHT SIDE */}
          <aside className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Summary</h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Preferred Job Type</p>
                  <p className="text-gray-200 mt-1">
                    {cleanLabel(profile?.preferred_job_type)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Preferred Location</p>
                  <p className="text-gray-200 mt-1">
                    {profile?.preferred_location || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Bio</p>
                  <p className="text-gray-300 mt-1 leading-6">
                    {profile?.bio || "No bio added yet."}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Skills</p>

                  {skillList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skillList.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-blue-600/15 text-blue-300 text-xs border border-blue-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-200 mt-1">No skills added</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/recommended"
                  className="rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:border-blue-500/40 transition"
                >
                  <p className="text-sm font-medium text-gray-100">
                    View recommended jobs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on your role, skills, and preferences.
                  </p>
                </Link>

                <Link
                  to="/saved-jobs"
                  className="rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:border-green-500/40 transition"
                >
                  <p className="text-sm font-medium text-gray-100">
                    Open application tracker
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage saved, applied, and interview-stage jobs.
                  </p>
                </Link>

                <Link
                  to="/tools"
                  className="rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:border-purple-500/40 transition"
                >
                  <p className="text-sm font-medium text-gray-100">
                    Analyze skills and resume
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Compare yourself against market demand.
                  </p>
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <h2 className="text-lg font-semibold mb-4">External Links</h2>

              <div className="space-y-3 text-sm">
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    GitHub →
                  </a>
                )}

                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    LinkedIn →
                  </a>
                )}

                {profile?.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Portfolio →
                  </a>
                )}

                {profile?.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Resume →
                  </a>
                )}

                {!profile?.github_url &&
                  !profile?.linkedin_url &&
                  !profile?.portfolio_url &&
                  !profile?.resume_url && (
                    <p className="text-gray-400">
                      Add links to show them here.
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6">
              <h2 className="text-lg font-semibold text-blue-100 mb-3">
                What this unlocks
              </h2>

              <div className="space-y-3 text-sm text-blue-100/75">
                <p>• Personalized job recommendations</p>
                <p>• Better skill gap analysis</p>
                <p>• Resume-to-market matching</p>
                <p>• Stronger application workflow insights</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Profile;