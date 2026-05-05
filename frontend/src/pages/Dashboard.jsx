import { useEffect, useMemo, useState } from "react";

import DashboardSkeleton from "../components/DashboardSkeleton";
import SkillsChart from "../components/SkillsChart";
import CompaniesChart from "../components/CompaniesChart";
import TrendsChart from "../components/TrendsChart";
import { AnalyticsProvider, useAnalytics } from "../context/AnalyticsContext";
import { getDashboard } from "../services/api";

function DashboardContent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const { filters, setFilters } = useAnalytics();

  const buildParams = () => {
    let range = "7d";

    if (filters.days === 30) range = "30d";
    if (filters.days === 90) range = "90d";

    return {
      range,
      skill: filters.skill || undefined,
      date: filters.date || undefined,
      limit: 10,
    };
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setError("");

      try {
        const res = await getDashboard(buildParams());

        const normalized = {
          top_skills: (res.data.top_skills || []).map((skill) => ({
            skill: skill.skill,
            count: Number(skill.count) || 0,
          })),
          top_companies: (res.data.top_companies || []).map((company) => ({
            company: company.company,
            jobs: Number(company.jobs || company.count) || 0,
          })),
          job_trends: (res.data.job_trends || []).map((trend) => ({
            date: trend.date,
            count: Number(trend.count) || 0,
          })),
        };

        setData(normalized);
      } catch (err) {
        console.error("Dashboard API failed:", err);

        setError("Failed to load dashboard analytics.");
        setData({
          top_skills: [],
          top_companies: [],
          job_trends: [],
        });
      }
    };

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.days, filters.skill, filters.date]);

  const dashboardStats = useMemo(() => {
    if (!data) {
      return {
        totalJobs: 0,
        topSkill: "No data",
        topCompany: "No data",
        activeSkillCount: 0,
      };
    }

    const totalJobs = data.job_trends.reduce(
      (sum, item) => sum + (item.count || 0),
      0
    );

    return {
      totalJobs,
      topSkill: data.top_skills[0]?.skill || "No data",
      topCompany: data.top_companies[0]?.company || "No data",
      activeSkillCount: data.top_skills.length,
    };
  }, [data]);

  const resetFilters = () => {
    setFilters({
      days: 7,
      skill: null,
      date: null,
    });
  };

  const hasActiveFilters = Boolean(filters.skill || filters.date || filters.days !== 7);

  const rangeLabel = `${filters.days || 7} days`;

  if (!data) return <DashboardSkeleton />;

  const { top_skills, top_companies, job_trends } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.12),transparent_32%)]" />

            <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
              <div>
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300 mb-5">
                  Live Market Intelligence
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Job Intelligence Dashboard
                </h1>

                <p className="text-gray-400 mt-4 max-w-2xl leading-7">
                  Track job market demand, trending skills, active companies,
                  and scraping trends from your live job intelligence pipeline.
                </p>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filters.days}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      days: Number(e.target.value),
                      date: null,
                    }))
                  }
                  className="rounded-xl bg-gray-950 border border-gray-800 px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>

                <button
                  onClick={resetFilters}
                  className="rounded-xl bg-gray-800 hover:bg-gray-700 px-5 py-3 text-sm transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE FILTERS */}
        {hasActiveFilters && (
          <section className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500">Active filters:</span>

            <span className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
              Range: Last {rangeLabel}
            </span>

            {filters.skill && (
              <span className="px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/20 text-xs text-blue-300">
                Skill: {filters.skill}
              </span>
            )}

            {filters.date && (
              <span className="px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/20 text-xs text-purple-300">
                Date: {filters.date}
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs text-red-300 hover:text-red-200 transition"
            >
              Clear all
            </button>
          </section>
        )}

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-5">
            <p className="text-xs text-blue-300">Jobs in selected range</p>
            <h2 className="text-3xl font-semibold mt-2">
              {dashboardStats.totalJobs}
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Based on scraped job trend data.
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-600/10 p-5">
            <p className="text-xs text-green-300">Top Skill</p>
            <h2 className="text-2xl font-semibold mt-2 truncate">
              {dashboardStats.topSkill}
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Most frequent skill in active jobs.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-600/10 p-5">
            <p className="text-xs text-purple-300">Top Company</p>
            <h2 className="text-2xl font-semibold mt-2 truncate">
              {dashboardStats.topCompany}
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Company with most listings.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-600/10 p-5">
            <p className="text-xs text-yellow-300">Tracked Skills</p>
            <h2 className="text-3xl font-semibold mt-2">
              {dashboardStats.activeSkillCount}
            </h2>
            <p className="text-xs text-gray-500 mt-3">
              Top skills returned by analytics.
            </p>
          </div>
        </section>

        {/* INSIGHT NOTE */}
        <section className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <p className="text-sm text-gray-400 leading-6">
            This dashboard is powered by scraped jobs, Celery-based processing,
            PostgreSQL skill extraction, and analytics queries. Click a skill or
            trend point to drill down into the data.
          </p>
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <SkillsChart data={top_skills} />
          <CompaniesChart data={top_companies} />
        </section>

        <section className="mb-8">
          <TrendsChart data={job_trends} />
        </section>

        {/* BOTTOM DETAILS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold">Top Skills Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Highest-demand skills in the selected range.
            </p>

            {top_skills.length > 0 ? (
              <div className="mt-5 space-y-3">
                {top_skills.slice(0, 8).map((skill, index) => (
                  <div
                    key={skill.skill}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center text-xs text-gray-400">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-300">
                        {skill.skill}
                      </span>
                    </div>

                    <span className="text-sm text-gray-500">
                      {skill.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-5">
                No skill data available.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold">Top Companies Summary</h2>
            <p className="text-sm text-gray-500 mt-1">
              Companies with the most active scraped jobs.
            </p>

            {top_companies.length > 0 ? (
              <div className="mt-5 space-y-3">
                {top_companies.slice(0, 8).map((company, index) => (
                  <div
                    key={company.company}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center text-xs text-gray-400">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-300 truncate">
                        {company.company}
                      </span>
                    </div>

                    <span className="text-sm text-gray-500">
                      {company.jobs} jobs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-5">
                No company data available.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <AnalyticsProvider>
      <DashboardContent />
    </AnalyticsProvider>
  );
}

export default Dashboard;