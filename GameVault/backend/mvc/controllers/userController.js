const userModel = require("../models/userModel");

function validateUserInput(body, mode) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const role = body.role === "admin" ? "admin" : "user";

  if (name.length < 2) return { error: "Ime mora imati bar 2 karaktera." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Email nije validan." };
  if (mode === "create" && password.length < 6)
    return { error: "Lozinka mora imati bar 6 karaktera." };
  if (mode === "update" && password && password.length < 6)
    return { error: "Nova lozinka mora imati bar 6 karaktera." };

  return {
    value: {
      name,
      email,
      password,
      role,
    },
  };
}

async function handleUsers(req, res, url, context) {
  const currentUser = await context.requireUser(req, res);
  if (!currentUser) return true;
  if (currentUser.role !== "admin") {
    context.sendError(res, 403, "Samo admin moze da upravlja korisnicima.");
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/users") {
    const users = await userModel.listUsers();
    context.send(res, 200, { users: users.map(userModel.publicUser) });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/users") {
    const body = await context.getBody(req);
    const validated = validateUserInput(body, "create");
    if (validated.error) {
      context.sendError(res, 400, validated.error);
      return true;
    }

    try {
      const user = await userModel.createUser(validated.value);
      context.send(res, 201, { user: userModel.publicUser(user) });
    } catch (error) {
      context.sendError(res, error.status || 500, error.message);
    }
    return true;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/users/")) {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const body = await context.getBody(req);
    const validated = validateUserInput(body, "update");
    if (validated.error) {
      context.sendError(res, 400, validated.error);
      return true;
    }

    try {
      const user = await userModel.updateUser(id, validated.value);
      context.send(res, 200, { user: userModel.publicUser(user) });
    } catch (error) {
      context.sendError(res, error.status || 500, error.message);
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/users/")) {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    if (id === currentUser.id) {
      context.sendError(
        res,
        400,
        "Ne mozete obrisati svoj trenutno ulogovan nalog.",
      );
      return true;
    }

    try {
      const user = await userModel.deleteUser(id);
      context.send(res, 200, {
        user: userModel.publicUser(user),
        message: "Korisnik je obrisan.",
      });
    } catch (error) {
      context.sendError(res, error.status || 500, error.message);
    }
    return true;
  }

  return false;
}

module.exports = {
  handleUsers,
};
