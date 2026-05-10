import { hasDiscount, money } from "../lib/format.js";

export default function GameModal({
  game,
  onClose,
  addToCart,
  isWishlisted,
  toggleWishlist,
}) {
  return (
    <div
      className="overlay center-overlay"
      onMouseDown={(event) =>
        event.target.classList.contains("overlay") && onClose()
      }
    >
      <section className="game-detail-panel">
        <div className="modal-header">
          <h2>{game.title}</h2>
          <button className="icon-button" title="Zatvori" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-cover-wrap">
          <img className="detail-cover" src={game.cover} alt={game.title} />
          {hasDiscount(game) && (
            <span className="discount-pill detail-discount">
              -{game.discountPercent}%
            </span>
          )}
        </div>
        <p className="game-desc detail-description">{game.description}</p>

        <div className="detail-meta">
          <div>
            <span>Cena</span>
            <strong>{money(game.price)}</strong>
            {hasDiscount(game) && <small>{money(game.originalPrice)}</small>}
          </div>
          <div>
            <span>Ocena</span>
            <strong>★ {game.rating}</strong>
          </div>
          <div>
            <span>Godina</span>
            <strong>{game.releaseYear}</strong>
          </div>
        </div>

        <div className="chips">
          {[...game.genres, ...game.platforms, ...game.launchers].map(
            (item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ),
          )}
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={() => toggleWishlist(game)}
          >
            {isWishlisted ? "Ukloni iz wishliste" : "Dodaj u wishlistu"}
          </button>
          <button
            className="primary-button"
            onClick={() => {
              addToCart(game);
              onClose();
            }}
          >
            Dodaj u korpu
          </button>
        </div>
      </section>
    </div>
  );
}
