import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const token = localStorage.getItem("jobintel_token");

  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const res = await getCurrentUser();
      setUser(res.data);
      localStorage.setItem("jobintel_user", JSON.stringify(res.data));
    } catch (error) {
      logoutUser();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("jobintel_token", token);
    localStorage.setItem("jobintel_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const isAuthenticated = Boolean(user && localStorage.getItem("jobintel_token"));

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        authLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}