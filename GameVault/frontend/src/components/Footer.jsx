export default function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <button className="footer-brand" onClick={() => navigate("/")}>
            <span className="brand-mark">GV</span>
            <span>GameVault</span>
          </button>
          <p>
            Digitalna prodavnica igara sa katalogom, igrice sa različitim
            žanrovima na različitim portovima.
          </p>
        </div>

        <div className="footer-links">
          <button onClick={() => navigate("/")}>Prodavnica</button>
          <button onClick={() => navigate("/about")}>O nama</button>
          <button onClick={() => navigate("/contact")}>Kontakt</button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/library")}>Biblioteka</button>
          <button onClick={() => navigate("/admin-users")}>Admin</button>
        </div>
      </div>
      <div className="footer-bottom">
        <span>GameVault projekat</span>
        <span>React + Node + Express + JSON</span>
      </div>
    </footer>
  );
}
