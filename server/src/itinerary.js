import { QUESTIONS } from "../../shared/questions.js";
import { getDestination } from "../../shared/destinations.js";

const MOMENT_TIMES = ["Morning", "Afternoon", "Sunset", "Evening"];

export function validateItinerary(raw, destination) {
  if (!raw || typeof raw !== "object") return null;

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : destination?.fallbackItinerary?.title;
  const subtitle =
    typeof raw.subtitle === "string" ? raw.subtitle.trim() : destination?.fallbackItinerary?.subtitle || "";

  if (!title) return null;

  const incoming = Array.isArray(raw.moments) ? raw.moments : [];
  const fallbackMoments = destination?.fallbackItinerary?.moments || [];

  const moments = MOMENT_TIMES.map((time, index) => {
    const fromModel = incoming[index] && typeof incoming[index] === "object" ? incoming[index] : {};
    const fromFallback = fallbackMoments[index] || {};
    const momentTitle =
      (typeof fromModel.title === "string" && fromModel.title.trim()) ||
      fromFallback.title ||
      time;
    const description =
      (typeof fromModel.description === "string" && fromModel.description.trim()) ||
      fromFallback.description ||
      "";
    const momentTime =
      (typeof fromModel.time === "string" && fromModel.time.trim()) || fromFallback.time || time;

    return {
      time: momentTime,
      title: momentTitle,
      description,
    };
  });

  if (moments.some((moment) => !moment.title || !moment.description)) return null;

  return { title, subtitle, moments };
}

export function buildImagePrompt({ destination, answers }) {
  const dest = getDestination(destination);
  const base =
    dest?.imagePromptBase ||
    "Cinematic premium travel photography of an aspirational destination. Editorial, photorealistic, no people, no text.";

  const hints = answers
    .map((answerId, index) => {
      const question = QUESTIONS[index];
      const option = question?.options.find((item) => item.id === answerId);
      return option?.promptHint;
    })
    .filter(Boolean);

  const extra = hints.length
    ? ` Mood and scene direction: ${hints.join("; ")}.`
    : "";

  return `${base}${extra}

Style: premium travel photography, cinematic, aspirational, editorial, Expedia campaign quality.
Composition: vertical portrait 9:16, rich color grading, shallow depth of field where appropriate.
Subject: scenery, places, food, objects, atmosphere, architecture, nature.
Do NOT include: identifiable people, family portraits, faces, text, captions, watermarks, logos, UI.`;
}

export function buildItineraryPrompt({ destination, answers }) {
  const dest = getDestination(destination);
  const answerLines = answers
    .map((answerId, index) => {
      const question = QUESTIONS[index];
      const option = question?.options.find((item) => item.id === answerId);
      return `${question.prompt} ${option?.label || answerId}`;
    })
    .join("\n");

  return `Create a short, beautiful family travel itinerary as JSON only.

Destination: ${dest?.title || destination}
Location: ${dest?.location || ""}

Guest answers:
${answerLines}

Return JSON with this exact shape:
{
  "title": "Your Family Escape to ...",
  "subtitle": "one lyrical sentence",
  "moments": [
    { "time": "Morning", "title": "short title", "description": "2 sentences, sensory, specific, no people described physically" },
    { "time": "Afternoon", "title": "...", "description": "..." },
    { "time": "Sunset", "title": "...", "description": "..." },
    { "time": "Evening", "title": "...", "description": "..." }
  ]
}

Rules:
- Exactly 4 moments with those times.
- Warm, editorial travel writing. No marketing clichés like "hidden gem" overuse.
- Do not describe what the family looks like.
- Keep titles to 2–5 words.`;
}
