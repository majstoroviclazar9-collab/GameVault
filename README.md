# GameVault
<img width="1877" height="903" alt="Screenshot 2026-06-28 213423" src="https://github.com/user-attachments/assets/bdbb60ec-ef15-4348-a0b4-02ce70d17e0b" />
<img width="1862" height="901" alt="Screenshot 2026-06-28 213352" src="https://github.com/user-attachments/assets/646ab232-a634-4d7b-ac23-e9a8b281948d" />
<img width="1852" height="902" alt="Screenshot 2026-06-28 213341" src="https://github.com/user-attachments/assets/6fbe54b7-9575-4c3b-957f-d247ffc9069a" />
<img width="1860" height="891" alt="Screenshot 2026-06-28 213325" src="https://github.com/user-attachments/assets/626d2af3-1702-443f-a214-cc2499ac0873" />
<img width="1865" height="900" alt="Screenshot 2026-06-28 213301" src="https://github.com/user-attachments/assets/3ab67a26-c522-424c-925f-df27cb0290bc" />


GameVault je web aplikacija za kupovinu digitalnih igrica. Sajt ima katalog popularnih igara, filtere po zanru, platformi i launcheru, korpu, wishlistu, checkout stranicu, login/register sistem i korisnicki dashboard.

Projekat je podeljen na dva glavna dela:

- `frontend` - React/Vite aplikacija za korisnicki interfejs
- `backend` - Node.js + Express.js server, API rute i JSON baza podataka

## Tehnologije

- HTML
- CSS
- JavaScript
- React
- Vite
- Axios
- Node.js
- Express.js
- JWT auth tokeni
- JSON kao lokalna baza podataka

## Funkcionalnosti

- Register i login korisnika
- Guest/gost ulazak bez pravljenja naloga
- JWT tokeni za zasticene rute
- Katalog sa 30 popularnih igara
- Filteri za zanr, platformu, launcher i cenu
- Price range do 200 EUR
- Paginacija
- Dark i light tema
- Smooth scroll i back-to-top dugme
- O nama stranica
- Kontakt stranica sa funkcionalnom formom
- Footer sa osnovnim linkovima
- Korpa sa promenom kolicine
- Posebna checkout stranica sa adresom i karticom
- Popusti na odredjene igre
- Wishlist sistem
- Dashboard sa kupljenim igrama, kolicinama i porudzbinama
- Posebna Moja biblioteka stranica
- Posebna Admin / Korisnici stranica
- MVC-style user management za dodavanje, editovanje i brisanje korisnika preko admin stranice
- Korisnici se cuvaju u posebnom `users.json` fajlu
- Kontakt poruke se cuvaju u `messages.json` fajlu

## Struktura projekta

```text
backend/
  .env.example
  db.json
  messages.json
  users.json
  server.js
  mvc/
    controllers/
    models/

frontend/
  index.html
  package.json
  vite.config.js
  src/
    components/
    context/
    pages/
    router/
    lib/
    App.jsx
    main.jsx
    styles.css
```

## Pokretanje projekta

Prvo instalirati backend pakete:

```powershell
cd backend
npm install
```

Zatim instalirati frontend pakete:

```powershell
cd frontend
npm install
```

Backend se pokrece iz `backend` foldera:

```powershell
cd backend
npm start
```

Frontend se pokrece u drugom terminalu:

```powershell
cd frontend
npm run dev
```

Nakon toga sajt je dostupan na:

```text
http://127.0.0.1:5173
```

Backend API radi na:

```text
http://localhost:5000
```

## Test podaci

Za test placanje moze se koristiti:

```text
Broj kartice: 4242 4242 4242 4242
Datum isteka: 12/30
CVC: 123
```

Postoji i admin nalog:

```text
Email: admin@gamevault.test
Lozinka: admin123
```

## Napomena

Ovo je demo projekat. Placanje nije pravo, vec je napravljeno kao simulacija checkout procesa. JSON fajlovi (`db.json`, `users.json` i `messages.json`) predstavljaju lokalnu bazu, pa se promene korisnika, porudzbina i kontakt poruka cuvaju direktno u tim fajlovima.

JWT tokeni se cuvaju u browser `localStorage` kao `gamevault_token`, a backend ih proverava preko `JWT_SECRET` vrednosti. Za lokalni rad postoji podrazumevani secret, dok se za deployment preporucuje podesavanje sopstvene environment varijable `JWT_SECRET`.
