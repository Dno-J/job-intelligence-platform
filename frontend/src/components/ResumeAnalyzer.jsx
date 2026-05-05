import { useState } from "react";
import { analyzeResume } from "../services/api";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return "Please select a file.";
    }

    if (selectedFile.type !== "application/pdf") {
      return "Only PDF files are allowed.";
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB.";
    }

    return "";
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    const validationError = validateFile(selected);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setResult(null);
      return;
    }

    setFile(selected);
    setError("");
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const dropped = e.dataTransfer.files[0];
    const validationError = validateFile(dropped);

    if (validationError) {
      setError(validationError);
      setFile(null);
      setResult(null);
      return;
    }

    setFile(dropped);
    setError("");
    setResult(null);
  };

  const analyze = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await analyzeResume(formData);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to analyze resume. Please try another PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Resume Analyzer
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Upload a PDF resume and compare it with current market demand.
          </p>
        </div>

        {file && (
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center mb-4 transition ${
          file
            ? "border-green-500 bg-green-500/5"
            : "border-gray-700 hover:border-blue-500"
        }`}
      >
        {!file ? (
          <>
            <p className="text-gray-300 font-medium mb-1">
              Upload your resume
            </p>

            <p className="text-xs text-gray-500 mb-4">
              Drag and drop or select a PDF file. Max size: 5MB.
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="text-sm text-gray-400"
            />
          </>
        ) : (
          <div>
            <p className="text-green-400 text-sm font-medium">
              File ready for analysis
            </p>

            <p className="text-sm text-gray-300 mt-1">
              {file.name}
            </p>

            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        className={`w-full py-3 rounded-xl text-sm font-medium transition ${
          loading
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {loading ? "Analyzing Resume..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Resume Market Match Score
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
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Skills Found In Resume
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
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
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
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Recommended Resume Improvements
              </p>

              <div className="space-y-2">
                {result.recommended_skills.map((item) => (
                  <div
                    key={item.skill}
                    className="flex justify-between items-center bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl"
                  >
                    <span className="text-blue-300 text-sm font-medium">
                      Add or strengthen: {item.skill}
                    </span>

                    <span className="text-xs text-gray-400">
                      Demand: {item.demand}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
            <p className="text-sm text-gray-400 leading-6">
              Tip: A low score does not mean your resume is bad. It means your
              resume does not contain many of the currently trending skills in
              your scraped job market data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;