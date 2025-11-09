import { useId } from "react";

interface Props {
  size?: number; // px
  color?: string;
  duration?: number; // seconds per rotation
  className?: string;
  centerImage?: string; // optional image URL to place in the hub (will NOT rotate)
  centerSize?: number; // size of the center image in SVG viewBox units (0-100)
}

export default function GearSpinner({
  size = 64,
  color = "#111827",
  duration = 1.4,
  className = "",
  centerImage,
  centerSize = 20,
}: Props) {
  const id = useId();
  const clipId = `gear-center-clip-${id}`;

  // draw 8 teeth around the gear
  const teeth = Array.from({ length: 8 }).map((_, i) => {
    const angle = (360 / 8) * i;
    return (
      <rect
        key={i}
        x={46}
        y={6}
        width={8}
        height={12}
        rx={1.5}
        transform={`rotate(${angle} 50 50)`}
        fill={color}
      />
    );
  });

  // position for the center image in viewBox units
  const cs = Math.max(2, Math.min(50, centerSize));
  const cx = 50 - cs / 2;
  const cy = 50 - cs / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r={cs / 2} />
        </clipPath>
      </defs>

      {/* rotating gear (teeth + body) */}
      <g>
        {teeth}
        <circle cx="50" cy="50" r="30" fill={color} opacity="0.12" />
        <circle cx="50" cy="50" r="20" fill={color} />
        <circle cx="50" cy="50" r="8" fill="#fff" />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from={`0 50 50`}
          to={`360 50 50`}
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </g>

      {/* center image (does not rotate) */}
      {centerImage && (
        <g clipPath={`url(#${clipId})`}>
          <image
            href={centerImage}
            x={cx}
            y={cy}
            width={cs}
            height={cs}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          />
        </g>
      )}
    </svg>
  );
}
