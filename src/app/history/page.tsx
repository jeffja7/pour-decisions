"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getRatedItems, isOnboarded, RatedItem } from "@/lib/storage";

type Filter = "all" | "liked" | "passed";

function formatDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const dayDiff = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      86400000
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff} days ago`;
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)}w ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function ThumbIcon({ rating }: { rating: "up" | "down" }) {
  if (rating === "up") {
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m-3.94 7.318c.534-.087 1.043-.227 1.523-.413a8.97 8.97 0 0 0 4.95-7.443A8.96 8.96 0 0 0 17.69 9H21a.75.75 0 0 1 .75.75 12.04 12.04 0 0 1-1.025 5.064c-.435 1.058-1.42 1.711-2.479 1.815-.487.05-.974.06-1.461.045a4.5 4.5 0 0 0-1.418.252l-2.247.749a4.5 4.5 0 0 1-1.423.23H6.504c-.618 0-1.217-.247-1.605-.729A11.95 11.95 0 0 1 2.25 12c0-.84.099-1.659.288-2.448.27-1.122 1.297-1.802 2.45-1.802h1.058a4.5 4.5 0 0 1 1.467.247l2.247.749a4.5 4.5 0 0 0 1.423.23H13.5"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-rose-900/40 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4 text-rose-400"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 0 1-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54m.023-8.25H16.48a4.5 4.5 0 0 1-1.423-.23l-3.114-1.04a4.5 4.5 0 0 0-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 0 0 2.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.5a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"
        />
      </svg>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
        active
          ? "bg-zinc-800 text-white"
          : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label} <span className="opacity-60">{count}</span>
    </button>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<RatedItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOnboarded()) {
      router.push("/onboarding");
      return;
    }
    setItems(getRatedItems());
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const liked = items.filter((i) => i.rating === "up");
  const passed = items.filter((i) => i.rating === "down");

  const filtered =
    filter === "all" ? items : filter === "liked" ? liked : passed;

  return (
    <main className="flex-1 px-4 pt-14 pb-24">
      <div className="w-full max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="text-center space-y-1 animate-fade-in">
          <h1 className="text-xl font-bold text-white">Tasting Log</h1>
          <p className="text-zinc-500 text-sm">
            {items.length === 0
              ? "Your rated drinks will appear here"
              : `${items.length} ${items.length === 1 ? "drink" : "drinks"} rated`}
          </p>
        </div>

        {/* Filter chips */}
        {items.length > 0 && (
          <div className="flex gap-2 animate-fade-in">
            <FilterChip
              label="All"
              count={items.length}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterChip
              label="Liked"
              count={liked.length}
              active={filter === "liked"}
              onClick={() => setFilter("liked")}
            />
            <FilterChip
              label="Passed"
              count={passed.length}
              active={filter === "passed"}
              onClick={() => setFilter("passed")}
            />
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-3xl">
              📓
            </div>
            <p className="text-zinc-400 text-sm text-center max-w-xs">
              Once you rate a drink after a scan, it&apos;ll show up here so
              you can look back at your favorites.
            </p>
          </div>
        )}

        {/* Filtered empty state */}
        {items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-zinc-500 text-sm">
              No {filter === "liked" ? "liked" : "passed"} drinks yet.
            </p>
          </div>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <div
                key={`${item.scanId}-${item.item}-${item.timestamp}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <ThumbIcon rating={item.rating} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium text-sm leading-snug">
                      {item.item}
                    </p>
                    <span className="text-zinc-600 text-xs flex-shrink-0 mt-0.5">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
