import { useState } from "react";

function Sidebar({ active, setActive }) {
  const menu = [
    { name: "Dashboard" },
    { name: "Skill Gap" },
    { name: "Resume Analyzer" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-950 border-r border-gray-800 p-6 flex flex-col">

      {/* Logo / Title */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-blue-400 tracking-wide">
          JobIntel
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Career insights platform
        </p>
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        {menu.map((item) => {
          const isActive = active === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          © 2026 JobIntel
        </p>
      </div>

    </div>
  );
}

export default Sidebar;