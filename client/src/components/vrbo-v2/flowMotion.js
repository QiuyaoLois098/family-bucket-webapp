/**
 * Verbatim message motion from VRBO-Motion-Developer-Handoff-2026-10-16
 * — screens/flow.js (arrive / springEnter / fadeOut)
 * — mobile/motion.js (MotionScope.message)
 *
 * IMPORTANT: do not call shouldEnter during React render (Strict Mode eats it).
 * Use createMessageMotionController().sync() from useLayoutEffect instead.
 */

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (p) => Math.max(0, Math.min(1, p));

function bezier(p, x1 = 0.4, x2 = 0.2) {
  p = clamp(p);
  if (p === 0 || p === 1) return p;
  let lo = 0;
  let hi = 1;
  let u = p;
  for (let i = 0; i < 16; i += 1) {
    u = (lo + hi) / 2;
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    if (x < p) lo = u;
    else hi = u;
  }
  return 3 * (1 - u) * u * u + u * u * u;
}

function enter(n, t, start, duration, offset = 24) {
  if (!n) return;
  const p = t < start ? 0 : reduced ? 1 : bezier((t - start) / duration);
  n.style.opacity = String(p);
  n.style.transform = `translateY(${offset * (1 - p)}px)`;
}

function pop(n, t, start) {
  if (!n) return;
  const elapsed = t - start;
  const p = reduced ? 1 : bezier(elapsed / 500);
  let scale = 0.94 + 0.075 * p;
  if (reduced || elapsed >= 650) scale = 1;
  else if (elapsed > 500) scale = 1.015 - 0.015 * bezier((elapsed - 500) / 150);
  n.style.opacity = elapsed < 0 ? "0" : String(p);
  n.style.transformOrigin = "0px 40px";
  n.style.transform = `translateY(${24 * (1 - p)}px) scale(${scale})`;
}

/** Closed-form damped spring: mass 1, stiffness 324, damping 18. */
function springProgress(elapsed) {
  if (elapsed <= 0) return 0;
  if (reduced || elapsed >= 600) return 1;
  const seconds = elapsed / 1000;
  const omega = 18;
  const zeta = 0.5;
  const root = Math.sqrt(1 - zeta * zeta);
  const phase = omega * root * seconds;
  return (
    1 -
    Math.exp(-zeta * omega * seconds) *
      (Math.cos(phase) + (zeta / root) * Math.sin(phase))
  );
}

function springEnter(n, t, start) {
  if (!n) return;
  const elapsed = t - start;
  const p = springProgress(elapsed);
  n.style.opacity = elapsed < 0 ? "0" : reduced ? "1" : String(clamp(elapsed / 90));
  n.style.transformOrigin = "0px 40px";
  n.style.transform = `translateY(${56 * (1 - p)}px) scale(${0.9 + 0.1 * p})`;
}

function visible(n, opacity) {
  if (!n) return;
  n.style.opacity = String(opacity);
  n.style.visibility = opacity > 0 ? "visible" : "hidden";
  n.style.pointerEvents = opacity > 0.99 ? "auto" : "none";
}

/** flow.js fadeOut — opacity out + lift −16px · 350ms */
function fadeOut(n, t, start, duration = 350) {
  if (!n) return;
  const p = reduced ? (t >= start ? 1 : 0) : bezier((t - start) / duration);
  visible(n, 1 - p);
  n.style.transform = `translateY(${-16 * p}px)`;
}

function arrive(m, t, start) {
  if (!m) return;
  enter(m.avatar, t, start, 120, 0);
  springEnter(m.body, t, start);
  enter(m.text, t, start + 50, 70, 0);
}

function partsFromChatRow(row) {
  return {
    avatar: row.querySelector(".vrbo-v2-chat__avatar, .vrbo-v2-chat__typing-avatar"),
    body:
      row.querySelector(".vrbo-v2-chat__bubble") ||
      row.querySelector(".vrbo-v2-chat__card") ||
      row,
    text: row.querySelector(".vrbo-v2-chat__text"),
  };
}

