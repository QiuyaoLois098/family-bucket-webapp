import { FEATURE_ORDER } from "./vrboStayCopy.js";

const DEFAULT_CONNECTORS = {
  sarah: "and",
  alex: "and",
  chris: "plus",
};

function capitalizeFirst(text) {
  const value = String(text ?? "");
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

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
  // Sent texts start with a capital letter.
  if (parts[0]?.text) parts[0] = { ...parts[0], text: capitalizeFirst(parts[0].text) };
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

const VACATION_FEATURES = new Set([
  "private-pool",
  "outdoor-dining",
  "near-beach",
  "fire-pit",
  "hot-tub",
  "big-kitchen",
]);

function featureAppeal(id) {
  if (id === "wifi") return 0;
  if (VACATION_FEATURES.has(id)) return 2;
  return 1;
}

/** No overlap: two picks, different people when possible, Wi-Fi last. */
export function pickUnsharedMentions(selections = [], random = Math.random) {
  const owners = new Map();
  selections.forEach(({ userId, picks }) => {
    (picks ?? []).forEach((id) => {
      if (!id) return;
      if (!owners.has(id)) owners.set(id, new Set());
      owners.get(id).add(userId);
    });
  });
  const ids = [...owners.keys()];
  if (ids.length <= 1) return ids;

  const pairs = [];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = ids[i];
      const b = ids[j];
      const peopleA = owners.get(a);
      const peopleB = owners.get(b);
      let different = false;
      peopleA.forEach((person) => {
        if (!peopleB.has(person)) different = true;
      });
      pairs.push({
        pair: [a, b],
        score: (different ? 10 : 0) + featureAppeal(a) + featureAppeal(b),
      });
    }
  }

  const best = Math.max(...pairs.map((item) => item.score));
  const choices = pairs.filter((item) => item.score === best);
  const index = Math.min(choices.length - 1, Math.floor(random() * choices.length));
  return [...choices[index].pair].sort((a, b) => {
    const byAppeal = featureAppeal(b) - featureAppeal(a);
    if (byAppeal !== 0) return byAppeal;
    return orderIndex(a) - orderIndex(b);
  });
}

function wordingPart(id, copy, bold = false) {
  return { id, text: searchWording(id, copy), ...(bold ? { bold: true } : {}) };
}

function everyoneParts(first, second) {
  return [
    { text: "ok, a little something for everyone! I'll find us a Hawaii stay with " },
    first,
    { text: " and " },
    second,
    { text: ", and see how many of the other wishes we can fit in." },
  ];
}

export function buildJamieParts(sharedIds, copy, options = {}) {
  const shared = sharedIds ?? [];
  const mentionIds = shared.length
    ? shared.length >= 4
      ? shared.slice(0, 2)
      : shared
    : pickUnsharedMentions(options.selections ?? [], options.random ?? Math.random);
  const boldMentions = shared.length === 0;
  const words = mentionIds.map((id) => wordingPart(id, copy, boldMentions));
  if (!words.length) return null;

  if (shared.length >= 4 || (shared.length === 0 && words.length >= 2)) {
    return everyoneParts(words[0], words[1]);
  }

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
  words.slice(0, 3).forEach((word, index, list) => {
    if (index === 0) {
      parts.push(word);
      return;
    }
    parts.push({ text: index === list.length - 1 ? ", and " : ", " });
    parts.push(word);
  });
  parts.push({
    text: " are the big ones. I'll find something that hits all three and as much of the rest as I can.",
  });
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
  // A sent text starts with a capital, so its first phrase must still match for bold.
  const withCaps = phrases.flatMap((phrase) => [phrase, capitalizeFirst(phrase)]);
  return [...new Set(withCaps)].sort((a, b) => b.length - a.length);
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
