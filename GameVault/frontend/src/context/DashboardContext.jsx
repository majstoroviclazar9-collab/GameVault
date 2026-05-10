import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setDashboard(null);
    }
  }, [user]);

  const loadDashboard = useCallback(() => {
    if (!user) return;

    setDashboardLoading(true);
    api("/api/dashboard")
      .then((data) => setDashboard(data))
      .catch((error) => notify(error.message))
      .finally(() => setDashboardLoading(false));
  }, [notify, user]);

  const value = useMemo(
    () => ({
      dashboard,
      dashboardLoading,
      setDashboard,
      loadDashboard,
    }),
    [dashboard, dashboardLoading, loadDashboard],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboard mora biti koriscen unutar DashboardProvider.",
    );
  }
  return context;
}
