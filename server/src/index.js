import fs from "fs";
import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { bindHyperionActivityIo } from "./hyperionActivity.js";
import { bindHyperionIo } from "./hyperionHeartbeat.js";
import { registerRoutes, registerSockets } from "./routes.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] },
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/generated", express.static(config.generatedDir));
app.use("/images", express.static(path.join(config.rootDir, "client/public/images")));

registerRoutes(app);
registerSockets(io);

if (fs.existsSync(config.clientDist)) {
  app.use(express.static(config.clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io") || req.path.startsWith("/generated")) {
      next();
      return;
    }
    res.sendFile(path.join(config.clientDist, "index.html"));
  });
}

server.listen(config.port, () => {
  console.log(`Family Bucket List server listening on http://localhost:${config.port}`);
  console.log(`Screen A (control):  http://localhost:${config.port}/control`);
  console.log(`Screen B (display):  http://localhost:${config.port}/display`);
  console.log(`Expedia left:        http://localhost:${config.port}/expedia-left`);
  console.log(`Expedia right:       http://localhost:${config.port}/expedia-right`);
  console.log(`Vrbo v2 combined:    http://localhost:${config.port}/vrbo-v2`);
  console.log(`Vrbo left (chat):    http://localhost:${config.port}/vrbo-left`);
  console.log(`Vrbo right (search): http://localhost:${config.port}/vrbo-right`);
  console.log(`Vrbo iPhone 1:       http://localhost:${config.port}/vrbo-ip1`);
  console.log(`Vrbo iPhone 2:       http://localhost:${config.port}/vrbo-ip2`);
  console.log(`Vrbo iPhone 3:       http://localhost:${config.port}/vrbo-ip3`);
  if (!config.openaiApiKey) {
    console.warn("OPENAI_API_KEY is not set - using local fallback images and itineraries.");
  }
  bindHyperionIo(io);
  bindHyperionActivityIo(io);
  if (!config.hyperionLoggingEnabled) {
    console.warn("[hyperion] logging OFF — set HYPERION_LOGGING=1 or flip config.hyperionLoggingEnabled");
  } else if (!config.hyperionApi) {
    console.warn("[hyperion] HYPERION_API not set — screen heartbeats will fail until set");
  } else {
    console.log("[hyperion] ready — screens POST /api/hyperion/heartbeat (every 90s while open)");
  }
});
