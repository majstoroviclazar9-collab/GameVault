import { useState } from "react";
import { api } from "../lib/api.js";

export default function AuthModal({ mode, setMode, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const data = await api(isRegister ? "/api/register" : "/api/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onSuccess(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest() {
    setMessage("");
    setBusy(true);

    try {
      const data = await api("/api/guest-login", {
        method: "POST",
        body: JSON.stringify({}),
      });
      onSuccess(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="overlay center-overlay"
      onMouseDown={(event) =>
        event.target.classList.contains("overlay") && setMode(null)
      }
    >
      <section className="auth-panel">
        <div className="modal-header">
          <h2>{isRegister ? "Register" : "Login"}</h2>
          <button
            className="icon-button"
            title="Zatvori"
            onClick={() => setMode(null)}
          >
            x
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={!isRegister ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={isRegister ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <>
              <label>Ime</label>
              <input
                className="text-input"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </>
          )}

          <label>Email</label>
          <input
            className="text-input"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />

          <label>Lozinka</label>
          <input
            className="text-input"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            minLength={6}
            required
          />

          {message && <p className="form-message error">{message}</p>}

          <button className="primary-button" disabled={busy}>
            {busy ? "Sacekajte..." : isRegister ? "Napravi nalog" : "Uloguj se"}
          </button>
        </form>

        <button
          className="secondary-button guest-login-button"
          disabled={busy}
          onClick={continueAsGuest}
        >
          Nastavi kao gost
        </button>

        <p className="auth-hint">
          Za test kupovinu mozes koristiti karticu 4242 4242 4242 4242, datum
          12/30 i CVC 123.
        </p>
      </section>
    </div>
  );
}
