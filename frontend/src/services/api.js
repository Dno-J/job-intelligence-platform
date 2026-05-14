import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
});

// Attach token automatically if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("jobintel_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto logout if token becomes invalid
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobintel_token");
      localStorage.removeItem("jobintel_user");
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH
// ===============================
export const registerUser = (payload) =>
  API.post("/auth/register", payload);

export const loginUser = (payload) =>
  API.post("/auth/login", payload);

export const getCurrentUser = () =>
  API.get("/auth/me");

export const logoutUser = () => {
  localStorage.removeItem("jobintel_token");
  localStorage.removeItem("jobintel_user");
};

// ===============================
// PROFILE
// ===============================
export const getProfile = () =>
  API.get("/profile/me");

export const updateProfile = (payload) =>
  API.put("/profile/me", payload);

// ===============================
// DASHBOARD / ANALYTICS
// ===============================
export const getDashboard = (params = {}) =>
  API.get("/analytics/dashboard", { params });

export const getSkillsAnalytics = (params = {}) =>
  API.get("/analytics/top-skills", { params });

export const getTrendsAnalytics = (params = {}) =>
  API.get("/analytics/job-trends", { params });

export const getCompaniesAnalytics = (params = {}) =>
  API.get("/analytics/top-companies", { params });

export const getSkillTrends = (skill, params = {}) =>
  API.get("/analytics/skill-trends", {
    params: { skill, ...params },
  });

// ===============================
// CAREER TOOLS
// ===============================
export const analyzeSkillGap = (skills = []) =>
  API.post("/analytics/skill-gap", skills);

export const analyzeResume = (formData) =>
  API.post("/analytics/resume-analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ===============================
// JOBS
// ===============================
export const getJobs = (params = {}) =>
  API.get("/jobs", { params });

export const getJobById = (jobId) =>
  API.get(`/jobs/${jobId}`);

export const getRecommendedJobs = (params = {}) =>
  API.get("/jobs/recommended", { params });

// ===============================
// SAVED JOBS / APPLICATION TRACKER
// ===============================
export const getSavedJobs = (params = {}) =>
  API.get("/saved-jobs", { params });

export const saveJob = (jobId) =>
  API.post(`/saved-jobs/${jobId}`);

export const unsaveJob = (jobId) =>
  API.delete(`/saved-jobs/${jobId}`);

export const updateSavedJob = (jobId, payload) =>
  API.patch(`/saved-jobs/${jobId}`, payload);

export const getSavedJobStats = () =>
  API.get("/saved-jobs/stats");

// ===============================
// ADMIN
// ===============================
export const runManualScrape = ({
  source = "all",
  limit = 100,
  adminSecret,
}) =>
  API.post(
    "/admin/scrape-once",
    null,
    {
      params: {
        source,
        limit,
      },
      headers: {
        "X-Admin-Secret": adminSecret,
      },
    }
  );

export default API;