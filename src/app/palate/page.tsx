"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import {
  getProfile,
  getHistory,
  getRecentFeedback,
  clearAllData,
  isOnboarded,
} from "@/lib/storage";
import { TasteProfile, ScanHistoryEntry, FeedbackEntry, Category } from "@/lib/types";

const CATEGORY_LABELS: Record<
  Category,
  { label: string; icon: string; color: string; bgColor: string; tagBg: string; tagText: string }
> = {
  wine: {
    label: "Wine",
    icon: "🍷",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    tagBg: "bg-violet-500/15",
    tagText: "text-violet-300",
  },
  beer: {
    label: "Beer",
    icon: "🍺",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    tagBg: "bg-amber-500/15",
    tagText: "text-amber-300",
  },
  cocktails: {
    label: "Cocktails",
    icon: "🍸",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    tagBg: "bg-emerald-500/15",
    tagText: "text-emerald-300",
  },
};

function getExtractedTags(profile: TasteProfile, cat: Category): string[] {
  const tags: string[] = [];
  if (cat === "wine") {
    const p = profile.extractedPreferences.wine;
    tags.push(...p.styles, ...p.grapes, ...p.regions, ...p.attributes);
  } else if (cat === "beer") {
    const p = profile.extractedPreferences.beer;
    tags.push(...p.styles, ...p.breweries, ...p.attributes);
  } else if (cat === "cocktails") {
    const p = profile.extractedPreferences.cocktails;
    tags.push(...p.styles, ...p.spirits, ...p.attributes);
  }
  return tags;
}

export default function PalatePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOnboarded()) {
      router.push("/onboarding");
      return;
    }
    setProfile(getProfile());
    setHistory(getHistory());
    setFeedback(getRecentFeedback());
  }, [router]);

  function handleReset() {
    clearAllData();
    router.push("/onboarding");
  }

  if (!profile) return null;

  const likedItems = feedback.filter((f) => f.rating === "up");
  const dislikedItems = feedback.filter((f) => f.rating === "down");
  const enabledCategories = Object.keys(profile.categories) as Category[];

  return (
    <main className="flex-1 px-4 pt-14 pb-24">
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center gap-3">
            {enabledCategories.map((cat) => {
              const config = CATEGORY_LABELS[cat];
              return (
                <div
                  key={cat}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${config.bgColor}`}
                >
                  {config.icon}
                </div>
              );
            })}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">My Palate</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {enabledCategories.map((c) => CATEGORY_LABELS[c].label).join(" & ")}{" "}
              enthusiast
            </p>
          </div>
        </div>

        {/* Compact Stats */}
        {feedback.length > 0 && (
          <div className="flex items-center justify-center gap-6 py-3 animate-fade-in">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">
                {history.length}
              </p>
              <p className="text-zinc-500 text-xs">Scans</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-400">
                {likedItems.length}
              </p>
              <p className="text-zinc-500 text-xs">Liked</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-lg font-semibold text-rose-400">
                {dislikedItems.length}
              </p>
              <p className="text-zinc-500 text-xs">Passed</p>
            </div>
          </div>
        )}

        {/* Category Cards */}
        {enabledCategories.map((cat, i) => {
          const catData = profile.categories[cat];
          const config = CATEGORY_LABELS[cat];
          const tags = getExtractedTags(profile, cat);
          if (!catData) return null;

          return (
            <div
              key={cat}
              className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <h2 className={`font-medium ${config.color}`}>
                  {config.label}
                </h2>
              </div>

              {catData.description && (
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {catData.description}
                </p>
              )}

              {/* Anchor drinks as colored pill tags */}
              {catData.anchors.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {catData.anchors.map((a, j) => (
                    <span
                      key={j}
                      className={`text-xs px-2.5 py-1 rounded-full ${config.tagBg} ${config.tagText}`}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Extracted preferences as muted flat tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 pt-4 animate-fade-in">
          <button
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-full transition-colors text-sm active:scale-95"
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
              />
            </svg>
            Edit Preferences
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-zinc-600 hover:text-rose-400 text-xs transition-colors"
            >
              Reset All Data
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-full text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-900/50 text-rose-400 font-medium rounded-full text-sm"
              >
                Yes, Reset
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
