import UserManager from "../components/UserManager.jsx";

export default function AdminUsersPage({ user, setAuthMode, navigate }) {
  if (!user) {
    return (
      <div className="empty-state">
        <h2>Admin panel ceka login</h2>
        <p>Samo admin korisnik moze da dodaje i menja korisnike.</p>
        <button
          className="primary-button empty-action"
          onClick={() => setAuthMode("login")}
        >
          Login
        </button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="empty-state">
        <h2>Nemate pristup</h2>
        <p>Ova stranica je dostupna samo admin nalogu.</p>
        <button
          className="primary-button empty-action"
          onClick={() => navigate("/dashboard")}
        >
          Nazad na dashboard
        </button>
      </div>
    );
  }

  return (
    <section className="admin-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Admin / Korisnici</p>
          <h1>Upravljanje korisnicima</h1>
          <p>
            Dodavanje novih naloga i izmena postojecih korisnika.
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

      <UserManager currentUser={user} />
    </section>
  );
}
