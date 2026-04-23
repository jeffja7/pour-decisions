"use client";

import { useState, useRef, useEffect } from "react";
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

function ThumbsPopover({
  onRate,
  onClose,
}: {
  onRate: (rating: "up" | "down") => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay attaching the listener to avoid instantly closing from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-800 border border-zinc-700 shadow-lg animate-fade-in"
    >
      <span className="text-[11px] text-zinc-400 pl-2">How was it?</span>
      <button
        onClick={() => onRate("up")}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-emerald-900/50 active:scale-90 transition-all"
        aria-label="Enjoyed it"
      >
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
          />
        </svg>
      </button>
      <button
        onClick={() => onRate("down")}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-rose-900/50 active:scale-90 transition-all"
        aria-label="Didn't enjoy it"
      >
        <svg
          className="w-5 h-5 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 0 1-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54m.023-8.25H16.48a4.5 4.5 0 0 1-1.423-.23l-3.114-1.04a4.5 4.5 0 0 0-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 0 0 2.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.5a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"
          />
        </svg>
      </button>
    </div>
  );
}

function FeedbackControls({
  item,
  orderLabel,
  notForMeLabel,
  onFeedback,
  ratedItems,
  onRate,
  openPopover,
  setOpenPopover,
}: {
  item: string;
  orderLabel: string;
  notForMeLabel: string;
  onFeedback: (item: string, rating: "up" | "down") => void;
  ratedItems: Map<string, "up" | "down">;
  onRate: (item: string, rating: "up" | "down") => void;
  openPopover: string | null;
  setOpenPopover: (item: string | null) => void;
}) {
  const rating = ratedItems.get(item);
  const isOpen = openPopover === item;

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
          {rating === "up" ? "Glad you liked it!" : "Thanks, noted"}
        </span>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="pt-1">
        <ThumbsPopover
          onRate={(r) => {
            onRate(item, r);
            onFeedback(item, r);
            setOpenPopover(null);
          }}
          onClose={() => setOpenPopover(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={() => setOpenPopover(item)}
        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-zinc-400 transition-colors active:scale-95"
      >
        {orderLabel}
      </button>
      <button
        onClick={() => {
          onRate(item, "down");
          onFeedback(item, "down");
        }}
        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 hover:text-rose-400 text-zinc-400 transition-colors active:scale-95"
      >
        {notForMeLabel}
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
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  function handleRate(item: string, rating: "up" | "down") {
    setRatedItems((prev) => new Map(prev).set(item, rating));
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
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
            <FeedbackControls
              item={rec.item}
              orderLabel="Ordered this"
              notForMeLabel="Not for me"
              onFeedback={onFeedback}
              ratedItems={ratedItems}
              onRate={handleRate}
              openPopover={openPopover}
              setOpenPopover={setOpenPopover}
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
          <FeedbackControls
            item={data.adventurePick.item}
            orderLabel="Tried it"
            notForMeLabel="Not my thing"
            onFeedback={onFeedback}
            ratedItems={ratedItems}
            onRate={handleRate}
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
          />
        </div>
      </div>
    </div>
  );
}
