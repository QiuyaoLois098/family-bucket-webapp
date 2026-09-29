import { session } from "./session.js";
import { generateDestinationImage, generateItinerary } from "./openaiService.js";
import { config } from "./config.js";
import { DESTINATIONS } from "../../shared/destinations.js";
import { QUESTIONS } from "../../shared/questions.js";

export function registerRoutes(app) {
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      hasOpenAiKey: Boolean(config.openaiApiKey),
      textModel: config.textModel,
      imageModel: config.imageModel,
    });
  });

  app.get("/api/state", (_req, res) => {
    res.json(session.snapshot());
  });

  app.get("/api/content", (_req, res) => {
    res.json({
      destinations: DESTINATIONS,
      questions: QUESTIONS,
      memorySlideMs: config.memorySlideMs,
      inactivityTimeoutMs: config.inactivityTimeoutMs,
    });
  });

  app.post("/api/generate-image", async (req, res) => {
    const destination = req.body?.destination || session.state.destination;
    const answers = req.body?.answers || session.state.answers;
    if (!destination) {
      res.status(400).json({ ok: false, error: "destination is required" });
      return;
    }
    const result = await generateDestinationImage({ destination, answers });
    res.status(result.ok ? 200 : 200).json(result);
  });

  app.post("/api/generate-itinerary", async (req, res) => {
    const destination = req.body?.destination || session.state.destination;
    const answers = req.body?.answers || session.state.answers;
    if (!destination) {
      res.status(400).json({ ok: false, error: "destination is required" });
      return;
    }
    const result = await generateItinerary({ destination, answers });
    res.status(200).json(result);
  });
}

export function registerSockets(io) {
  io.on("connection", (socket) => {
    socket.on("session:join", () => {
      session.reset("page-load");
    });

    socket.on("experience:begin", () => session.begin());
    socket.on("experience:selectDestination", (payload) => {
      session.selectDestination(payload?.destinationId);
    });
    socket.on("experience:answer", (payload) => {
      session.answerQuestion(payload?.questionIndex, payload?.answerId, false, {
        advance: payload?.advance !== false,
      });
    });
    socket.on("experience:back", () => session.goBack());
    socket.on("experience:shake", () => session.shake());
    socket.on("experience:reset", () => session.reset("manual"));

    socket.on("debug:skip", () => session.debugSkip());
    socket.on("debug:simulateImage", () => session.debugSimulateImage());
    socket.on("debug:simulateItinerary", () => session.debugSimulateItinerary());
    socket.on("debug:reset", () => session.reset("debug"));
  });

  session.on("state", (state) => {
    io.emit("session:state", state);
  });
}
