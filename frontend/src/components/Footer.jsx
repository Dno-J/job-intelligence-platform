import { Link } from "react-router-dom";

function Footer() {
  const projectLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Jobs", path: "/jobs" },
    { label: "Tools", path: "/tools" },
  ];

  const externalLinks = [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/dino-jackson-486840368",
    },
    {
      label: "GitHub",
      href: "https://github.com/Dno-J",
    },
    {
      label: "Portfolio",
      href: "https://portfolio-frontend-wy8a.onrender.com/",
    },
    {
      label: "Email",
      href: "mailto:jacksondino00@gmail.com",
    },
  ];

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              JobIntel
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-6">
              A full-stack job intelligence platform with live scraping,
              background processing, analytics, and searchable job insights.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Platform
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              {projectLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-500 hover:text-white transition w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Connect
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    link.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="text-gray-500 hover:text-white transition w-fit"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Dino Jackson. All rights reserved.</p>
          <p>Built with React, FastAPI, PostgreSQL, Redis, Celery, and Docker.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;