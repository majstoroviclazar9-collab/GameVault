import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import AuthModal from "./components/AuthModal.jsx";
import GameModal from "./components/GameModal.jsx";
import StorePage from "./pages/StorePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import { api } from "./lib/api.js";
import { storage } from "./lib/storage.js";
import { cx } from "./lib/format.js";
import { useAppRouter } from "./router/useAppRouter.jsx";

const initialFilters = {
  search: "",
  genre: "",
  platform: "",
  launcher: "",
  minPrice: 0,
  maxPrice: 200,
  sort: "rating-desc",
  page: 1,
};

export default function App() {
  const [theme, setTheme] = useState(storage.get("gamevault_theme", "dark"));
  const [user, setUser] = useState(storage.get("gamevault_user", null));
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 9,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [options, setOptions] = useState({
    genres: [],
    platforms: [],
    launchers: [],
  });
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(storage.get("gamevault_cart", []));
  const [wishlist, setWishlist] = useState(
    storage.get("gamevault_wishlist", []),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showTop, setShowTop] = useState(false);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 3300);
  }, []);

  const router = useAppRouter(user, (message, check) => {
    notify(message);
    if (check?.requiresLogin) {
      setAuthMode("login");
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set("gamevault_theme", theme);
  }, [theme]);

  useEffect(() => {
    storage.set("gamevault_cart", cart);
  }, [cart]);

  useEffect(() => {
    storage.set("gamevault_wishlist", wishlist);
  }, [wishlist]);

  useEffect(() => {
    document.body.classList.toggle(
      "modal-open",
      cartOpen || Boolean(authMode) || Boolean(selectedGame),
    );
  }, [cartOpen, authMode, selectedGame]);

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
        setDashboard(null);
        notify("Sesija je istekla. Ulogujte se ponovo.");
      });

    return () => {
      active = false;
    };
  }, [notify, user]);

  useEffect(() => {
    api("/api/filters")
      .then((data) => setOptions(data))
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    api("/api/games?limit=30&maxPrice=200")
      .then((data) => setAllGames(data.games))
      .catch((error) => notify(error.message));
  }, [notify]);

  useEffect(() => {
    const params = new URLSearchParams({
      search: filters.search,
      genre: filters.genre,
      platform: filters.platform,
      launcher: filters.launcher,
      minPrice: String(filters.minPrice),
      maxPrice: String(filters.maxPrice),
      sort: filters.sort,
      page: String(filters.page),
      limit: "9",
    });

    setLoading(true);
    api(`/api/games?${params.toString()}`)
      .then((data) => {
        setGames(data.games);
        setPagination(data.pagination);
      })
      .catch((error) => notify(error.message))
      .finally(() => setLoading(false));
  }, [filters, notify]);

  useEffect(() => {
    if (!["dashboard", "library"].includes(router.route) || !user) return;

    setDashboardLoading(true);
    api("/api/dashboard")
      .then((data) => setDashboard(data))
      .catch((error) => notify(error.message))
      .finally(() => setDashboardLoading(false));
  }, [router.route, user, notify]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => {
      const next = { ...current, [key]: value, page: 1 };
      if (key === "minPrice" && Number(value) > next.maxPrice)
        next.maxPrice = Number(value);
      if (key === "maxPrice" && Number(value) < next.minPrice)
        next.minPrice = Number(value);
      return next;
    });
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  function addToCart(game) {
    setCart((current) => {
      const existing = current.find((item) => item.id === game.id);
      if (existing) {
        return current.map((item) =>
          item.id === game.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
            : item,
        );
      }
      return [...current, { ...game, quantity: 1 }];
    });
    notify(`${game.title} je dodat u korpu.`);
  }

  function toggleWishlist(game) {
    setWishlist((current) => {
      if (current.includes(game.id)) {
        notify(`${game.title} je uklonjen iz wishliste.`);
        return current.filter((id) => id !== game.id);
      }
      notify(`${game.title} je dodat u wishlistu.`);
      return [...current, game.id];
    });
  }

  function changeQuantity(id, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0 && item.quantity <= 5),
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function logout() {
    storage.remove("gamevault_user");
    localStorage.removeItem("gamevault_token");
    setUser(null);
    setDashboard(null);
    router.navigate("/");
    notify("Odjavljeni ste.");
  }

  function handleAuthSuccess(data) {
    localStorage.setItem("gamevault_token", data.token);
    storage.set("gamevault_user", data.user);
    setUser(data.user);
    setAuthMode(null);
    notify(`Dobrodošli, ${data.user.name}.`);
  }

  function scrollBackToTop() {
    const start = window.scrollY;
    const duration = Math.min(Math.max(start * 0.9, 850), 1900);
    const startedAt = performance.now();
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    function step(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start * (1 - eased));

      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      root.style.scrollBehavior = previousBehavior;
    }

    window.requestAnimationFrame(step);
  }

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const wishlistGames = useMemo(
    () => allGames.filter((game) => wishlist.includes(game.id)),
    [allGames, wishlist],
  );

  return (
    <div className="app-shell">
      <Header
        route={router.route}
        navigate={router.navigate}
        theme={theme}
        setTheme={setTheme}
        cartCount={cartCount}
        setCartOpen={setCartOpen}
        user={user}
        logout={logout}
        setAuthMode={setAuthMode}
      />

      <main className="main-content">
        {router.route === "about" ? (
          <AboutPage navigate={router.navigate} />
        ) : router.route === "contact" ? (
          <ContactPage />
        ) : router.route === "dashboard" ? (
          <DashboardPage
            user={user}
            dashboard={dashboard}
            loading={dashboardLoading}
            setAuthMode={setAuthMode}
            navigate={router.navigate}
            wishlistGames={wishlistGames}
            toggleWishlist={toggleWishlist}
          />
        ) : router.route === "library" ? (
          <LibraryPage
            user={user}
            dashboard={dashboard}
            loading={dashboardLoading}
            setAuthMode={setAuthMode}
            navigate={router.navigate}
          />
        ) : router.route === "admin-users" ? (
          <AdminUsersPage
            user={user}
            setAuthMode={setAuthMode}
            navigate={router.navigate}
          />
        ) : router.route === "checkout" ? (
          <CheckoutPage
            cart={cart}
            total={cartTotal}
            user={user}
            setCart={setCart}
            setDashboard={setDashboard}
            notify={notify}
            navigate={router.navigate}
          />
        ) : (
          <StorePage
            games={games}
            loading={loading}
            pagination={pagination}
            filters={filters}
            options={options}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            setFilters={setFilters}
            addToCart={addToCart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            setSelectedGame={setSelectedGame}
          />
        )}
      </main>

      <Footer navigate={router.navigate} />

      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          user={user}
          changeQuantity={changeQuantity}
          removeFromCart={removeFromCart}
          setCartOpen={setCartOpen}
          setAuthMode={setAuthMode}
          navigate={router.navigate}
        />
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onSuccess={handleAuthSuccess}
        />
      )}

      {selectedGame && (
        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          addToCart={addToCart}
          isWishlisted={wishlist.includes(selectedGame.id)}
          toggleWishlist={toggleWishlist}
        />
      )}

      <button
        className={cx("icon-button", "back-to-top", showTop && "visible")}
        title="Na vrh"
        onClick={scrollBackToTop}
      >
        ↑
      </button>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
