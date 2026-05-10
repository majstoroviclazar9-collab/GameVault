import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export default function UserManager({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await api("/api/users");
      setUsers(data.users);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(user) {
    setEditingId(user.id);
    setMessage("");
    setMessageType("success");
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
  }

  function resetForm() {
    setEditingId(null);
    setMessage("");
    setMessageType("success");
    setForm(emptyUserForm);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("success");
    setBusy(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password || !editingId) {
        payload.password = form.password;
      }

      await api(editingId ? `/api/users/${editingId}` : "/api/users", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      await loadUsers();
      resetForm();
      setMessageType("success");
      setMessage(editingId ? "Korisnik je izmenjen." : "Korisnik je dodat.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(user) {
    if (user.id === currentUser?.id) {
      setMessageType("error");
      setMessage("Ne mozete obrisati svoj trenutno ulogovan nalog.");
      return;
    }

    const confirmed = window.confirm(`Obrisati korisnika ${user.name}?`);
    if (!confirmed) return;

    setMessage("");
    setMessageType("success");
    setBusy(true);

    try {
      await api(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      setUsers((current) => current.filter((item) => item.id !== user.id));

      if (editingId === user.id) {
        resetForm();
      }

      await loadUsers();
      setMessageType("success");
      setMessage("Korisnik je obrisan.");
    } catch (error) {
      setMessageType("error");
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dashboard-card user-tool">
      <div className="user-tool-heading">
        <div>
          <h2>Korisnici</h2>
          <p>Dodavanje i editovanje korisnika iz posebnog JSON fajla.</p>
        </div>
        {editingId && (
          <button className="secondary-button" onClick={resetForm}>
            Novi korisnik
          </button>
        )}
      </div>

      <div className="user-tool-layout">
        <form className="user-form" onSubmit={submit}>
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

          <div className="two-fields">
            <div className="field-group">
              <label>{editingId ? "Nova lozinka" : "Lozinka"}</label>
              <input
                className="text-input"
                type="password"
                value={form.password}
                minLength={6}
                placeholder={editingId ? "Ostavi prazno ako ne menjas" : ""}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                required={!editingId}
              />
            </div>
            <div className="field-group">
              <label>Uloga</label>
              <select
                className="select-input"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {message && (
            <p className={`form-message ${messageType}`}>{message}</p>
          )}

          <button className="primary-button" disabled={busy}>
            {busy
              ? "Cuvanje..."
              : editingId
                ? "Sacuvaj izmene"
                : "Dodaj korisnika"}
          </button>
        </form>

        <div className="users-list">
          {users.map((user) => (
            <div className="user-row" key={user.id}>
              <div>
                <strong>{user.name}</strong>
                <span>
                  {user.email} - {user.role}
                </span>
              </div>
              <div className="user-row-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => startEdit(user)}
                  disabled={busy}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => deleteUser(user)}
                  disabled={busy || user.id === currentUser?.id}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
