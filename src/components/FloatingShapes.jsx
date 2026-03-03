import { useId } from "react";

function getPositionStyle({ top, left, right, bottom }) {
  return { top, left, right, bottom };
}

export function ShapeSquare({ top, left, right, bottom, className = "" }) {
  return (
    <div
      aria-hidden="true"
      style={getPositionStyle({ top, left, right, bottom })}
      className={`pointer-events-none absolute -z-10 h-24 w-24 rounded-3xl bg-blue-500/20 ${className}`}
    />
  );
}

export function ShapeOutline({ top, left, right, bottom, className = "" }) {
  return (
    <div
      aria-hidden="true"
      style={getPositionStyle({ top, left, right, bottom })}
      className={`pointer-events-none absolute -z-10 h-24 w-24 rounded-3xl border-4 border-blue-300/40 ${className}`}
    />
  );
}

export function ShapeDots({
  top,
  left,
  right,
  bottom,
  className = "",
  size = 112,
  dotColor = "rgb(59 130 246 / 0.35)",
}) {
  const patternId = useId();

  return (
    <div
      aria-hidden="true"
      style={getPositionStyle({ top, left, right, bottom })}
      className={`pointer-events-none absolute -z-10 ${className}`}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <defs>
          <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="2.5" fill={dotColor} />
          </pattern>
        </defs>
        <rect width="80" height="80" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