function runRaf(duration, onFrame) {
  const t0 = performance.now();
  const tick = (now) => {
    const t = now - t0;
    onFrame(t);
    if (t < duration) requestAnimationFrame(tick);
    else onFrame(duration);
  };
  onFrame(-1);
  requestAnimationFrame(tick);
}

/** Large-screen arrive — spring body from avatar corner. */
export function playFlowArrive(row) {
  if (!row || row.dataset.motionEnter === "done" || row.dataset.motionEnter === "running") {
    return;
  }
  const m = partsFromChatRow(row);
  if (!m.body) return;

  row.dataset.motionEnter = "running";
  arrive(m, -1, 0);

  if (reduced) {
    if (m.avatar) {
      m.avatar.style.opacity = "1";
      m.avatar.style.transform = "none";
    }
    m.body.style.opacity = "1";
    m.body.style.transform = "none";
    if (m.text) {
      m.text.style.opacity = "1";
      m.text.style.transform = "none";
    }
    row.dataset.motionEnter = "done";
    return;
  }

  const t0 = performance.now();
  const tick = (now) => {
    if (!row.isConnected) return;
    const t = now - t0;
    arrive(m, t, 0);
    if (t < 700) requestAnimationFrame(tick);
    else {
      arrive(m, 700, 0);
      row.dataset.motionEnter = "done";
    }
  };
  requestAnimationFrame(tick);
}

/** Large-screen typing pill — flow.js pop() */
export function playFlowPop(row) {
  if (!row || row.dataset.motionEnter === "done" || row.dataset.motionEnter === "running") {
    return;
  }
  const body =
    row.querySelector(".vrbo-v2-chat__bubble") ||
    row.querySelector(".vrbo-v2-chat__typing-avatars") ||
    row;
  row.dataset.motionEnter = "running";
  pop(body, -1, 0);
  if (reduced) {
    body.style.opacity = "1";
    body.style.transform = "none";
    row.dataset.motionEnter = "done";
    return;
  }
  const t0 = performance.now();
  const tick = (now) => {
    if (!row.isConnected) return;
    const t = now - t0;
    pop(body, t, 0);
    if (t < 650) requestAnimationFrame(tick);
    else {
      pop(body, 650, 0);
      row.dataset.motionEnter = "done";
    }
  };
  requestAnimationFrame(tick);
}

/**
 * Phone MotionScope.message — row opacity 220ms;
 * bubble ease-out-quart Y12 / scale .96→1 · 400ms.
 */
export function playFlowPhoneMessage(row) {
  if (!row || row.dataset.motionEnter === "done" || row.dataset.motionEnter === "running") {
    return;
  }
  const bubble =
    row.querySelector(".vrbo-v2-phone__bubble") ||
    row.querySelector(".vrbo-v2-property--chat") ||
    row.querySelector(".vrbo-v2-property") ||
    row;

  row.dataset.motionEnter = "running";
  row.style.opacity = "0";
  if (bubble && bubble !== row) {
    bubble.style.opacity = "0";
    bubble.style.transform = "translateY(12px) scale(0.96)";
  }

  if (reduced || !row.animate) {
    row.style.opacity = "1";
    if (bubble) {
      bubble.style.opacity = "1";
      bubble.style.transform = "none";
    }
    row.dataset.motionEnter = "done";
    return;
  }

  const duration = 400;
  const overflow = row.style.overflow;
  row.style.overflow = "visible";
  const frames = Array.from({ length: 45 }, (_, i) => {
    const u = i / 44;
    const progress = 1 - (1 - u) ** 4;
    return {
      offset: u,
      opacity: Math.min(u / 0.6, 1),
      transform: `translateY(${12 * (1 - progress)}px) scale(${0.96 + 0.04 * progress})`,
    };
  });
  const tracks = [
    row.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 220,
      easing: "ease-out",
      fill: "both",
    }),
  ];
  if (bubble && bubble !== row) {
    tracks.push(
      bubble.animate(frames, { duration, easing: "linear", fill: "both" }),
    );
  }
  Promise.all(tracks.map((a) => a.finished.catch(() => {}))).finally(() => {
    row.style.overflow = overflow;
    row.style.opacity = "1";
    if (bubble && bubble !== row) {
      bubble.style.opacity = "1";
      bubble.style.transform = "none";
    }
    row.dataset.motionEnter = "done";
  });
}

