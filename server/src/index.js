import fs from "fs";
import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
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
  if (!config.openaiApiKey) {
    console.warn("OPENAI_API_KEY is not set - using local fallback images and itineraries.");
  }
});
