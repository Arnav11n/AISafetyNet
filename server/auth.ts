import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import session from "express-session";
import type { Express } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { type User } from "@shared/schema";

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: { maxAge: sessionTtl, secure: false },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;

      // 1. Check if username exists
      if (await storage.getUserByUsername(username)) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // 2. Check if email exists (This is the fix)
      if (await storage.getUserByEmail(email)) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser({
        username,
        password: await bcrypt.hash(password, 10),
        email,
        firstName,
        lastName,
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.status(201).json(user);
      });
    } catch (err) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) =>
    res.json(req.user),
  );
  app.post("/api/logout", (req, res, next) =>
    req.logout((err) => (err ? next(err) : res.sendStatus(200))),
  );
  app.get("/api/user", (req, res) =>
    req.isAuthenticated() ? res.json(req.user) : res.sendStatus(401),
  );
}
