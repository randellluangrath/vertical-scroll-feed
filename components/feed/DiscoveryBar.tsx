"use client";

import { cn } from "@/lib/utils";

type Rail = "for-you" | "trending";

type DiscoveryBarProps = {
  rail: Rail;
  onRailChange: (rail: Rail) => void;
  genres: string[];
  activeGenre: string | null;
  onGenreChange: (genre: string | null) => void;
};

const DiscoveryBar = ({
  rail,
  onRailChange,
  genres,
  activeGenre,
  onGenreChange,
}: DiscoveryBarProps) => {
  const tabs: { key: Rail; label: string }[] = [
    { key: "for-you", label: "For You" },
    { key: "trending", label: "Trending" },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/70 via-black/30 to-transparent pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* Rail switcher */}
      <div className="pointer-events-auto flex items-center justify-center gap-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onRailChange(tab.key)}
            className={cn(
              "relative py-1 text-[15px] font-semibold tracking-tight transition-colors",
              rail === tab.key ? "text-white" : "text-white/55",
            )}
          >
            {tab.label}
            {rail === tab.key && (
              <span className="bg-brand-strong absolute -bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Genre chips */}
      <div className="no-scrollbar pointer-events-auto mt-3 flex gap-2 overflow-x-auto px-4">
        <Chip
          label="All"
          active={activeGenre === null}
          onClick={() => onGenreChange(null)}
        />
        {genres.map((g) => (
          <Chip
            key={g}
            label={g}
            active={activeGenre === g}
            onClick={() => onGenreChange(activeGenre === g ? null : g)}
          />
        ))}
      </div>
    </div>
  );
};

const Chip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "shrink-0 rounded-full border px-3 py-1 text-xs font-medium capitalize backdrop-blur-md transition-colors",
      active
        ? "border-white bg-white text-black"
        : "border-white/25 bg-white/10 text-white/80 hover:bg-white/20",
    )}
  >
    {label}
  </button>
);

export default DiscoveryBar;
