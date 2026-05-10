import { useEffect, useState } from "react";
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
import { cx } from "./lib/format.js";
import { useAppRouter } from "./router/useAppRouter.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import {
  DashboardProvider,
  useDashboard,
} from "./context/DashboardContext.jsx";
import { ShopProvider, useShop } from "./context/ShopContext.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { ToastProvider, useToast } from "./context/ToastContext.jsx";

function AppContent() {
  const { notify } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, authMode, setAuthMode, handleAuthSuccess, logout } = useAuth();
  const {
    games,
    loading,
    pagination,
    filters,
    options,
    cart,
    cartTotal,
    cartCount,
    wishlist,
    wishlistGames,
    setFilters,
    setCart,
    updateFilter,
    resetFilters,
    addToCart,
    toggleWishlist,
    changeQuantity,
    removeFromCart,
  } = useShop();
  const { dashboard, dashboardLoading, setDashboard, loadDashboard } =
    useDashboard();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showTop, setShowTop] = useState(false);

  const router = useAppRouter(user, (message, check) => {
    notify(message);
    if (check?.requiresLogin) {
      setAuthMode("login");
    }
  });

  useEffect(() => {
    document.body.classList.toggle(
      "modal-open",
      cartOpen || Boolean(authMode) || Boolean(selectedGame),
    );
  }, [cartOpen, authMode, selectedGame]);

  useEffect(() => {
    if (!["dashboard", "library"].includes(router.route) || !user) return;
    loadDashboard();
  }, [loadDashboard, router.route, user]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    setDashboard(null);
    router.navigate("/");
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
        logout={handleLogout}
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
        ^
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <ShopProvider>
            <DashboardProvider>
              <AppContent />
            </DashboardProvider>
          </ShopProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
