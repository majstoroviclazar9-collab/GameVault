import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState("");
  const timerRef = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(""), 3300);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast mora biti koriscen unutar ToastProvider.");
  }
  return context;
}
