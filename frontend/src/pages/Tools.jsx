import SkillGap from "../components/SkillGap";
import ResumeAnalyzer from "../components/ResumeAnalyzer";

function Tools() {
  const toolHighlights = [
    {
      title: "Market-aware analysis",
      description:
        "Uses skills extracted from scraped jobs instead of a fixed random checklist.",
    },
    {
      title: "Resume skill matching",
      description:
        "Compares your resume against current job market demand.",
    },
    {
      title: "Actionable gaps",
      description:
        "Shows missing and recommended skills so you know what to improve next.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-950 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.12),transparent_30%)]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-300 mb-5">
                  Career Intelligence Tools
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Improve your profile with data-backed insights
                </h1>

                <p className="text-gray-400 mt-4 max-w-2xl leading-7">
                  Analyze your skills, compare your resume with real job market
                  demand, and discover what to learn next based on scraped job
                  listings.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-3 py-1 rounded-full bg-blue-600/15 text-blue-300 text-xs border border-blue-500/20">
                    Skill Gap
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-600/15 text-green-300 text-xs border border-green-500/20">
                    Resume Analyzer
                  </span>

                  <span className="px-3 py-1 rounded-full bg-purple-600/15 text-purple-300 text-xs border border-purple-500/20">
                    Market Skills
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {toolHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5"
                  >
                    <h3 className="text-sm font-semibold text-gray-100">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2 leading-6">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tool Cards */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/80 shadow-xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-5 bg-gray-900">
              <p className="text-xs text-blue-400 font-medium mb-1">
                Tool 01
              </p>

              <h2 className="text-xl font-semibold">Skill Gap Analyzer</h2>

              <p className="text-sm text-gray-500 mt-2">
                Enter your skills and compare them with the most demanded skills
                in your scraped job dataset.
              </p>
            </div>

            <SkillGap />
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900/80 shadow-xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-5 bg-gray-900">
              <p className="text-xs text-green-400 font-medium mb-1">
                Tool 02
              </p>

              <h2 className="text-xl font-semibold">Resume Analyzer</h2>

              <p className="text-sm text-gray-500 mt-2">
                Upload a PDF resume and discover which high-demand market
                skills are present or missing.
              </p>
            </div>

            <ResumeAnalyzer />
          </div>
        </section>

        {/* How it works */}
        <section className="mt-10 rounded-3xl border border-gray-800 bg-gray-900/60 p-6 md:p-8">
          <div className="mb-6">
            <p className="text-sm text-blue-400 font-medium mb-2">
              How it works
            </p>

            <h2 className="text-2xl font-semibold tracking-tight">
              Built on your real job intelligence pipeline
            </h2>

            <p className="text-gray-400 text-sm mt-2 max-w-3xl leading-6">
              These tools use the same database populated by your scrapers and
              Celery worker. That means recommendations are based on the jobs
              your platform has actually collected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/20 flex items-center justify-center text-sm font-semibold mb-4">
                1
              </div>

              <h3 className="text-sm font-semibold">Scrape Jobs</h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                RemoteOK, Remotive, Arbeitnow, and Internshala feed job data
                into the platform.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/20 flex items-center justify-center text-sm font-semibold mb-4">
                2
              </div>

              <h3 className="text-sm font-semibold">Extract Skills</h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                The worker extracts and normalizes skills from job descriptions.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <div className="w-9 h-9 rounded-xl bg-green-600/20 text-green-300 border border-green-500/20 flex items-center justify-center text-sm font-semibold mb-4">
                3
              </div>

              <h3 className="text-sm font-semibold">Analyze Demand</h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                JobIntel ranks skills based on demand across active job
                listings.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <div className="w-9 h-9 rounded-xl bg-yellow-600/20 text-yellow-300 border border-yellow-500/20 flex items-center justify-center text-sm font-semibold mb-4">
                4
              </div>

              <h3 className="text-sm font-semibold">Suggest Improvements</h3>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                You get matched skills, missing skills, and high-demand skills
                to learn next.
              </p>
            </div>
          </div>
        </section>

        {/* Portfolio Note */}
        <section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-600/10 p-6">
          <h2 className="text-lg font-semibold text-blue-200">
            Note
          </h2>

          <p className="text-sm text-blue-100/80 mt-2 leading-6">
            This page shows that JobIntel is not just a job board. It uses a
            backend data pipeline to generate career insights, making it closer
            to a real job intelligence product.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Tools;