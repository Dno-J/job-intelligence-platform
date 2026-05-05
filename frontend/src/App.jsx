import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import jobintelIcon from "./assets/jobintel-icon.png";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tools from "./pages/Tools";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SavedJobs from "./pages/SavedJobs";
import RecommendedJobs from "./pages/RecommendedJobs";

import PageWrapper from "./components/PageWrapper";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />

        <Route
          path="/jobs"
          element={
            <PageWrapper>
              <Jobs />
            </PageWrapper>
          }
        />

        <Route
          path="/recommended"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <RecommendedJobs />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SavedJobs />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tools"
          element={
            <PageWrapper>
              <Tools />
            </PageWrapper>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Profile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const mainLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Jobs", path: "/jobs" },
    { label: "Tools", path: "/tools" },
  ];

  const userLinks = [
    { label: "Recommended", path: "/recommended" },
    { label: "Tracker", path: "/saved-jobs" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "text-white font-medium"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <img
              src={jobintelIcon}
              alt="JobIntel"
              className="w-full h-full object-contain p-1"
            />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              JobIntel
            </h1>
            <p className="text-[11px] text-gray-500 -mt-0.5">
              Job Intelligence Platform
            </p>
          </div>
        </Link>

        {/* Desktop Main Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm">
          {mainLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 border border-gray-800 bg-gray-900 rounded-2xl px-2 py-2">
                {userLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-sm transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <Link
                to="/profile"
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900 transition text-sm"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600/15 text-red-300 hover:bg-red-600/25 transition text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900 transition text-sm"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tablet / Mobile Scroll Nav */}
      <div className="lg:hidden border-t border-gray-800 px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-5 text-sm min-w-max">
          {mainLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              {userLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}

              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                className="whitespace-nowrap text-red-300 hover:text-red-200 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>

              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <AnimatedRoutes />
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;