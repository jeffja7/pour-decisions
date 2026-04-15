"use client";

import { useState } from "react";
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

function FeedbackButtons({
  item,
  upLabel,
  downLabel,
  onFeedback,
  ratedItems,
  onRate,
}: {
  item: string;
  upLabel: string;
  downLabel: string;
  onFeedback: (item: string, rating: "up" | "down") => void;
  ratedItems: Map<string, "up" | "down">;
  onRate: (item: string, rating: "up" | "down") => void;
}) {
  const rating = ratedItems.get(item);

  if (rating) {
    return (
      <div className="flex items-center gap-2 pt-1">
        <span
          className={`text-xs px-3 py-1.5 rounded-lg ${
            rating === "up"
              ? "bg-emerald-900/50 text-emerald-400"
              : "bg-rose-900/50 text-rose-400"
          }`}
        >
          {rating === "up" ? "Noted!" : "Got it"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={() => {
          onRate(item, "up");
          onFeedback(item, "up");
        }}
        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-zinc-400 transition-colors active:scale-95"
      >
        {upLabel}
      </button>
      <button
        onClick={() => {
          onRate(item, "down");
          onFeedback(item, "down");
        }}
        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 hover:text-rose-400 text-zinc-400 transition-colors active:scale-95"
      >
        {downLabel}
      </button>
    </div>
  );
}

export default function RecommendationCards({
  data,
  onFeedback,
  onDismiss,
}: RecommendationCardsProps) {
  const [ratedItems, setRatedItems] = useState<Map<string, "up" | "down">>(
    new Map()
  );

  function handleRate(item: string, rating: "up" | "down") {
    setRatedItems((prev) => new Map(prev).set(item, rating));
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div
        className="flex items-center justify-between animate-fade-in"
      >
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

      <p className="text-zinc-500 text-sm animate-fade-in">
        Found {data.menuItems.length} items on the menu
      </p>

      {/* Top Picks */}
      <div className="space-y-3">
        <h3
          className="text-violet-400 font-medium text-sm animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          Top Picks
        </h3>
        {data.topPicks.map((rec, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 animate-fade-in-up"
            style={{ animationDelay: `${150 + i * 100}ms` }}
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
            <FeedbackButtons
              item={rec.item}
              upLabel="Ordered this"
              downLabel="Not for me"
              onFeedback={onFeedback}
              ratedItems={ratedItems}
              onRate={handleRate}
            />
          </div>
        ))}
      </div>

      {/* Adventure Pick */}
      <div className="space-y-3">
        <h3
          className="text-amber-400 font-medium text-sm flex items-center gap-2 animate-fade-in-up"
          style={{ animationDelay: "450ms" }}
        >
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
        <div
          className="bg-gradient-to-br from-amber-950/30 to-violet-950/30 border border-amber-800/30 rounded-xl p-4 space-y-2 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <span className="text-white font-medium">
            {data.adventurePick.item}
          </span>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {data.adventurePick.reason}
          </p>
          <FeedbackButtons
            item={data.adventurePick.item}
            upLabel="Tried it, loved it"
            downLabel="Not my thing"
            onFeedback={onFeedback}
            ratedItems={ratedItems}
            onRate={handleRate}
          />
        </div>
      </div>
    </div>
  );
}
