import { useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { hasDiscount, money } from "../lib/format.js";

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function onlyDigits(value, maxLength) {
  return digitsOnly(value).slice(0, maxLength);
}

function formatCardNumber(value) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value) {
  let digits = onlyDigits(value, 4);

  if (digits.length === 1 && Number(digits) > 1) {
    digits = `0${digits}`;
  }

  if (digits.length >= 2) {
    const month = Math.min(Math.max(Number(digits.slice(0, 2)) || 1, 1), 12)
      .toString()
      .padStart(2, "0");
    digits = `${month}${digits.slice(2)}`;
  }

  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

function validateCheckoutForm(form) {
  const errors = [];
  const trimmed = {
    email: form.email.trim(),
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    country: form.country.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
    street: form.street.trim(),
    cardName: form.cardName.trim(),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) errors.push("email");
  if (trimmed.fullName.length < 2) errors.push("ime i prezime");
  if (trimmed.phone.replace(/\D/g, "").length < 6) errors.push("telefon");
  if (trimmed.country.length < 2) errors.push("država");
  if (trimmed.city.length < 2) errors.push("grad");
  if (trimmed.postalCode.length < 3) errors.push("poštanski broj");
  if (trimmed.street.length < 3) errors.push("ulica i broj");
  if (trimmed.cardName.length < 2) errors.push("ime na kartici");
  if (onlyDigits(form.cardNumber, 16).length !== 16)
    errors.push("broj kartice");
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.exp)) errors.push("datum isteka");
  if (onlyDigits(form.cvc, 3).length !== 3) errors.push("CVC");

  return errors;
}

export default function CheckoutPage({
  cart,
  total,
  user,
  setCart,
  setDashboard,
  notify,
  navigate,
}) {
  const [form, setForm] = useState({
    email: user?.email || "",
    fullName: user?.name || "",
    phone: "",
    country: "Srbija",
    city: "",
    postalCode: "",
    street: "",
    apartment: "",
    cardName: user?.name || "",
    cardNumber: "4242 4242 4242 4242",
    exp: "12/30",
    cvc: "123",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const savings = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (!hasDiscount(item)) return sum;
      return sum + (item.originalPrice - item.price) * item.quantity;
    }, 0);
  }, [cart]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    if (!cart.length) {
      setMessage("Korpa je prazna.");
      return;
    }

    const errors = validateCheckoutForm(form);
    if (errors.length) {
      setMessage(`Proverite: ${errors.join(", ")}.`);
      return;
    }

    setBusy(true);

    try {
      const data = await api("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          cardName: form.cardName.trim(),
          cardNumber: form.cardNumber,
          exp: form.exp,
          cvc: form.cvc,
          address: {
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            country: form.country.trim(),
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
            street: form.street.trim(),
            apartment: form.apartment.trim(),
          },
        }),
      });

      setCart([]);
      setDashboard(null);
      notify(`${data.message} Porudžbina: ${data.order.id}`);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="empty-state">
        <h2>Korpa je prazna</h2>
        <p>Dodajte bar jednu igru pre nego što nastavite na plaćanje.</p>
        <button
          className="primary-button empty-action"
          onClick={() => navigate("/")}
        >
          Nazad u prodavnicu
        </button>
      </div>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">Sigurna kupovina</p>
          <h1>Plaćanje</h1>
          <p>
            Unesite kontakt, adresu i podatke kartice da završite porudžbinu.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate("/", { scroll: false })}
        >
          Nazad u prodavnicu
        </button>
      </div>

      <div className="checkout-layout">
        <form className="checkout-page-form" onSubmit={submit}>
          <section className="checkout-section">
            <h2>Kontakt</h2>
            <div className="two-fields">
              <div className="field-group">
                <label>Email</label>
                <input
                  className="text-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Telefon</label>
                <input
                  className="text-input"
                  value={form.phone}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  pattern="[0-9]*"
                  onChange={(event) =>
                    updateField("phone", onlyDigits(event.target.value, 15))
                  }
                  required
                />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Adresa</h2>
            <div className="field-group">
              <label>Ime i prezime</label>
              <input
                className="text-input"
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                required
              />
            </div>
            <div className="two-fields">
              <div className="field-group">
                <label>Država</label>
                <input
                  className="text-input"
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label>Grad</label>
                <input
                  className="text-input"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="two-fields">
              <div className="field-group">
                <label>Ulica i broj</label>
                <input
                  className="text-input"
                  value={form.street}
                  onChange={(event) =>
                    updateField("street", event.target.value)
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label>Poštanski broj</label>
                <input
                  className="text-input"
                  value={form.postalCode}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  onChange={(event) =>
                    updateField("postalCode", event.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="field-group">
              <label>Stan, sprat ili napomena</label>
              <input
                className="text-input"
                value={form.apartment}
                onChange={(event) =>
                  updateField("apartment", event.target.value)
                }
              />
            </div>
          </section>

          <section className="checkout-section">
            <h2>Kartica</h2>
            <div className="field-group">
              <label>Ime na kartici</label>
              <input
                className="text-input"
                value={form.cardName}
                onChange={(event) =>
                  updateField("cardName", event.target.value)
                }
                required
              />
            </div>
            <div className="field-group">
              <label>Broj kartice</label>
              <input
                className="text-input"
                value={form.cardNumber}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                onChange={(event) =>
                  updateField(
                    "cardNumber",
                    formatCardNumber(event.target.value),
                  )
                }
                required
              />
            </div>
            <div className="two-fields">
              <div className="field-group">
                <label>Datum isteka</label>
                <input
                  className="text-input"
                  value={form.exp}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  maxLength={5}
                  onChange={(event) =>
                    updateField("exp", formatExpiry(event.target.value))
                  }
                  required
                />
              </div>
              <div className="field-group">
                <label>CVC</label>
                <input
                  className="text-input"
                  value={form.cvc}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={3}
                  onChange={(event) =>
                    updateField("cvc", onlyDigits(event.target.value, 3))
                  }
                  required
                />
              </div>
            </div>
          </section>

          {message && <p className="form-message error">{message}</p>}

          <button className="primary-button checkout-submit" disabled={busy}>
            {busy ? "Procesiranje..." : "Kupi sada"}
          </button>
        </form>

        <aside className="checkout-summary-card">
          <h2>Porudžbina</h2>
          <div className="checkout-items">
            {cart.map((item) => (
              <div className="checkout-item" key={item.id}>
                <img src={item.cover} alt={item.title} />
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.quantity} × {money(item.price)}
                  </span>
                  {hasDiscount(item) && (
                    <span className="discount-note">
                      Popust {item.discountPercent}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {savings > 0 && (
            <div className="summary-row">
              <span>Ušteda</span>
              <strong>{money(savings)}</strong>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Ukupno</span>
            <strong>{money(total)}</strong>
          </div>
          <p className="secure-note">
            Test kartica je već upisana i možeš je promeniti.
          </p>
        </aside>
      </div>
    </section>
  );
}
