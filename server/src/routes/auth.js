import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials };
}

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !user.active || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, async (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
