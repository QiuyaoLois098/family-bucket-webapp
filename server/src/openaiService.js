import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import OpenAI from "openai";
import { config } from "./config.js";
import { buildImagePrompt, buildItineraryPrompt, validateItinerary } from "./itinerary.js";
import { getDestination } from "../../shared/destinations.js";

let client = null;

function getClient() {
  if (!config.openaiApiKey) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: config.openaiApiKey,
      timeout: config.openaiTimeoutMs,
    });
  }
  return client;
}

function sizeForModel(model, requested) {
  if (model.startsWith("dall-e-3")) {
    if (["1024x1024", "1792x1024", "1024x1792"].includes(requested)) return requested;
    return "1024x1792";
  }
  return requested;
}

async function savePng(buffer) {
  await fs.mkdir(config.generatedDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.png`;
  await fs.writeFile(path.join(config.generatedDir, filename), buffer);
  return `/generated/${filename}`;
}

async function bufferFromRemote(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function generateDestinationImage({ destination, answers }) {
  const dest = getDestination(destination);
  const fallbackUrl = dest?.image || null;
  const openai = getClient();

  if (!openai) {
    return { ok: false, imageUrl: fallbackUrl, source: "fallback", error: "Missing OPENAI_API_KEY" };
  }

  const prompt = buildImagePrompt({ destination, answers });

  try {
    const request = {
      model: config.imageModel,
      prompt,
      size: sizeForModel(config.imageModel, config.imageSize),
    };

    if (config.imageModel.startsWith("dall-e")) {
      request.n = 1;
      request.response_format = "url";
    }

    const result = await openai.images.generate(request, {
      timeout: config.openaiTimeoutMs,
    });

    const image = result.data?.[0];
    if (!image) throw new Error("Image response was empty");

    let buffer;
    if (image.b64_json) {
      buffer = Buffer.from(image.b64_json, "base64");
    } else if (image.url) {
      buffer = await bufferFromRemote(image.url);
    } else {
      throw new Error("No image payload on response");
    }

    const imageUrl = await savePng(buffer);
    return { ok: true, imageUrl, source: "openai" };
  } catch (error) {
    console.error("[openai] image generation failed:", error.message);
    return {
      ok: false,
      imageUrl: fallbackUrl,
      source: "fallback",
      error: error.message,
    };
  }
}

function parseModelJson(content) {
  if (!content) return null;
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function generateItinerary({ destination, answers }) {
  const dest = getDestination(destination);
  const fallback = dest?.fallbackItinerary || null;
  const openai = getClient();

  if (!openai) {
    return { ok: false, itinerary: fallback, source: "fallback", error: "Missing OPENAI_API_KEY" };
  }

  try {
    const completion = await openai.chat.completions.create(
      {
        model: config.textModel,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write structured JSON itineraries for a premium family travel installation. Never include markdown. Never describe people's appearance.",
          },
          {
            role: "user",
            content: buildItineraryPrompt({ destination, answers }),
          },
        ],
      },
      { timeout: Math.min(config.openaiTimeoutMs, 25000) },
    );

    const raw = parseModelJson(completion.choices?.[0]?.message?.content);
    const itinerary = validateItinerary(raw, dest);
    if (!itinerary) {
      throw new Error("Itinerary JSON failed validation");
    }

    return { ok: true, itinerary, source: "openai" };
  } catch (error) {
    console.error("[openai] itinerary generation failed:", error.message);
    return {
      ok: false,
      itinerary: fallback,
      source: "fallback",
      error: error.message,
    };
  }
}
