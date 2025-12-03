import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptCounts = await storage.getAttemptCounts(userId);
      res.json(attemptCounts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.post("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { questionId, selectedAnswer, isCorrect, timeSpent } = req.body;
      
      const attempt = await storage.saveQuestionAttempt({
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpent,
      });
      
      res.json(attempt);
    } catch (error) {
      console.error("Error saving attempt:", error);
      res.status(500).json({ message: "Failed to save attempt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
