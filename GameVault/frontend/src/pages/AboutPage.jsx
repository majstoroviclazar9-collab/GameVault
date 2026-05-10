export default function AboutPage({ navigate }) {
  return (
    <section className="info-page">
      <div className="info-hero">
        <p className="eyebrow">O nama</p>
        <h1>
          GameVault spaja katalog igara, kupovinu i licni dashboard u jednu
          modernu prodavnicu.
        </h1>
        <p>
          Sajt je napravljen kao kompletna web prodavnica za digitalne igre. Mi
          smo tim gejmera koji je odlučio da napravi platformu kakvu smo i sami
          želeli da koristimo. Umesto komplikovanih kupovina i nepouzdanih
          izvora, naš cilj je da ponudimo jednostavan, siguran i brz način da
          dođeš do svojih omiljenih igara.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <span>01</span>
          <h2>Katalog</h2>
          <p>
            Pregledaj sve dostupne igre i pronađi ono što ti najviše odgovara.
          </p>
        </article>
        <article className="info-card">
          <span>02</span>
          <h2>Kupovina</h2>
          <p>Jednostavno i brzo kupi željene igre uz sigurno plaćanje.</p>
        </article>
        <article className="info-card">
          <span>03</span>
          <h2>Dashboard</h2>
          <p>Prati svoje porudžbine, biblioteku i aktivnost na jednom mestu.</p>
        </article>
      </div>

      <div className="info-band">
        <div>
          <h2>Napravljeno za gejmere od gejmera</h2>
          <p>
            Za sva pitanja, sugestije ili podršku — slobodno nas kontaktiraj.
          </p>
        </div>
        <button className="primary-button" onClick={() => navigate("/contact")}>
          Kontaktiraj nas
        </button>
      </div>
    </section>
  );
}
