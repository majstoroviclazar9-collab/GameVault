import { dateText, money } from "../lib/format.js";

export default function DashboardPage({
  user,
  dashboard,
  loading,
  setAuthMode,
  navigate,
  wishlistGames,
  toggleWishlist,
}) {
  if (!user) {
    return (
      <div className="empty-state">
        <h2>Dashboard ceka login</h2>
        <p>
          Korisnicki dashboard prikazuje kupovine, wishlistu, porudzbine i
          ukupnu potrosnju.
        </p>
        <button
          className="primary-button empty-action"
          onClick={() => setAuthMode("login")}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading || !dashboard) {
    return <div className="loading">Ucitavanje dashboarda...</div>;
  }

  return (
    <section className="dashboard-view">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Korisnicki panel</p>
          <h1>Zdravo, {dashboard.user.name}</h1>
          <p>Pregled kupovina, wishliste i aktivnosti naloga.</p>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => navigate("/library")}
          >
            Moja biblioteka
          </button>
          {user.role === "admin" && (
            <button
              className="secondary-button"
              onClick={() => navigate("/admin-users")}
            >
              Admin
            </button>
          )}
          <button className="secondary-button" onClick={() => navigate("/")}>
            Prodavnica
          </button>
        </div>
      </div>

      {user.role === "guest" && (
        <div className="dashboard-card guest-note">
          <h2>Gost nalog</h2>
          <p>
            Kupovine tokom ove sesije rade normalno, ali za stalni nalog i
            cuvanje podataka posle restarta servera napravi regularan nalog.
          </p>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Porudzbine</span>
          <strong>{dashboard.metrics.orders}</strong>
        </div>
        <div className="dashboard-card">
          <span>Kupljene kopije</span>
          <strong>{dashboard.metrics.gamesOwned}</strong>
        </div>
        <div className="dashboard-card">
          <span>Razlicite igre</span>
          <strong>{dashboard.metrics.uniqueGamesOwned}</strong>
        </div>
        <div className="dashboard-card">
          <span>Potroseno</span>
          <strong>{money(dashboard.metrics.totalSpent)}</strong>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-card">
          <div className="card-heading-row">
            <h2>Biblioteka</h2>
            <button
              className="ghost-button"
              onClick={() => navigate("/library")}
            >
              Otvori
            </button>
          </div>
          {dashboard.library.length ? (
            <div className="library-grid">
              {dashboard.library.slice(0, 6).map((game) => (
                <div className="library-item" key={game.id}>
                  <div className="library-cover-wrap">
                    <img src={game.cover} alt={game.title} />
                    <span className="owned-badge">x{game.ownedQuantity}</span>
                  </div>
                  <strong>{game.title}</strong>
                  <span>{money(game.purchasedTotal)} ukupno</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state nested-empty">
              <h3>Jos nema kupljenih igara</h3>
              <p>Kada zavrsite checkout, igre ce se pojaviti u biblioteci.</p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Wishlist</h2>
          {wishlistGames.length ? (
            <div className="wishlist-list">
              {wishlistGames.map((game) => (
                <div className="wishlist-row" key={game.id}>
                  <img src={game.cover} alt={game.title} />
                  <div>
                    <strong>{game.title}</strong>
                    <span>
                      {money(game.price)} -{" "}
                      {game.genres.slice(0, 2).join(" / ")}
                    </span>
                  </div>
                  <button
                    className="icon-button"
                    title="Ukloni"
                    onClick={() => toggleWishlist(game)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state nested-empty">
              <h3>Wishlist je prazna</h3>
              <p>Sacuvajte igre iz kataloga i pojavice se ovde.</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-card">
          <h2>Porudzbine</h2>
          {dashboard.recentOrders.length ? (
            <div className="orders-list">
              {dashboard.recentOrders.map((order) => (
                <div className="order-row" key={order.id}>
                  <strong>
                    {order.id} - {money(order.total)}
                  </strong>
                  <span>
                    {dateText(order.createdAt)} - {order.itemCount} kom. -{" "}
                    {order.payment.provider}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state nested-empty">
              <h3>Nema porudzbina</h3>
              <p>Ovde ce se prikazati poslednje kupovine.</p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Omiljeni zanrovi</h2>
          {dashboard.favoriteGenres.length > 0 ? (
            <div className="chips genre-chips">
              {dashboard.favoriteGenres.map(([genre, count]) => (
                <span className="chip" key={genre}>
                  {genre} - {count}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-state nested-empty">
              <h3>Nema statistike</h3>
              <p>Zanrovi ce se popuniti kada kupite prve igre.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
