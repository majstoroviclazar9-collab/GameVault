import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../lib/api.js";
import { storage } from "../lib/storage.js";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { notify } = useToast();
  const [user, setUser] = useState(storage.get("gamevault_user", null));
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("gamevault_token");
    if (!token || !user) return;

    let active = true;
    api("/api/me")
      .then((data) => {
        if (!active) return;
        storage.set("gamevault_user", data.user);
        setUser((current) =>
          JSON.stringify(current) === JSON.stringify(data.user)
            ? current
            : data.user,
        );
      })
      .catch((error) => {
        if (!active || error.status !== 401) return;
        storage.remove("gamevault_user");
        localStorage.removeItem("gamevault_token");
        setUser(null);
        notify("Sesija je istekla. Ulogujte se ponovo.");
      });

    return () => {
      active = false;
    };
  }, [notify, user]);

  const handleAuthSuccess = useCallback(
    (data) => {
      localStorage.setItem("gamevault_token", data.token);
      storage.set("gamevault_user", data.user);
      setUser(data.user);
      setAuthMode(null);
      notify(`Dobrodosli, ${data.user.name}.`);
    },
    [notify],
  );

  const logout = useCallback(() => {
    storage.remove("gamevault_user");
    localStorage.removeItem("gamevault_token");
    setUser(null);
    notify("Odjavljeni ste.");
  }, [notify]);

  const value = useMemo(
    () => ({
      user,
      authMode,
      setAuthMode,
      handleAuthSuccess,
      logout,
    }),
    [authMode, handleAuthSuccess, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth mora biti koriscen unutar AuthProvider.");
  }
  return context;
}
