import { hasDiscount, money } from "../lib/format.js";

export default function CartDrawer({
  cart,
  total,
  user,
  changeQuantity,
  removeFromCart,
  setCartOpen,
  setAuthMode,
  navigate,
}) {
  function continueToCheckout() {
    if (!user) {
      setCartOpen(false);
      setAuthMode("login");
      return;
    }

    setCartOpen(false);
    navigate("/checkout");
  }

  return (
    <div
      className="overlay"
      onMouseDown={(event) =>
        event.target.className === "overlay" && setCartOpen(false)
      }
    >
      <aside className="cart-drawer">
        <div className="drawer-header">
          <h2>Korpa</h2>
          <button
            className="icon-button"
            title="Zatvori"
            onClick={() => setCartOpen(false)}
          >
            ×
          </button>
        </div>

        {cart.length ? (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.cover} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {money(item.price)} · {item.edition}
                      {hasDiscount(item) && (
                        <span className="cart-discount">
                          {" "}
                          -{item.discountPercent}%
                        </span>
                      )}
                    </p>
                    <div className="quantity-row">
                      <button
                        className="icon-button"
                        onClick={() => changeQuantity(item.id, -1)}
                        title="Smanji"
                      >
                        −
                      </button>
                      <strong>{item.quantity}</strong>
                      <button
                        className="icon-button"
                        onClick={() => changeQuantity(item.id, 1)}
                        title="Povećaj"
                        disabled={item.quantity >= 5}
                      >
                        +
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Ukloni
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Ukupno</span>
                <strong>{money(total)}</strong>
              </div>
              <button className="primary-button" onClick={continueToCheckout}>
                Nastavi na plaćanje
              </button>
              <button
                className="secondary-button"
                onClick={() => setCartOpen(false)}
              >
                Nastavi kupovinu
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>Korpa je prazna</h3>
            <p>
              Dodajte igre iz kataloga i nastavite na plaćanje kada budete
              spremni.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
