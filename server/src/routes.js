import { session } from "./session.js";
import { vrboV2Session } from "./vrboV2Session.js";
import { generateDestinationImage, generateItinerary } from "./openaiService.js";
import { config } from "./config.js";
import { DESTINATIONS } from "../../shared/destinations.js";
import { QUESTIONS } from "../../shared/questions.js";
import { clearHyperionActivity, getHyperionActivity } from "./hyperionActivity.js";
import { forwardHeartbeatForPath, resolveHyperionDevice } from "./hyperionHeartbeat.js";

export function registerRoutes(app) {
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      hasOpenAiKey: Boolean(config.openaiApiKey),
      textModel: config.textModel,
      imageModel: config.imageModel,
    });
  });

  /** Client screen heartbeat → Hyperion hardware DEVICE_ID */
  app.post("/api/hyperion/heartbeat", async (req, res) => {
    const path = req.body?.path;
    if (!path || typeof path !== "string") {
      res.status(400).json({ ok: false, error: "path is required" });
      return;
    }

    const device = resolveHyperionDevice(path);
    if (!device) {
      res.status(404).json({ ok: false, error: `no Hyperion device for path ${path}`, path });
      return;
    }

    const result = await forwardHeartbeatForPath(path);
    if (
      result.skipped &&
      (result.error === "HYPERION_API not set" ||
        result.error === "Hyperion logging disabled")
    ) {
      res.status(503).json({ ...result, path });
      return;
    }

    res.status(200).json({
      ok: Boolean(result.ok),
      status: result.status,
      error: result.error ?? null,
      path,
      deviceId: result.deviceId ?? device.id,
      deviceLabel: result.deviceLabel ?? device.label,
      healthStatus: result.healthStatus ?? null,
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
    socket.on("hyperion:subscribe", () => {
      socket.emit("hyperion:activity:list", getHyperionActivity());
    });
    socket.on("hyperion:clear", () => {
      clearHyperionActivity();
    });

    socket.on("session:join", () => {
      // Don't wipe session on reconnect/HMR — only sync state (use experience:reset to go home).
      socket.emit("session:state", session.snapshot());
    });
    socket.on("session:subscribe", () => {
      socket.emit("session:state", session.snapshot());
    });

    socket.on("experience:begin", () => session.begin());
    socket.on("experience:sessionStart", () => session.startHyperionSession());
    socket.on("experience:selectDestination", (payload) => {
      session.selectDestination(payload?.destinationId);
    });
    socket.on("experience:beginQuestions", () => session.beginQuestions());
    socket.on("experience:answer", (payload) => {
      const questionRef = payload?.questionId ?? payload?.questionIndex;
      session.answerQuestion(questionRef, payload?.answerId, false, {
        advance: payload?.advance !== false,
      });
    });
    socket.on("experience:back", () => session.goBack());
    socket.on("experience:shake", () => session.shake());
    socket.on("experience:reset", () => session.reset("manual"));

    socket.on("debug:skip", () => session.debugSkip());
    socket.on("debug:simulateImage", () => session.debugSimulateImage());
    socket.on("debug:simulateItinerary", () => session.debugSimulateItinerary());
    socket.on("debug:jump", (payload) => session.debugJump(payload?.target));
    socket.on("debug:reset", () => session.reset("debug"));

    socket.on("vrbo-v2:join", () => {
      // Page load / refresh restarts the shared experience (same as Family Bucket).
      vrboV2Session.reset("page-load");
    });
    socket.on("vrbo-v2:subscribe", () => {
      // BA / remote clients: sync state without restarting.
      socket.emit("vrbo-v2:state", vrboV2Session.snapshot());
    });
    // Any tap/typing only refreshes the idle clock; the Hyperion session starts on the first Join.
    socket.on("vrbo-v2:sessionStart", () => vrboV2Session.noteActivity());
    socket.on("vrbo-v2:joinGuest", (payload) => {
      vrboV2Session.joinGuest(payload?.userId, payload?.displayName);
    });
    socket.on("vrbo-v2:togglePreference", (payload) => {
      vrboV2Session.togglePreference(payload?.userId, payload?.preferenceId);
    });
    socket.on("vrbo-v2:submitGuest", (payload) => {
      vrboV2Session.submitGuest(payload?.userId);
    });
    socket.on("vrbo-v2:searchStays", () => vrboV2Session.searchStays());
    socket.on("vrbo-v2:previewProperty", (payload) => {
      vrboV2Session.previewProperty(payload?.propertyId);
    });
    socket.on("vrbo-v2:selectProperty", (payload) => {
      vrboV2Session.selectProperty(payload?.propertyId);
    });
    socket.on("vrbo-v2:reset", () => vrboV2Session.reset("manual"));

    // Hyperion VGC: a device page (/vrbo-left, /vrbo-right, /vrbo-ip1..3) announces which device it is.
    socket.on("vgc:device", (payload) => {
      vrboV2Session.registerDevice(socket.id, payload?.device ?? null);
    });
    socket.on("vgc:error", (payload) => {
      vrboV2Session.reportDeviceError(socket.id, payload);
    });
    socket.on("disconnect", () => {
      vrboV2Session.unregisterDevice(socket.id);
    });
  });

  session.on("state", (state) => {
    io.emit("session:state", state);
  });

  vrboV2Session.on("state", (state) => {
    io.emit("vrbo-v2:state", state);
  });
}
