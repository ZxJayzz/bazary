"use client";

interface MannerTempProps {
  temperature: number;
  size?: "sm" | "md" | "lg";
}

export default function MannerTemp({ temperature, size = "md" }: MannerTempProps) {
  const getColor = (temp: number): string => {
    if (temp < 20) return "#4A90D9";
    if (temp < 30) return "#5CC6AA";
    if (temp <= 36.5) return "#4CAF50";
    if (temp <= 40) return "#8BC34A";
    if (temp <= 50) return "#FF9800";
    if (temp <= 60) return "#FF5722";
    return "#F44336";
  };

  const getEmoji = (temp: number): string => {
    if (temp < 20) return "\uD83D\uDE30";
    if (temp < 36) return "\uD83D\uDE10";
    if (temp < 40) return "\uD83D\uDE42";
    if (temp < 50) return "\uD83D\uDE0A";
    if (temp < 60) return "\uD83D\uDE04";
    return "\uD83D\uDD25";
  };

  const color = getColor(temperature);
  const emoji = getEmoji(temperature);
  const barWidth = Math.min((temperature / 99) * 100, 100);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base"}>
        {emoji}
      </span>
      <div className="flex flex-col">
        <span className={`font-bold ${sizeClasses[size]}`} style={{ color }}>
          {temperature.toFixed(1)}&deg;C
        </span>
        {size !== "sm" && (
          <div className={`${size === "lg" ? "w-20" : "w-16"} h-1 bg-gray-200 rounded-full overflow-hidden`}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${barWidth}%`, backgroundColor: color }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
