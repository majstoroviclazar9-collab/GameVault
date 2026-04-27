const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const usersPath = path.join(__dirname, "..", "..", "users.json");

async function readUsersFile() {
  return JSON.parse(await fs.readFile(usersPath, "utf8"));
}

async function writeUsersFile(data) {
  await fs.writeFile(usersPath, JSON.stringify(data, null, 2));
}

function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(`${salt}:${password}`)
    .digest("hex");
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isGuest: Boolean(user.isGuest),
    createdAt: user.createdAt,
  };
}

async function listUsers() {
  const data = await readUsersFile();
  return data.users || [];
}

async function findById(id) {
  const users = await listUsers();
  return users.find((user) => user.id === id) || null;
}

async function findByEmail(email) {
  const users = await listUsers();
  return users.find((user) => user.email === email) || null;
}

async function createUser({ name, email, password, role = "user" }) {
  const data = await readUsersFile();
  const users = data.users || [];
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error("Email je već registrovan.");
    error.status = 409;
    throw error;
  }

  const salt = crypto.randomBytes(12).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    name: String(name || "").trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(String(password || ""), salt),
    salt,
    role: role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsersFile({ users });
  return user;
}

async function updateUser(id, changes) {
  const data = await readUsersFile();
  const users = data.users || [];
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    const error = new Error("Korisnik nije pronađen.");
    error.status = 404;
    throw error;
  }

  const nextEmail = String(changes.email || "")
    .trim()
    .toLowerCase();
  if (users.some((user) => user.email === nextEmail && user.id !== id)) {
    const error = new Error("Email je već registrovan.");
    error.status = 409;
    throw error;
  }

  const nextUser = {
    ...users[index],
    name: String(changes.name || "").trim(),
    email: nextEmail,
    role: changes.role === "admin" ? "admin" : "user",
  };

  if (changes.password) {
    const salt = crypto.randomBytes(12).toString("hex");
    nextUser.salt = salt;
    nextUser.passwordHash = hashPassword(String(changes.password), salt);
  }

  users[index] = nextUser;
  await writeUsersFile({ users });
  return nextUser;
}

async function deleteUser(id) {
  const data = await readUsersFile();
  const users = data.users || [];
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    const error = new Error("Korisnik nije pronadjen.");
    error.status = 404;
    throw error;
  }

  const [deletedUser] = users.splice(index, 1);
  await writeUsersFile({ users });
  return deletedUser;
}

async function verifyUser(email, password) {
  const user = await findByEmail(
    String(email || "")
      .trim()
      .toLowerCase(),
  );
  if (
    !user ||
    hashPassword(String(password || ""), user.salt) !== user.passwordHash
  ) {
    return null;
  }
  return user;
}

module.exports = {
  createUser,
  deleteUser,
  findById,
  findByEmail,
  listUsers,
  publicUser,
  updateUser,
  verifyUser,
};