/** flow.js fadeOut for exiting bubbles. */
export function playFlowFadeOut(row, { duration = 350 } = {}) {
  if (!row || row.dataset.motionExit === "done") return;
  row.dataset.motionExit = "done";
  if (reduced) {
    visible(row, 0);
    return;
  }
  runRaf(duration, (t) => fadeOut(row, t < 0 ? -1 : t, 0, duration));
}

function markEnterDone(node) {
  if (!node) return;
  node.dataset.motionEnter = "done";
}

/** Clear leftover enter inline styles when DOM was recycled or rAF was interrupted. */
function revealMessageNode(node) {
  if (!node) return;
  markEnterDone(node);
  node.style.opacity = "";
  node.style.transform = "";
  node.style.visibility = "";
  node.querySelectorAll(
    ".vrbo-v2-chat__avatar, .vrbo-v2-chat__bubble, .vrbo-v2-chat__card, .vrbo-v2-chat__text, .vrbo-v2-phone__bubble, .vrbo-v2-property",
  ).forEach((el) => {
    el.style.opacity = "";
    el.style.transform = "";
    el.style.visibility = "";
  });
}

/**
 * Tracks which message ids have been seeded / entered / exited.
 * Call sync() from useLayoutEffect only — never during render.
 */
export function createMessageMotionController() {
  let seeded = false;
  const seen = new Set();
  let typingOn = false;

  return {
    /**
     * @param {HTMLElement|null} root
     * @param {Array<{ id: string, exiting?: boolean }>} messages
     * @param {"chat"|"phone"} variant
     * @param {{ typing?: boolean }} [opts]
     */
    sync(root, messages, variant = "chat", opts = {}) {
      if (!root) return;
      const list = messages ?? [];

      if (!seeded) {
        // Only seed ids that are actually mounted. Missing nodes must animate later.
        list.forEach((message) => {
          const node = root.querySelector(`[data-msg-id="${message.id}"]`);
          if (!node) return;
          seen.add(message.id);
          revealMessageNode(node);
        });
        seeded = true;
        typingOn = Boolean(opts.typing);
        if (typingOn) {
          revealMessageNode(root.querySelector("[data-msg-typing]"));
        }
        return;
      }

      list.forEach((message) => {
        const node = root.querySelector(`[data-msg-id="${message.id}"]`);
        if (!node) return;

        if (message.exiting) {
          playFlowFadeOut(node);
          return;
        }

        // Already entered. If DOM recycled (no running/done), force visible.
        if (seen.has(message.id)) {
          const state = node.dataset.motionEnter;
          if (state !== "done" && state !== "running") revealMessageNode(node);
          return;
        }

        seen.add(message.id);
        if (variant === "phone") playFlowPhoneMessage(node);
        else playFlowArrive(node);
      });

      const typing = Boolean(opts.typing);
      const typingNode = root.querySelector("[data-msg-typing]");
      if (typing && typingNode && !typingOn) {
        if (variant === "phone") playFlowPhoneMessage(typingNode);
        else playFlowPop(typingNode);
      }
      if (!typing) typingOn = false;
      else typingOn = true;
    },
  };
}

/** @deprecated prefer createMessageMotionController */
export function playPendingFlowEnters(root, variant = "chat") {
  if (!root) return;
  root.querySelectorAll("[data-msg-id]:not([data-motion-enter='done'])").forEach((node) => {
    if (node.classList.contains("is-exit")) {
      playFlowFadeOut(node);
      return;
    }
    if (variant === "phone") playFlowPhoneMessage(node);
    else if (node.hasAttribute("data-msg-typing")) playFlowPop(node);
    else playFlowArrive(node);
  });
  root.querySelectorAll(".is-exit").forEach((node) => playFlowFadeOut(node));
}

export {
  arrive,
  bezier,
  enter,
  fadeOut,
  pop,
  reduced,
  springEnter,
  springProgress,
};
