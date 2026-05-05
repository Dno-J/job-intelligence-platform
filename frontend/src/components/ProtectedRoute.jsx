import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 bg-gray-800 rounded" />
            <div className="h-40 bg-gray-900 border border-gray-800 rounded-2xl" />
            <div className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;