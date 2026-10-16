import { QUESTIONS } from "../../shared/questions.js";
import { getDestination } from "../../shared/destinations.js";
import { getDestinationScript, getAnswer } from "../../shared/scripts/index.js";

const DEFAULT_DAY_COUNT = 5;

function dayLabel(index) {
  return `Day ${index + 1}`;
}

export function validateItinerary(raw, destination) {
  if (!raw || typeof raw !== "object") return null;

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : destination?.fallbackItinerary?.title;
  const subtitle =
    typeof raw.subtitle === "string" ? raw.subtitle.trim() : destination?.fallbackItinerary?.subtitle || "";
  const headline =
    typeof raw.headline === "string" && raw.headline.trim()
      ? raw.headline.trim()
      : destination?.fallbackItinerary?.headline || "";

  if (!title) return null;

  const incoming = Array.isArray(raw.moments) ? raw.moments : [];
  const fallbackMoments = destination?.fallbackItinerary?.moments || [];
  const count = Math.max(fallbackMoments.length || DEFAULT_DAY_COUNT, Math.min(incoming.length || 0, 5) || DEFAULT_DAY_COUNT);
  const dayCount = Math.min(Math.max(count, 4), 5);

  const moments = Array.from({ length: dayCount }, (_, index) => {
    const fromModel = incoming[index] && typeof incoming[index] === "object" ? incoming[index] : {};
    const fromFallback = fallbackMoments[index] || fallbackMoments[fallbackMoments.length - 1] || {};
    const momentTitle =
      (typeof fromModel.title === "string" && fromModel.title.trim()) ||
      fromFallback.title ||
      dayLabel(index);
    const description =
      (typeof fromModel.description === "string" && fromModel.description.trim()) ||
      fromFallback.description ||
      "";

    return {
      time: dayLabel(index),
      title: momentTitle,
      description,
    };
  });

  if (moments.some((moment) => !moment.title || !moment.description)) return null;

  return { title, subtitle, headline, moments };
}

export function buildImagePrompt({ destination, answers }) {
  const dest = getDestination(destination);
  const base =
    dest?.imagePromptBase ||
    "Cinematic premium travel photography of an aspirational destination. Editorial, photorealistic, no people, no text.";

  const script = getDestinationScript(destination);
  const hints = answers
    .map((answerId, index) => {
      if (script) {
        const answer = getAnswer(script, answerId);
        return answer?.text || answer?.subtitle;
      }
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
  const script = getDestinationScript(destination);
  const answerLines = answers
    .map((answerId, index) => {
      if (script) {
        const answer = getAnswer(script, answerId);
        return answer?.text || answerId;
      }
      const question = QUESTIONS[index];
      const option = question?.options.find((item) => item.id === answerId);
      return `${question?.prompt || ""} ${option?.label || answerId}`;
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
  "headline": "short serif headline for the itinerary screen, 4-7 words, warm and specific to the answers",
  "moments": [
    { "title": "short title", "description": "2 sentences, sensory, specific, family-friendly pace" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ]
}

Rules:
- Exactly 5 day moments in order (Day 1 through Day 5).
- Warm, editorial travel writing. No marketing clichés like "hidden gem" overuse.
- Do not describe what the family looks like.
- Keep titles to 2-4 words.
- Descriptions should be one short sentence, about 8-14 words.`;
}
