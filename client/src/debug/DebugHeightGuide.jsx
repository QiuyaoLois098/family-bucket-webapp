import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VRBO_UI } from "../config/vrboUi.js";

/**
 * TEMP debug overlay — delete this whole file when done.
 * Toggle: VRBO_UI.heightGuide in config/vrboUi.js, or press `g` when enabled.
 * Drag the magenta line vertically to compare heights.
 */
export const ENABLE = VRBO_UI.heightGuide;

const LINE = "#e11d8f";
const STORAGE_KEY = "debug-height-guide-y";

export default function DebugHeightGuide() {
  const [visible, setVisible] = useState(ENABLE);
  const [y, setY] = useState(() => {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved) && saved >= 0) return saved;
    return Math.round(window.innerHeight * 0.4);
  });
  const dragging = useRef(false);

  useEffect(() => {
    if (!ENABLE) return undefined;

    const onKey = (event) => {
      if (event.key === "g" || event.key === "G") {
        if (event.target?.closest?.("input, textarea, [contenteditable]")) return;
        setVisible((v) => !v);
      }
      if (!visible) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setY((prev) => Math.max(0, prev - (event.shiftKey ? 10 : 1)));
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setY((prev) => Math.min(window.innerHeight, prev + (event.shiftKey ? 10 : 1)));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(y));
  }, [y]);

  useEffect(() => {
    if (!dragging.current && !visible) return undefined;

    const onMove = (event) => {
      if (!dragging.current) return;
      setY(Math.min(window.innerHeight, Math.max(0, event.clientY)));
    };
    const onUp = () => {
      dragging.current = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [visible]);

  if (!ENABLE || !visible) return null;

  return createPortal(
    <div
      data-debug="height-guide"
      onPointerDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        setY(Math.min(window.innerHeight, Math.max(0, event.clientY)));
      }}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: y,
        height: 0,
        zIndex: 2147483646,
        cursor: "ns-resize",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -1,
          height: 2,
          background: LINE,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.35)`,
          pointerEvents: "none",
        }}
      />
      {/* Wider hit area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -10,
          height: 20,
          background: "transparent",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 8,
          top: -22,
          padding: "2px 8px",
          borderRadius: 4,
          background: LINE,
          color: "#fff",
          font: "11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        y={Math.round(y)}px · drag · g hide · ↑↓ nudge
      </div>
    </div>,
    document.body,
  );
}
