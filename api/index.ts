import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { autoMigrateOnStartup } from "../server/migrate-old-data";

const app = express();

app.use(express.json({
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

let isInitialized = false;

async function initializeApp() {
  if (!isInitialized) {
    await registerRoutes(app);
    
    // Skip auto-migration in production/Vercel to avoid cold start delays
    // Run migrations manually or via a separate process
    if (process.env.NODE_ENV !== 'production') {
      try {
        await autoMigrateOnStartup();
      } catch (error) {
        console.error("Failed to run auto migration:", error);
      }
    }
    
    isInitialized = true;
  }
}

export default async function handler(req: Request, res: Response) {
  await initializeApp();
  return app(req, res);
}
