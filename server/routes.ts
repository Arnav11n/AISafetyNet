import express, { type Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { RealityDefender } from "@realitydefender/realitydefender";
import fs from "fs";
import path from "path";
import os from "os";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import { registerChatRoutes } from "./replit_integrations/chat/routes"; // Updated import path
import { insertDetectionHistorySchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // 1. Setup Auth (Passport/Session)
  setupAuth(app);

  // 2. Setup Chat (Gemini)
  registerChatRoutes(app);

  // 3. Game Score Route
  app.post(api.game.submitScore.path, async (req, res) => {
    try {
      const input = api.game.submitScore.input.parse(req.body);
      const score = await storage.createGameScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.game.getLeaderboard.path, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  // 4. Radar Routes
  app.post(api.radar.submitReport.path, async (req, res) => {
    try {
      const input = api.radar.submitReport.input.parse(req.body);
      const report = await storage.createScamReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.radar.getStats.path, async (req, res) => {
    const [scamTypes, recentReports] = await Promise.all([
      storage.getScamTypeStats(),
      storage.getRecentScamReports(100),
    ]);
    res.json({ scamTypes, recentReports });
  });

  // Game Questions API
  app.get("/api/game/questions", async (req, res) => {
    try {
      const { theme } = req.query;
      if (!theme) return res.status(400).json({ error: "Theme is required" });
      const questions = await storage.getQuestionsByTheme(theme as string);

      // Randomly select 5 questions
      const shuffled = questions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      res.json(selected);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Safety Routes
  app.get("/api/safety/effects", async (req, res) => {
    const effects = await storage.getSafetyEffects();
    res.json(effects);
  });

  app.get("/api/mental-effects", async (req, res) => {
    const effects = await storage.getMentalEffects();
    res.json(effects);
  });

  app.get("/api/safety/stories", async (req, res) => {
    const stories = await storage.getRealStories();
    res.json(stories);
  });

  // 5. Detection Route (Using Official Reality Defender SDK)
  app.post(
    api.detection.analyze.path,
    upload.single("file"),
    async (req, res) => {
      let tempPath = "";
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const apiKey = process.env.REALITY_DEFENDER_API_KEY;
        if (!apiKey) {
          // If no key, return dummy response for testing
          return res.json({
             isDeepfake: false,
             confidence: 95,
             analysis: "Reality Defender Key Missing - Simulation Mode",
             type: "real"
          });
        }

        // Initialize the official SDK
        const realityDefender = new RealityDefender({
          apiKey: apiKey,
        });

        // Write buffer to a temporary file
        tempPath = path.join(
          os.tmpdir(),
          `rd_${Date.now()}_${req.file.originalname}`,
        );
        fs.writeFileSync(tempPath, req.file.buffer);

        console.log(
          "Detecting media with Reality Defender SDK:",
          req.file.originalname,
        );
        const result = await realityDefender.detect({
          filePath: tempPath,
        });

        console.log("Detection successful:", result);

        res.json({
          ...result,
          isDeepfake: (result.score || 0) > 0.5,
          confidence: Math.round((result.score || 0) * 100),
          analysis: JSON.stringify(result, null, 2),
          type: "real",
        });
      } catch (err: any) {
        console.error("Reality Defender SDK Error:", err);
        res.status(500).json({
          message: "Detection analysis failed",
          error: err.message,
        });
      } finally {
        if (tempPath && fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (e) {}
        }
      }
    },
  );

  app.post("/api/detection/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const user = req.user as any;
      const input = insertDetectionHistorySchema.parse({
        ...req.body,
        userId: user.id,
      });
      const record = await storage.createDetectionRecord(input);
      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get(api.detection.history.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    const history = await storage.getUserDetectionHistory(user.id);
    res.json(history);
  });

  return httpServer;
}