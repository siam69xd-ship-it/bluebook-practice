import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "nextprep-secret-key-2024",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      const code = await storage.createVerificationCode(email);
      
      console.log(`[EMAIL CODE] Verification code for ${email}: ${code}`);
      
      res.json({ success: true, message: "Verification code sent to your email" });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/verify-code", async (req, res) => {
    try {
      const { email, code, password, isSignUp } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and code are required" });
      }

      const isValid = await storage.verifyCode(email, code);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      let user = await storage.getUserByEmail(email);

      if (isSignUp) {
        if (user) {
          return res.status(400).json({ message: "User already exists. Please sign in instead." });
        }
        if (!password || password.length < 6) {
          return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        user = await storage.createUser(email, password);
      } else {
        if (!user) {
          return res.status(400).json({ message: "User not found. Please sign up first." });
        }
      }

      req.session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const attemptCounts = await storage.getAttemptCounts(userId);
      res.json(attemptCounts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.post("/api/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
