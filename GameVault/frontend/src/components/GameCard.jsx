import { hasDiscount, money } from "../lib/format.js";

export default function GameCard({
  game,
  addToCart,
  isWishlisted,
  toggleWishlist,
  setSelectedGame,
}) {
  return (
    <article className="game-card">
      <div className="cover-wrap">
        <img src={game.cover} alt={game.title} />
        <span className="price-pill">{money(game.price)}</span>
        <span className="rating-pill">★ {game.rating}</span>
        {hasDiscount(game) && (
          <span className="discount-pill">-{game.discountPercent}%</span>
        )}
        <button
          className={`wishlist-button ${isWishlisted ? "active" : ""}`}
          title={isWishlisted ? "Ukloni iz wishliste" : "Dodaj u wishlistu"}
          onClick={() => toggleWishlist(game)}
        >
          ♥
        </button>
      </div>

      <div className="game-body">
        <div className="game-title-row">
          <h3>{game.title}</h3>
          <span className="edition">{game.edition}</span>
        </div>
        <div className="card-price-row">
          <strong>{money(game.price)}</strong>
          {hasDiscount(game) && <span>{money(game.originalPrice)}</span>}
        </div>
        <p className="game-desc">{game.description}</p>
        <div className="chips">
          {game.genres.slice(0, 3).map((genre) => (
            <span className="chip" key={genre}>
              {genre}
            </span>
          ))}
          <span className="chip">{game.platforms[0]}</span>
        </div>
        <div className="game-actions">
          <button
            className="secondary-button"
            onClick={() => setSelectedGame(game)}
          >
            Detalji
          </button>
          <button className="primary-button" onClick={() => addToCart(game)}>
            Dodaj
          </button>
        </div>
      </div>
    </article>
  );
}
