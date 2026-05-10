import { useCallback, useEffect, useMemo, useState } from "react";
import { canEnterRoute } from "./routeMiddleware.js";

const routes = [
  { path: "/", name: "store" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/checkout", name: "checkout", protected: true },
  { path: "/dashboard", name: "dashboard", protected: true },
  { path: "/library", name: "library", protected: true },
  {
    path: "/admin-users",
    name: "admin-users",
    protected: true,
    adminOnly: true,
  },
];

function normalizePath(path) {
  if (!path || path === "") return "/";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

export function useAppRouter(user, onBlocked) {
  const [path, setPath] = useState(normalizePath(window.location.pathname));

  const currentRoute = useMemo(() => {
    return routes.find((route) => route.path === path) || routes[0];
  }, [path]);

  const navigate = useCallback(
    (nextPath, options = {}) => {
      const normalized = normalizePath(nextPath);
      const route =
        routes.find((item) => item.path === normalized) || routes[0];
      const check = canEnterRoute(route, user);

      if (!check.allowed) {
        window.history.pushState({}, "", check.redirect);
        setPath(check.redirect);
        onBlocked?.(check.message, check);
        return;
      }

      window.history.pushState({}, "", route.path);
      setPath(route.path);
      if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [onBlocked, user],
  );

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const check = canEnterRoute(currentRoute, user);
    if (!check.allowed) {
      window.history.replaceState({}, "", check.redirect);
      setPath(check.redirect);
      onBlocked?.(check.message, check);
    }
  }, [currentRoute, onBlocked, user]);

  return {
    route: currentRoute.name,
    path: currentRoute.path,
    navigate,
    routes,
  };
}
