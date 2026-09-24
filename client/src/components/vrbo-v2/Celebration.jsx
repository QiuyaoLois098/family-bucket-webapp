import { useMemo } from "react";

const COLORS = ["#3857e3", "#79cff3", "#8bd5f7", "#4a7be8", "#a6a6a2"];
const PIECES = 34;

export default function Celebration({ active }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, index) => ({
        id: index,
        left: `${(index / PIECES) * 100 + (index % 3) * 2}%`,
        delay: `${(index % 11) * 0.18}s`,
        duration: `${2.6 + (index % 5) * 0.45}s`,
        color: COLORS[index % COLORS.length],
        drift: `${(index % 2 === 0 ? 1 : -1) * (12 + (index % 7) * 6)}px`,
        size: `${6 + (index % 4) * 3}px`,
      })),
    [],
  );

  if (!active) return null;

  return (
    <div className="vrbo-v2-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          style={{
            left: piece.left,
            background: piece.color,
            width: piece.size,
            height: piece.size,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            "--drift": piece.drift,
          }}
        />
      ))}
    </div>
  );
}
