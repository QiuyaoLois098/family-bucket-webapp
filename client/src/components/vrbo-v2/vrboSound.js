const SOUNDS = {
  infoSent: "/sound/vrbo/info-sent.wav",
  confirmProperty: "/sound/vrbo/confirm-property.wav",
  sendProperty: "/sound/vrbo/send-property.wav",
  tapProperty: "/sound/vrbo/tap-property.wav",
  tapAmenity: "/sound/vrbo/tap-amenity.wav",
  tapSearch: "/sound/vrbo/tap-search.wav",
  propertyText: "/sound/vrbo/property-text.wav",
  textAppear: "/sound/vrbo/text-appear.wav",
};

const clips = new Map();
const channel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("vrbo-sfx") : null;
const claimed = new Set();
const suppressUntil = new Map();

channel?.addEventListener("message", (event) => {
  if (event.data?.type === "played" && event.data.key) claimed.add(event.data.key);
  if (event.data?.type === "suppress" && Array.isArray(event.data.ids)) {
    holdSuppress(event.data.ids, event.data.until);
  }
});

function holdSuppress(ids, until) {
  ids.forEach((id) => {
    suppressUntil.set(id, Math.max(suppressUntil.get(id) || 0, until));
  });
}

function isSuppressed(id) {
  return (suppressUntil.get(id) || 0) > Date.now();
}

/** Mute the automatic sounds that follow this interaction. */
function suppressFollowups(ids, ms) {
  const until = Date.now() + ms;
  holdSuppress(ids, until);
  channel?.postMessage({ type: "suppress", ids, until });
}

function clip(id) {
  const src = SOUNDS[id];
  if (!src) return null;
  let audio = clips.get(id);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    clips.set(id, audio);
  }
  return audio;
}

const SEARCH_ONLY_IDS = new Set(["tapSearch", "confirmProperty", "sendProperty"]);

function start(id, { allowTapSearch = false } = {}) {
  // confirm-property / send-property are the same recording as tap-search.
  if (SEARCH_ONLY_IDS.has(id) && !allowTapSearch) return;
  const audio = clip(id);
  if (!audio) return;
  audio.volume = 1;
  try {
    audio.currentTime = 0;
  } catch {
    // Ignore seek errors before the file has metadata.
  }
  audio.play()?.catch(() => {});
}

/** Blue Search button only. */
export function playTapSearchSound() {
  start("tapSearch", { allowTapSearch: true });
  suppressFollowups(["textAppear", "sendProperty", "propertyText"], 4000);
}

/** Sound for the screen that was just touched. Later sounds from that same action stay quiet. */
export function playVrboSound(id) {
  if (SEARCH_ONLY_IDS.has(id)) {
    if (id === "confirmProperty") {
      suppressFollowups(["sendProperty", "propertyText", "textAppear"], 9000);
    }
    return;
  }
  start(id);
}

/**
 * Chat and scene sounds. The full-bleed kiosk plays immediately.
 * The five-up overview waits, then stays quiet if a kiosk already played it.
 */
export function playSharedVrboSound(id) {
  const key = `${id}:${Math.floor(Date.now() / 450)}`;
  const kiosk = /\/vrbo-(left|right)(\/|$|-)/.test(window.location.pathname);
  window.setTimeout(() => {
    if (isSuppressed(id) || claimed.has(key)) return;
    claimed.add(key);
    channel?.postMessage({ type: "played", key });
    start(id);
    if (id === "infoSent") suppressFollowups(["textAppear"], 3500);
  }, kiosk ? 0 : 140);
}

export function preloadVrboSounds() {
  Object.keys(SOUNDS).forEach((id) => clip(id));
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    () => {
      const audio = clip("textAppear");
      if (!audio) return;
      const previous = audio.volume;
      audio.volume = 0;
      audio
        .play()
        ?.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = previous || 1;
        })
        .catch(() => {
          audio.volume = previous || 1;
        });
    },
    { once: true },
  );
}
