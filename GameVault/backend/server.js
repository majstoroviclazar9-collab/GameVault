const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");
const userModel = require("./mvc/models/userModel");
const userController = require("./mvc/controllers/userController");

const PORT = process.env.PORT || 5000;
const dbPath = path.join(__dirname, "db.json");
const messagesPath = path.join(__dirname, "messages.json");
const frontendPath = path.join(__dirname, "..", "frontend");
const JWT_SECRET =
  process.env.JWT_SECRET || "gamevault-local-jwt-secret-change-me";
const JWT_TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS || 60 * 60 * 24 * 7);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(
  res,
  status,
  data,
  contentType = "application/json; charset=utf-8",
) {
  if (res.headersSent) return;
  res.status(status);
  res.set({
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  if (contentType.includes("application/json")) {
    res.json(data);
    return;
  }
  res.send(data);
}

function sendError(res, status, message) {
  send(res, status, { error: message });
}

async function readDb() {
  return JSON.parse(await fs.readFile(dbPath, "utf8"));
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

async function readMessages() {
  return JSON.parse(await fs.readFile(messagesPath, "utf8"));
}

async function writeMessages(data) {
  await fs.writeFile(messagesPath, JSON.stringify(data, null, 2));
}

function gamePrice(game) {
  const originalPrice = Number(game.price || 0);
  const discountPercent = Math.max(
    0,
    Math.min(Number(game.discountPercent || 0), 95),
  );
  if (!discountPercent) return Number(originalPrice.toFixed(2));
  return Number((originalPrice * (1 - discountPercent / 100)).toFixed(2));
}

function decorateGame(game) {
  const originalPrice = Number(game.price || 0);
  const discountPercent = Math.max(
    0,
    Math.min(Number(game.discountPercent || 0), 95),
  );
  return {
    ...game,
    originalPrice,
    discountPercent,
    price: gamePrice(game),
  };
}

function createGuestUser() {
  const id = `guest_${crypto.randomBytes(8).toString("hex")}`;
  return {
    id,
    name: "Gost korisnik",
    email: `${id}@guest.local`,
    role: "guest",
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function signJwt(payload) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const signature = base64Url(
    crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest(),
  );
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = base64Url(
    crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest(),
  );
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    actual.length !== expected.length ||
    !crypto.timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(body));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function createToken(userId, sessionUser = null) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    role: sessionUser?.role || "user",
    isGuest: Boolean(sessionUser?.isGuest),
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };

  if (sessionUser?.isGuest) {
    payload.name = sessionUser.name;
    payload.email = sessionUser.email;
    payload.createdAt = sessionUser.createdAt;
  }

  return signJwt(payload);
}

async function getBody(req) {
  return req.body && typeof req.body === "object" ? req.body : {};
}

function getToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

async function requireUser(req, res) {
  const token = getToken(req);
  const payload = verifyJwt(token);

  if (!payload) {
    sendError(res, 401, "Morate biti ulogovani.");
    return null;
  }

  if (payload.isGuest) {
    return {
      id: payload.sub,
      name: payload.name || "Gost korisnik",
      email: payload.email || `${payload.sub}@guest.local`,
      role: "guest",
      isGuest: true,
      createdAt:
        payload.createdAt || new Date(payload.iat * 1000).toISOString(),
    };
  }

  const user = await userModel.findById(payload.sub);
  if (!user) {
    sendError(res, 401, "Sesija nije validna.");
    return null;
  }
  return user;
}

function sortGames(games, sort) {
  const list = [...games];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") list.sort((a, b) => b.rating - a.rating);
  if (sort === "newest") list.sort((a, b) => b.releaseYear - a.releaseYear);
  if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

function filterGames(games, params) {
  const search = (params.get("search") || "").trim().toLowerCase();
  const genre = params.get("genre") || "";
  const platform = params.get("platform") || "";
  const launcher = params.get("launcher") || "";
  const minPrice = Number(params.get("minPrice") || 0);
  const maxPrice = Number(params.get("maxPrice") || 200);
  const sort = params.get("sort") || "rating-desc";
  return sortGames(
    games.filter((game) => {
      const searchable =
        `${game.title} ${game.description} ${game.genres.join(" ")} ${game.platforms.join(" ")} ${game.launchers.join(" ")}`.toLowerCase();
      const matchesSearch = !search || searchable.includes(search);
      const matchesGenre = !genre || game.genres.includes(genre);
      const matchesPlatform = !platform || game.platforms.includes(platform);
      const matchesLauncher = !launcher || game.launchers.includes(launcher);
      const matchesPrice = game.price >= minPrice && game.price <= maxPrice;
      return (
        matchesSearch &&
        matchesGenre &&
        matchesPlatform &&
        matchesLauncher &&
        matchesPrice
      );
    }),
    sort,
  );
}

function uniqueSorted(items) {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b));
}

async function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const fullPath = path.normalize(path.join(frontendPath, safePath));
  if (!fullPath.startsWith(frontendPath)) {
    sendError(res, 403, "Zabranjen pristup.");
    return;
  }
  try {
    const data = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    send(res, 200, data, mimeTypes[ext] || "application/octet-stream");
  } catch {
    try {
      const data = await fs.readFile(path.join(frontendPath, "index.html"));
      send(res, 200, data, mimeTypes[".html"]);
    } catch {
      sendError(res, 404, "Fajl nije pronađen.");
    }
  }
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  const db = await readDb();
  const pathname = url.pathname;

  if (req.method === "POST" && pathname === "/api/contact") {
    const body = await getBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (name.length < 2) {
      sendError(res, 400, "Ime mora imati bar 2 karaktera.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendError(res, 400, "Email nije validan.");
      return;
    }
    if (subject.length < 3) {
      sendError(res, 400, "Naslov mora imati bar 3 karaktera.");
      return;
    }
    if (message.length < 10) {
      sendError(res, 400, "Poruka mora imati bar 10 karaktera.");
      return;
    }

    const data = await readMessages();
    const contactMessage = {
      id: `msg_${crypto.randomBytes(8).toString("hex")}`,
      name,
      email,
      subject,
      message,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    data.messages.push(contactMessage);
    await writeMessages(data);
    send(res, 201, { message: "Poruka je uspešno poslata.", contactMessage });
    return;
  }

  if (req.method === "GET" && pathname === "/api/filters") {
    send(res, 200, {
      genres: uniqueSorted(db.games.flatMap((game) => game.genres)),
      platforms: uniqueSorted(db.games.flatMap((game) => game.platforms)),
      launchers: uniqueSorted(db.games.flatMap((game) => game.launchers)),
      price: { min: 0, max: 200 },
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/games") {
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || 9), 1),
      30,
    );
    const filtered = filterGames(db.games.map(decorateGame), url.searchParams);
    const totalPages = Math.max(Math.ceil(filtered.length / limit), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    send(res, 200, {
      games: filtered.slice(start, start + limit),
      pagination: {
        page: safePage,
        limit,
        totalItems: filtered.length,
        totalPages,
      },
    });
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/games/")) {
    const id = decodeURIComponent(pathname.split("/").pop());
    const game = db.games.find((item) => item.id === id || item.slug === id);
    if (!game) {
      sendError(res, 404, "Igra nije pronađena.");
      return;
    }
    send(res, 200, { game: decorateGame(game) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/guest-login") {
    const user = createGuestUser();
    const token = createToken(user.id, user);
    send(res, 201, { token, user: userModel.publicUser(user) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/register") {
    const body = await getBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    if (name.length < 2) {
      sendError(res, 400, "Ime mora imati bar 2 karaktera.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendError(res, 400, "Email nije validan.");
      return;
    }
    if (password.length < 6) {
      sendError(res, 400, "Lozinka mora imati bar 6 karaktera.");
      return;
    }
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      sendError(res, 409, "Email je već registrovan.");
      return;
    }
    const user = await userModel.createUser({
      name,
      email,
      password,
      role: "user",
    });
    const token = createToken(user.id);
    send(res, 201, { token, user: userModel.publicUser(user) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await getBody(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const user = await userModel.verifyUser(email, password);
    if (!user) {
      sendError(res, 401, "Pogrešan email ili lozinka.");
      return;
    }
    const token = createToken(user.id);
    send(res, 200, { token, user: userModel.publicUser(user) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const user = await requireUser(req, res);
    if (!user) return;
    send(res, 200, { user: userModel.publicUser(user) });
    return;
  }

  if (pathname === "/api/users" || pathname.startsWith("/api/users/")) {
    const handled = await userController.handleUsers(req, res, url, {
      getBody,
      requireUser,
      send,
      sendError,
    });
    if (handled) return;
  }

  if (req.method === "GET" && pathname === "/api/orders") {
    const user = await requireUser(req, res);
    if (!user) return;
    const orders = db.orders
      .filter((order) => order.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    send(res, 200, { orders });
    return;
  }

  if (req.method === "GET" && pathname === "/api/dashboard") {
    const user = await requireUser(req, res);
    if (!user) return;
    const orders = db.orders
      .filter((order) => order.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const ownedGames = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = ownedGames.get(item.id) || {
          quantity: 0,
          purchasedTotal: 0,
        };
        ownedGames.set(item.id, {
          quantity: current.quantity + Number(item.quantity || 1),
          purchasedTotal: Number(
            (current.purchasedTotal + Number(item.subtotal || 0)).toFixed(2),
          ),
        });
      });
    });
    const library = [...ownedGames.entries()]
      .map(([id, ownership]) => {
        const game = db.games.find((entry) => entry.id === id);
        return game
          ? {
              ...decorateGame(game),
              ownedQuantity: ownership.quantity,
              purchasedTotal: ownership.purchasedTotal,
            }
          : null;
      })
      .filter(Boolean);
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOwnedQuantity = library.reduce(
      (sum, game) => sum + game.ownedQuantity,
      0,
    );
    const favoriteGenres = {};
    library.forEach((game) => {
      game.genres.forEach((genre) => {
        favoriteGenres[genre] =
          (favoriteGenres[genre] || 0) + game.ownedQuantity;
      });
    });
    send(res, 200, {
      user: userModel.publicUser(user),
      metrics: {
        orders: orders.length,
        gamesOwned: totalOwnedQuantity,
        uniqueGamesOwned: library.length,
        totalSpent,
        averageOrder: orders.length ? totalSpent / orders.length : 0,
      },
      favoriteGenres: Object.entries(favoriteGenres)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      library,
      recentOrders: orders.slice(0, 6).map((order) => ({
        ...order,
        itemCount: order.items.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        ),
      })),
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/checkout") {
    const user = await requireUser(req, res);
    if (!user) return;
    const body = await getBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const cardName = String(body.cardName || "").trim();
    const cardNumber = String(body.cardNumber || "").replace(/\s+/g, "");
    const exp = String(body.exp || "").trim();
    const cvc = String(body.cvc || "").trim();
    const address =
      body.address && typeof body.address === "object" ? body.address : {};
    const shippingAddress = {
      email: String(address.email || "").trim(),
      fullName: String(address.fullName || "").trim(),
      phone: String(address.phone || "").trim(),
      country: String(address.country || "").trim(),
      city: String(address.city || "").trim(),
      postalCode: String(address.postalCode || "").trim(),
      street: String(address.street || "").trim(),
      apartment: String(address.apartment || "").trim(),
    };
    if (!items.length) {
      sendError(res, 400, "Korpa je prazna.");
      return;
    }
    const addressErrors = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email))
      addressErrors.push("email");
    if (shippingAddress.fullName.length < 2)
      addressErrors.push("ime i prezime");
    if (shippingAddress.phone.replace(/\D/g, "").length < 6)
      addressErrors.push("telefon");
    if (shippingAddress.country.length < 2) addressErrors.push("država");
    if (shippingAddress.city.length < 2) addressErrors.push("grad");
    if (shippingAddress.postalCode.length < 3)
      addressErrors.push("poštanski broj");
    if (shippingAddress.street.length < 3) addressErrors.push("ulica i broj");
    if (addressErrors.length) {
      sendError(res, 400, `Proverite adresu: ${addressErrors.join(", ")}.`);
      return;
    }
    const expMatch = exp.match(/^(\d{2})\/(\d{2})$/);
    const expMonth = expMatch ? Number(expMatch[1]) : 0;
    if (
      cardName.length < 2 ||
      !/^\d{16}$/.test(cardNumber) ||
      !expMatch ||
      expMonth < 1 ||
      expMonth > 12 ||
      !/^\d{3}$/.test(cvc)
    ) {
      sendError(res, 400, "Podaci za plaćanje nisu validni.");
      return;
    }
    const orderItems = items
      .map((item) => {
        const sourceGame = db.games.find((entry) => entry.id === item.id);
        const game = sourceGame ? decorateGame(sourceGame) : null;
        if (!game) return null;
        const quantity = Math.min(Math.max(Number(item.quantity || 1), 1), 5);
        return {
          id: game.id,
          title: game.title,
          cover: game.cover,
          originalPrice: game.originalPrice,
          discountPercent: game.discountPercent,
          price: game.price,
          quantity,
          subtotal: Number((game.price * quantity).toFixed(2)),
        };
      })
      .filter(Boolean);
    if (!orderItems.length) {
      sendError(res, 400, "Nema validnih proizvoda u korpi.");
      return;
    }
    const total = Number(
      orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );
    const order = {
      id: `ord_${crypto.randomBytes(8).toString("hex")}`,
      userId: user.id,
      items: orderItems,
      total,
      currency: "EUR",
      status: "paid",
      shippingAddress,
      payment: {
        provider: "Kartično plaćanje",
        intentId: `pi_test_${crypto.randomBytes(10).toString("hex")}`,
        last4: cardNumber.slice(-4),
      },
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);
    await writeDb(db);
    send(res, 201, { order, message: "Kupovina je uspešno završena." });
    return;
  }

  sendError(res, 404, "API ruta nije pronađena.");
}

const app = express();
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    sendError(res, 400, "Neispravan JSON zahtev.");
    return;
  }
  next(error);
});

app.use("/api", async (req, res) => {
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    await handleApi(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || "Server greška.");
  }
});

app.use(express.static(frontendPath));

app.use(async (req, res) => {
  try {
    await serveStatic(req, res, req.path);
  } catch (error) {
    sendError(res, 500, error.message || "Server greska.");
  }
});

app.listen(PORT, () => {
  console.log(`GameVault radi na http://localhost:${PORT}`);
});
