"use client";

import { RecommendationResponse } from "@/lib/types";

interface RecommendationCardsProps {
  data: RecommendationResponse;
  onFeedback: (item: string, rating: "up" | "down") => void;
  onDismiss: () => void;
}

function ConfidenceDots({ confidence }: { confidence: number }) {
  const filled = Math.round(confidence * 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? "bg-violet-500" : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function RecommendationCards({
  data,
  onFeedback,
  onDismiss,
}: RecommendationCardsProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Your Recommendations
        </h2>
        <button
          onClick={onDismiss}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Scan again
        </button>
      </div>

      <p className="text-zinc-500 text-sm">
        Found {data.menuItems.length} items on the menu
      </p>

      {/* Top Picks */}
      <div className="space-y-3">
        <h3 className="text-violet-400 font-medium text-sm">Top Picks</h3>
        {data.topPicks.map((rec, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="text-white font-medium">{rec.item}</span>
                <div className="flex items-center gap-2 mt-1">
                  <ConfidenceDots confidence={rec.confidence} />
                  <span className="text-zinc-600 text-xs">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {rec.reason}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onFeedback(rec.item, "up")}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-zinc-400 transition-colors"
              >
                Ordered this
              </button>
              <button
                onClick={() => onFeedback(rec.item, "down")}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 hover:text-rose-400 text-zinc-400 transition-colors"
              >
                Not for me
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adventure Pick */}
      <div className="space-y-3">
        <h3 className="text-amber-400 font-medium text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
            />
          </svg>
          Adventure Pick
        </h3>
        <div className="bg-gradient-to-br from-amber-950/30 to-violet-950/30 border border-amber-800/30 rounded-xl p-4 space-y-2">
          <span className="text-white font-medium">
            {data.adventurePick.item}
          </span>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {data.adventurePick.reason}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onFeedback(data.adventurePick.item, "up")}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-emerald-900/50 hover:text-emerald-400 text-zinc-400 transition-colors"
            >
              Tried it, loved it
            </button>
            <button
              onClick={() => onFeedback(data.adventurePick.item, "down")}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-rose-900/50 hover:text-rose-400 text-zinc-400 transition-colors"
            >
              Not my thing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
