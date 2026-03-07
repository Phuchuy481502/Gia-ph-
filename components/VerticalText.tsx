/**
 * VerticalText Component
 * Renders text vertically using SVG transform for accessibility and styling flexibility.
 * Supports dark mode, custom colors, and responsive sizing.
 */

interface VerticalTextProps {
  text: string;
  className?: string;
  fontSize?: number;
  color?: string;
  darkColor?: string;
  width?: number;
  height?: number;
  fontWeight?: 'normal' | 'bold' | 'semibold';
}

export default function VerticalText({
  text,
  className = "",
  fontSize = 14,
  color = "#1c1917",
  darkColor = "#f5f5f4",
  width = 40,
  height = 200,
  fontWeight = "normal",
}: VerticalTextProps) {
  // Handle long text by adjusting dimensions
  const textLength = text.length;
  const adjustedHeight = Math.max(height, textLength * (fontSize + 4));

  const fontWeightValue = {
    normal: 400,
    semibold: 600,
    bold: 700,
  }[fontWeight];

  return (
    <svg
      width={width}
      height={adjustedHeight}
      viewBox={`0 0 ${width} ${adjustedHeight}`}
      className={`inline-block dark:[--color:${darkColor}] [--color:${color}] ${className}`}
      style={{
        "--color": color,
      } as React.CSSProperties}
      aria-label={text}
    >
      <defs>
        <style>{`
          .vertical-text {
            font-family: inherit;
            font-size: ${fontSize}px;
            font-weight: ${fontWeightValue};
            fill: currentColor;
            text-anchor: middle;
          }
          @media (prefers-color-scheme: dark) {
            .vertical-text {
              fill: ${darkColor};
            }
          }
        `}</style>
      </defs>

      {/* Render each character vertically */}
      {text.split("").map((char, index) => (
        <text
          key={index}
          x={width / 2}
          y={fontSize + 2 + index * (fontSize + 4)}
          className="vertical-text"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {char}
        </text>
      ))}
    </svg>
  );
}

/**
 * Compact VerticalText variant for use in tree nodes and compact layouts
 */
export function VerticalTextSmall({ text, className = "" }: { text: string; className?: string }) {
  return <VerticalText text={text} fontSize={11} width={28} height={120} className={className} />;
}

/**
 * Large VerticalText variant for prominent displays
 */
export function VerticalTextLarge({ text, className = "" }: { text: string; className?: string }) {
  return <VerticalText text={text} fontSize={16} fontWeight="bold" width={50} height={250} className={className} />;
}
