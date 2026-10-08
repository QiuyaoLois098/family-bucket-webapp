import fs from "fs";
import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { bindHyperionIo } from "./hyperionLogging.js";
import { registerRoutes, registerSockets } from "./routes.js";
import { startUdpBridge } from "./udpBridge.js";

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
startUdpBridge(io, { port: Number(process.env.UDP_PORT || 41234) });

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
  console.log(`Vrbo v2 combined:    http://localhost:${config.port}/vrbo-v2`);
  console.log(`Vrbo left (chat):    http://localhost:${config.port}/vrbo-left`);
  console.log(`Vrbo right (search): http://localhost:${config.port}/vrbo-right`);
  console.log(`Vrbo iPhone 1:       http://localhost:${config.port}/vrbo-ip1`);
  console.log(`Vrbo iPhone 2:       http://localhost:${config.port}/vrbo-ip2`);
  console.log(`Vrbo iPhone 3:       http://localhost:${config.port}/vrbo-ip3`);
  console.log(`UDP monitor:         http://localhost:${config.port}/udp`);
  if (!config.openaiApiKey) {
    console.warn("OPENAI_API_KEY is not set - using local fallback images and itineraries.");
  }
  bindHyperionIo(io);
  if (!config.hyperionApi) {
    console.warn("[hyperion] HYPERION_API not set — screen heartbeats will fail until set");
  } else {
    console.log("[hyperion] ready — screens POST /api/hyperion/heartbeat (every 90s while open)");
  }
});
