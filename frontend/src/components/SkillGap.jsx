import { useState, useEffect } from "react";
import { analyzeSkillGap, getSkillsAnalytics } from "../services/api";

function SkillGap() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    getSkillsAnalytics({ limit: 30 })
      .then((res) => setSuggestions(res.data || []))
      .catch(() => setSuggestions([]));
  }, []);

  const analyze = async () => {
    const skills = input
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean)
      .filter((skill, index, array) => array.indexOf(skill) === index);

    if (skills.length === 0) {
      setError("Please enter at least one skill.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeSkillGap(skills);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to analyze skills. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill) => {
    const normalizedSkill = skill.trim().toLowerCase();

    const current = input
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (!current.includes(normalizedSkill)) {
      setInput([...current, normalizedSkill].join(", "));
    }
  };

  const clearInput = () => {
    setInput("");
    setResult(null);
    setError("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Skill Gap Analysis
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Compare your skills against the current job market.
          </p>
        </div>

        {input && (
          <button
            onClick={clearInput}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
          Suggested Skills
        </p>

        {suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 15).map((item) => (
              <button
                key={item.skill}
                onClick={() => addSkill(item.skill)}
                className="bg-gray-800 hover:bg-blue-600/80 text-gray-300 hover:text-white px-3 py-1 rounded-full text-xs transition border border-gray-700"
              >
                {item.skill}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            No market skills found yet. Let the scrapers collect more jobs.
          </p>
        )}
      </div>

      <textarea
        rows={3}
        placeholder="e.g. python, react, docker, fastapi"
        className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className={`w-full px-5 py-3 rounded-xl text-white text-sm font-medium transition ${
          loading
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {loading ? "Analyzing..." : "Analyze Skill Gap"}
      </button>

      {result && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              Market Match Score
            </p>

            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  result.match_score > 70
                    ? "bg-green-500"
                    : result.match_score > 40
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
                style={{ width: `${result.match_score}%` }}
              />
            </div>

            <p className="text-lg font-semibold text-white">
              {result.match_score}%
            </p>
          </div>

          {result.matched_skills?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                Skills You Already Have
              </p>

              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing_skills?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                Missing Market Skills
              </p>

              <div className="flex flex-wrap gap-2">
                {result.missing_skills.slice(0, 15).map((skill) => (
                  <span
                    key={skill}
                    className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.recommended_skills?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                Recommended Skills To Learn
              </p>

              <div className="space-y-2">
                {result.recommended_skills.map((item) => (
                  <div
                    key={item.skill}
                    className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl"
                  >
                    <span className="text-blue-300 text-sm font-medium">
                      {item.skill}
                    </span>

                    <span className="text-xs text-gray-400">
                      Demand: {item.demand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SkillGap;