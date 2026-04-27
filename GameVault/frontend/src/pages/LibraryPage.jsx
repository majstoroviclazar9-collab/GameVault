import { dateText, money } from "../lib/format.js";

export default function LibraryPage({
  user,
  dashboard,
  loading,
  setAuthMode,
  navigate,
}) {
  if (!user) {
    return (
      <div className="empty-state">
        <h2>Biblioteka ceka login</h2>
        <p>Ulogujte se ili nastavite kao gost da vidite kupljene igre.</p>
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
    return <div className="loading">Ucitavanje biblioteke...</div>;
  }

  const lastOrderDate = dashboard.recentOrders[0]?.createdAt;

  return (
    <section className="library-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Moja biblioteka</p>
          <h1>Kupljene igre</h1>
          <p>
            Sve igre koje ste kupili, sa ukupnom kolicinom i potrosnjom po
            naslovu.
          </p>
        </div>
        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button className="secondary-button" onClick={() => navigate("/")}>
            Prodavnica
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>Naslovi</span>
          <strong>{dashboard.metrics.uniqueGamesOwned}</strong>
        </div>
        <div className="dashboard-card">
          <span>Kopije</span>
          <strong>{dashboard.metrics.gamesOwned}</strong>
        </div>
        <div className="dashboard-card">
          <span>Ukupno</span>
          <strong>{money(dashboard.metrics.totalSpent)}</strong>
        </div>
        <div className="dashboard-card">
          <span>Poslednja kupovina</span>
          <strong>{lastOrderDate ? dateText(lastOrderDate) : "-"}</strong>
        </div>
      </div>

      {dashboard.library.length ? (
        <div className="library-page-grid">
          {dashboard.library.map((game) => (
            <article className="library-card" key={game.id}>
              <div className="library-cover-wrap">
                <img src={game.cover} alt={game.title} />
                <span className="owned-badge">x{game.ownedQuantity}</span>
              </div>
              <div className="library-card-body">
                <div>
                  <h2>{game.title}</h2>
                  <p>{game.genres.slice(0, 3).join(" / ")}</p>
                </div>
                <div className="library-meta-row">
                  <span>Placeno</span>
                  <strong>{money(game.purchasedTotal)}</strong>
                </div>
                <div className="library-meta-row">
                  <span>Platforme</span>
                  <strong>{game.platforms.slice(0, 2).join(" / ")}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Biblioteka je prazna</h2>
          <p>
            Kupite igru iz prodavnice i pojavice se ovde sa kolicinom i ukupnom
            cenom.
          </p>
          <button
            className="primary-button empty-action"
            onClick={() => navigate("/")}
          >
            Idi u prodavnicu
          </button>
        </div>
      )}
    </section>
  );
}
