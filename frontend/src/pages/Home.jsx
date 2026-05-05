import { Link } from "react-router-dom";

function Home() {
  const features = [
    {
      title: "Live Job Collection",
      description:
        "Scrapes job listings from multiple sources and processes them through Redis and Celery workers.",
    },
    {
      title: "Market Analytics",
      description:
        "Visualizes trending skills, top hiring companies, and job posting trends from your scraped dataset.",
    },
    {
      title: "Personalized Recommendations",
      description:
        "Uses your profile, skills, target role, preferred job type, and location to recommend relevant jobs.",
    },
    {
      title: "Application Tracker",
      description:
        "Save jobs and track them through stages like saved, applied, interviewing, offer, and rejected.",
    },
    {
      title: "Resume Analyzer",
      description:
        "Upload your resume and compare extracted skills against current market demand.",
    },
    {
      title: "Skill Gap Insights",
      description:
        "Compare your current skills with the most demanded skills in active job listings.",
    },
  ];

  const techStack = [
    "React",
    "Vite",
    "Tailwind CSS",
    "FastAPI",
    "PostgreSQL",
    "SQLAlchemy",
    "Redis",
    "Celery",
    "Docker",
    "Chart.js",
    "JWT Auth",
    "Python",
  ];

  const workflow = [
    {
      title: "Scrapers collect jobs",
      description:
        "RemoteOK, Remotive, Arbeitnow, and Internshala feed listings into the system.",
    },
    {
      title: "Redis queues tasks",
      description:
        "Scraped jobs are pushed into a queue so processing stays asynchronous.",
    },
    {
      title: "Celery enriches data",
      description:
        "Workers clean descriptions, normalize fields, deduplicate jobs, and extract skills.",
    },
    {
      title: "PostgreSQL stores insights",
      description:
        "Jobs, companies, users, profiles, saved jobs, and skills are stored relationally.",
    },
    {
      title: "FastAPI serves APIs",
      description:
        "The backend exposes search, analytics, authentication, profile, tracker, and recommendation APIs.",
    },
    {
      title: "React visualizes everything",
      description:
        "The frontend turns raw data into dashboards, tools, job cards, and user workflows.",
    },
  ];

  const productStats = [
    {
      label: "Sources",
      value: "4+",
      description: "Job sources integrated",
    },
    {
      label: "Pipeline",
      value: "Async",
      description: "Redis + Celery processing",
    },
    {
      label: "Auth",
      value: "JWT",
      description: "User accounts and protected pages",
    },
    {
      label: "Insights",
      value: "Live",
      description: "Market analytics from scraped data",
    },
  ];

  const userJourney = [
    "Create a profile",
    "Browse or get recommended jobs",
    "Save interesting roles",
    "Track application progress",
    "Analyze resume and skill gaps",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.25),transparent_34%),radial-gradient(circle_at_top_right,rgba(147,51,234,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.08),transparent_28%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300 mb-6">
                Job Intelligence Platform
              </div>

              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                Turn live job data into smarter career decisions.
              </h1>

              <p className="text-gray-400 text-base md:text-lg mt-6 leading-8 max-w-2xl">
                JobIntel is a full-stack job intelligence platform that scrapes
                jobs, extracts skills, tracks applications, recommends roles,
                and analyzes resumes using a real backend data pipeline.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                >
                  View Dashboard
                </Link>

                <Link
                  to="/recommended"
                  className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-700 hover:border-blue-500/50 transition text-sm font-medium text-center"
                >
                  Recommended Jobs
                </Link>

                <Link
                  to="/tools"
                  className="px-6 py-3 rounded-xl bg-gray-900 border border-gray-700 hover:border-green-500/50 transition text-sm font-medium text-center"
                >
                  Career Tools
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl">
              <div className="mb-5">
                <p className="text-sm text-blue-400 font-medium">
                  Product Overview
                </p>
                <h2 className="text-2xl font-semibold mt-2">
                  Built beyond a basic job board
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-6">
                  The app combines scraping, async processing, analytics,
                  authentication, personalization, and job tracking.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {productStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-gray-800 bg-gray-950 p-4"
                  >
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-semibold mt-1">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-600/10 p-4">
                <p className="text-sm text-blue-100/80 leading-6">
                  Portfolio value: demonstrates API design, relational database
                  modeling, background workers, Docker, authentication, and
                  production-style frontend workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-blue-400 text-sm font-medium">Core Features</p>
          <h2 className="text-3xl font-semibold mt-2">
            Everything needed for a career intelligence workflow
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl leading-7">
            JobIntel helps users discover jobs, understand market demand, save
            opportunities, track applications, and improve their profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/40 transition"
            >
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-gray-400 text-sm mt-3 leading-6">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* USER JOURNEY */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <div>
              <p className="text-blue-400 text-sm font-medium">
                User Workflow
              </p>
              <h2 className="text-3xl font-semibold mt-2">
                From profile to application tracking
              </h2>
              <p className="text-gray-400 mt-4 leading-7">
                The app is designed around a real job-search flow. Users can
                define their profile, discover matching jobs, save roles, and
                track progress across application stages.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/profile"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
                >
                  Build Profile
                </Link>

                <Link
                  to="/saved-jobs"
                  className="px-5 py-3 rounded-xl bg-gray-950 border border-gray-700 hover:border-blue-500/50 transition text-sm font-medium text-center"
                >
                  Application Tracker
                </Link>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6">
              <div className="space-y-4">
                {userJourney.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>

                    <p className="text-sm text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM WORKFLOW */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-blue-400 text-sm font-medium">
            System Architecture
          </p>
          <h2 className="text-3xl font-semibold mt-2">
            From raw job listings to useful insights
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl leading-7">
            The architecture follows a service-based workflow with dedicated
            scraping, queueing, processing, storage, API, and frontend layers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {workflow.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-center text-sm font-semibold mb-5">
                {index + 1}
              </div>

              <h3 className="font-semibold">{step.title}</h3>

              <p className="text-sm text-gray-400 mt-3 leading-6">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="text-blue-400 text-sm font-medium">Tech Stack</p>
            <h2 className="text-3xl font-semibold mt-2">
              Full-stack engineering stack
            </h2>
            <p className="text-gray-400 mt-3 max-w-2xl leading-7">
              The project demonstrates backend APIs, async workers, database
              design, scraping, Docker orchestration, authentication, and a
              modern React frontend.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-gray-950 border border-gray-800 text-sm text-gray-300 hover:border-blue-500/40 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-600/15 to-purple-600/15 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-2">
              Ready to explore?
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold">
              Analyze the market, find jobs, and track applications.
            </h2>

            <p className="text-gray-400 mt-3 max-w-2xl leading-6">
              Start with the dashboard for market insights, browse jobs for
              opportunities, or use career tools to improve your profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium text-center"
            >
              Dashboard
            </Link>

            <Link
              to="/jobs"
              className="px-5 py-3 rounded-xl bg-gray-950 border border-gray-700 hover:border-blue-500/50 transition text-sm font-medium text-center"
            >
              Jobs
            </Link>

            <Link
              to="/tools"
              className="px-5 py-3 rounded-xl bg-gray-950 border border-gray-700 hover:border-green-500/50 transition text-sm font-medium text-center"
            >
              Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;