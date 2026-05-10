import { useState } from "react";
import { api } from "../lib/api.js";

const initialContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialContactForm);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [busy, setBusy] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("");
    setStatusType("success");
    setBusy(true);

    try {
      const data = await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus(data.message);
      setStatusType("success");
      setForm(initialContactForm);
    } catch (error) {
      setStatus(error.message);
      setStatusType("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="contact-page">
      <div className="contact-copy">
        <p className="eyebrow">Kontakt</p>
        <h1>Imas pitanje, predlog ili zelis da prijavis problem?</h1>
        <p>
          Posalji poruku kroz formu.
        </p>

        <div className="contact-details">
          <div>
            <span>Email</span>
            <strong>support@gamevault.com</strong>
          </div>
          <div>
            <span>Radno vreme</span>
            <strong>09:00 - 17:00</strong>
          </div>
          <div>
            <span>Lokacija</span>
            <strong>Pavla Pavlinovica 12</strong>
          </div>
        </div>
      </div>

      <form className="contact-form" onSubmit={submit}>
        <div className="two-fields">
          <div className="field-group">
            <label>Ime</label>
            <input
              className="text-input"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </div>
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
        </div>

        <div className="field-group">
          <label>Naslov</label>
          <input
            className="text-input"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label>Poruka</label>
          <textarea
            className="text-input textarea-input"
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            required
          />
        </div>

        {status && <p className={`form-message ${statusType}`}>{status}</p>}

        <button className="primary-button contact-submit" disabled={busy}>
          {busy ? "Slanje..." : "Posalji poruku"}
        </button>
      </form>
    </section>
  );
}
