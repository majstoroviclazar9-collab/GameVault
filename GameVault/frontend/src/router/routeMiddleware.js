export function canEnterRoute(route, user) {
  if (route.protected && !user) {
    return {
      allowed: false,
      redirect: "/",
      requiresLogin: true,
      message:
        route.name === "checkout"
          ? "Ulogujte se da nastavite na placanje."
          : "Ulogujte se da otvorite ovu stranicu.",
    };
  }

  if (route.adminOnly && user?.role !== "admin") {
    return {
      allowed: false,
      redirect: "/dashboard",
      requiresLogin: false,
      message: "Samo admin moze da otvori stranicu korisnika.",
    };
  }

  return {
    allowed: true,
  };
}
