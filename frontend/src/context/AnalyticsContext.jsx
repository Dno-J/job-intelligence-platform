import { createContext, useContext, useState } from "react";

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  const [filters, setFilters] = useState({
    days: 7,
    skill: null,
  });

  return (
    <AnalyticsContext.Provider value={{ filters, setFilters }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}