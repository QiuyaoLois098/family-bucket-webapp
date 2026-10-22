import { FEATURE_ORDER } from "./vrboStayCopy.js";

const DEFAULT_CONNECTORS = {
  sarah: "and",
  alex: "and",
  chris: "plus",
};

function orderIndex(featureId) {
  const index = FEATURE_ORDER.indexOf(featureId);
  return index === -1 ? FEATURE_ORDER.length : index;
}

function searchWording(featureId, copy) {
  return copy?.summary?.phrases?.[featureId] || featureId;
}

function joinAnd(items, oxford) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const head = items.slice(0, -1).join(", ");
  return oxford ? `${head}, and ${items.at(-1)}` : `${head} and ${items.at(-1)}`;
}

export function pickSharedPriorities(counts) {
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return orderIndex(a[0]) - orderIndex(b[0]);
    })
    .map(([id]) => id);
}

export function pickRemainingPriorities(counts, sharedIds = []) {
  const shared = new Set(sharedIds);
  return [...counts.keys()]
    .filter((id) => !shared.has(id) && (counts.get(id) ?? 0) > 0)
    .sort((a, b) => orderIndex(a) - orderIndex(b));
}

export function partsToText(parts = []) {
  return parts.map((part) => part.text ?? "").join("");
}

export function assembleGuestParts(userId, picks, preferences, copy) {
  const connectors = copy?.chat?.smsConnectors ?? DEFAULT_CONNECTORS;
  const connector = connectors[userId] || "and";
  const byId = new Map((preferences ?? []).map((preference) => [preference.id, preference]));
  const phrases = (picks ?? [])
    .map((id) => {
      const preference = byId.get(id);
      const text = preference?.chatLines?.[userId] ?? preference?.chatLine ?? preference?.label;
      return text ? { id, text } : null;
    })
    .filter(Boolean);

  const parts = [];
  phrases.forEach((phrase, index) => {
    if (index === 0) {
      parts.push(phrase);
      return;
    }
    if (index === phrases.length - 1 && phrases.length >= 3) {
      parts.push({ text: ` ${connector} ` });
      parts.push(phrase);
      return;
    }
    parts.push({ text: " " });
    parts.push(phrase);
  });
  return parts;
}

export function assembleGuestText(userId, picks, preferences, copy) {
  return partsToText(assembleGuestParts(userId, picks, preferences, copy));
}

export function buildGroupRequest(counts, copy) {
  const shared = pickSharedPriorities(counts);
  const remaining = pickRemainingPriorities(counts, shared);
  const leadIds = shared.length ? shared : remaining;
  const leftover = shared.length ? remaining : [];
  if (!leadIds.length) {
    return `Hawaii stay the whole group will love.`;
  }

  const lead = joinAnd(
    leadIds.map((id) => searchWording(id, copy)),
    leadIds.length >= 3,
  );
  const head = `Hawaii stay with ${lead}.`;
  if (!leftover.length) return head;
  return `${head} Ideally ${joinAnd(
    leftover.map((id) => searchWording(id, copy)),
    false,
  )}.`;
}

export function buildJamieParts(sharedIds, copy) {
  const words = (sharedIds ?? []).map((id) => ({
    id,
    text: searchWording(id, copy),
  }));
  if (!words.length) return null;

  if (words.length === 1) {
    return [
      { text: "ok so " },
      words[0],
      {
        text: " is clearly #1. I'll find something that hits that and as much of the rest as I can.",
      },
    ];
  }

  if (words.length === 2) {
    return [
      { text: "ok so " },
      words[0],
      { text: " and " },
      words[1],
      {
        text: " are the big ones. I'll find something that hits both and as much of the rest as I can.",
      },
    ];
  }

  const parts = [{ text: "ok so " }];
  words.forEach((word, index) => {
    if (index === 0) {
      parts.push(word);
      return;
    }
    parts.push({ text: index === words.length - 1 ? ", and " : ", " });
    parts.push(word);
  });
  const closer =
    words.length === 3
      ? " are the big ones. I'll find something that hits all three and as much of the rest as I can."
      : " are the big ones. I'll find something that hits all of them and as much of the rest as I can.";
  parts.push({ text: closer });
  return parts;
}

export function sharedPhraseBank(sharedIds, preferences, copy) {
  const phrases = [];
  (sharedIds ?? []).forEach((id) => {
    const preference = (preferences ?? []).find((item) => item.id === id);
    const wording = searchWording(id, copy);
    if (wording) phrases.push(wording);
    if (preference?.label) phrases.push(preference.label);
    Object.values(preference?.chatLines ?? {}).forEach((line) => {
      if (line) phrases.push(line);
    });
  });
  return [...new Set(phrases)].sort((a, b) => b.length - a.length);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitByPhrases(text, phrases = []) {
  const value = text ?? "";
  if (!value || !phrases.length) return value ? [{ text: value }] : [];
  const re = new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "g");
  const parts = [];
  let last = 0;
  let match;
  while ((match = re.exec(value))) {
    if (match.index > last) parts.push({ text: value.slice(last, match.index) });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last) });
  return parts.length ? parts : [{ text: value }];
}
