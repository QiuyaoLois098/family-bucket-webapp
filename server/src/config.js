import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(rootDir, ".env"), override: true });
dotenv.config({ path: path.join(__dirname, "../.env") });

export const config = {
  port: Number(process.env.PORT || 3002),
  rootDir,
  generatedDir: path.join(__dirname, "../generated"),
  clientDist: path.join(rootDir, "client/dist"),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  textModel: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
  imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  imageSize: process.env.OPENAI_IMAGE_SIZE || "1024x1536",
  inactivityTimeoutMs: Number(process.env.INACTIVITY_TIMEOUT_MS || 120000),
  revealHoldMs: Number(process.env.REVEAL_HOLD_MS || 4000),
  openaiTimeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 45000),
  memorySlideMs: Number(process.env.MEMORY_SLIDE_MS || 7000),
};
