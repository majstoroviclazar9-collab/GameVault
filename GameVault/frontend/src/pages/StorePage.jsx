import FilterPanel from "../components/FilterPanel.jsx";
import GameCard from "../components/GameCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { money } from "../lib/format.js";

export default function StorePage({
  games,
  loading,
  pagination,
  filters,
  options,
  updateFilter,
  resetFilters,
  setFilters,
  addToCart,
  wishlist,
  toggleWishlist,
  setSelectedGame,
}) {
  const spotlight = games[0];

  return (
    <>
      <section className="store-hero">
        <div className="hero-copy">
          <p className="eyebrow">Digitalna prodavnica igara</p>
          <h1>GameVault</h1>
          <p>
            Kupovina popularnih PC i konzolnih naslova, sa mnogim žanrovima i platformama.
          </p>
        </div>

        <aside className="spotlight">
          {spotlight && (
            <>
              <img src={spotlight.cover} alt={spotlight.title} />
              <div className="spotlight-info">
                <h2>{spotlight.title}</h2>
                <p>
                  {money(spotlight.price)} ·{" "}
                  {spotlight.genres.slice(0, 2).join(" / ")}
                </p>
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="shop-layout">
        <FilterPanel
          filters={filters}
          options={options}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />

        <div>
          <div className="store-toolbar">
            <div className="section-title">
              <h2>Katalog igara</h2>
              <p>
                {pagination.totalItems} rezultata · strana {pagination.page} od{" "}
                {pagination.totalPages}
              </p>
            </div>

            <select
              className="select-input toolbar-select"
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="rating-desc">Najbolje ocenjene</option>
              <option value="newest">Najnovije</option>
              <option value="price-asc">Cena rastuće</option>
              <option value="price-desc">Cena opadajuće</option>
              <option value="title">Naziv A-Z</option>
            </select>
          </div>

          <div className="catalog-results">
            {loading ? (
              <div className="loading">Učitavanje kataloga...</div>
            ) : games.length ? (
              <>
                <div className="games-grid">
                  {games.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      addToCart={addToCart}
                      isWishlisted={wishlist.includes(game.id)}
                      toggleWishlist={toggleWishlist}
                      setSelectedGame={setSelectedGame}
                    />
                  ))}
                </div>
                <Pagination pagination={pagination} setFilters={setFilters} />
              </>
            ) : (
              <div className="empty-state">
                <h2>Nema igara za izabrane filtere</h2>
                <p>
                  Promenite žanr, platformu, launcher ili cenu i katalog će se
                  odmah osvežiti.
                </p>
                <button
                  className="primary-button empty-action"
                  onClick={resetFilters}
                >
                  Resetuj filtere
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
