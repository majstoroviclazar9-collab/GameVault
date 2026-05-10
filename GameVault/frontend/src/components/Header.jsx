import { cx } from "../lib/format.js";

export default function Header({
  route,
  navigate,
  theme,
  setTheme,
  cartCount,
  setCartOpen,
  user,
  logout,
  setAuthMode,
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">GV</span>
          <span>GameVault</span>
        </button>

        <nav className="nav-links">
          <button
            className={cx("nav-button", route === "store" && "active")}
            onClick={() => navigate("/")}
          >
            Prodavnica
          </button>
          <button
            className={cx("nav-button", route === "about" && "active")}
            onClick={() => navigate("/about")}
          >
            O nama
          </button>
          <button
            className={cx("nav-button", route === "contact" && "active")}
            onClick={() => navigate("/contact")}
          >
            Kontakt
          </button>
          <button
            className={cx("nav-button", route === "dashboard" && "active")}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className={cx("nav-button", route === "library" && "active")}
            onClick={() => navigate("/library")}
          >
            Biblioteka
          </button>
          {user?.role === "admin" && (
            <button
              className={cx("nav-button", route === "admin-users" && "active")}
              onClick={() => navigate("/admin-users")}
            >
              Admin
            </button>
          )}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            title={theme === "dark" ? "Light tema" : "Dark tema"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "☼" : "☾"}
          </button>
          <button
            className="icon-button"
            title="Korpa"
            onClick={() => setCartOpen(true)}
          >
            ⌁{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          {user ? (
            <div className="user-strip">
              <span className="user-name">{user.name}</span>
              <button className="ghost-button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className="primary-button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
