/**
 * A live price trace, built from prices that actually arrived over the socket.
 *
 * Deliberately not a charting library: this is one path element redrawn as the
 * window shifts, so a row costs almost nothing even while four of them update
 * several times a second. The line is not animated by us at all. It moves
 * because the data moved, which is the only motion worth paying for here.
 */
export default function Sparkline({
  points,
  dir,
  width = 76,
  height = 26,
}: {
  points: number[];
  /** Trend across the window. Colours the trace. */
  dir: 1 | -1 | 0;
  width?: number;
  height?: number;
}) {
  // Below three points there is no shape to read, so render the rail only.
  if (points.length < 3) {
    return (
      <svg width={width} height={height} aria-hidden className="overflow-visible">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 3;
  const usable = height - pad * 2;

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = pad + (1 - (value - min) / span) * usable;
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const area = `${line} L${width} ${height} L0 ${height} Z`;

  const stroke =
    dir === 1 ? "var(--market-up)" : dir === -1 ? "var(--market-down)" : "currentColor";
  const id = `spark-${dir}`;

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={dir === 0 ? 0.35 : 1}
      />
      {/* Leading dot marks the current price on the trace. */}
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}
