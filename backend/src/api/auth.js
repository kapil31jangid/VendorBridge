import express from "express";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../auth/jwt.js";
import { createUser, findUserByEmail, findUserById } from "../data/repository.js";
import { requireAuth } from "../middleware/auth.js";
import { sanitizeUser } from "../store.js";

export const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await findUserByEmail(email);
  const passwordHash = user?.password_hash;
  const passwordMatches = passwordHash
    ? await bcrypt.compare(password, passwordHash)
    : user?.password === password;

  if (!user || !passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const safeUser = sanitizeUser(user);
  const token = signAccessToken(safeUser);

  res.json({ user: safeUser, token });
});

authRouter.post("/register", async (req, res) => {
  const payload = req.body || {};
  if (!payload.first_name || !payload.email || !payload.role) {
    return res.status(400).json({ error: "first_name, email, and role are required." });
  }

  const createdUser = await createUser(payload);
  const safeUser = sanitizeUser(createdUser);
  const token = signAccessToken(safeUser);
  res.status(201).json({ user: safeUser, token });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.auth.sub);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json({ user: sanitizeUser(user) });
});
