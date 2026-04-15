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

const CATEGORY_LABELS: Record<Category, { label: string; icon: string; color: string }> = {
  wine: { label: "Wine", icon: "🍷", color: "text-violet-400" },
  beer: { label: "Beer", icon: "🍺", color: "text-amber-400" },
  cocktails: { label: "Cocktails", icon: "🍸", color: "text-emerald-400" },
};

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
    <main className="flex-1 px-4 pt-12 pb-24">
      <div className="w-full max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white">My Palate</h1>

        {/* Category Descriptions */}
        {enabledCategories.map((cat) => {
          const catData = profile.categories[cat];
          const config = CATEGORY_LABELS[cat];
          if (!catData) return null;
          return (
            <section key={cat} className="space-y-2">
              <h2 className={`text-sm font-medium uppercase tracking-wider flex items-center gap-2 ${config.color}`}>
                <span>{config.icon}</span> {config.label}
              </h2>
              <p className="text-zinc-300 text-sm bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                {catData.description}
              </p>
              {catData.anchors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {catData.anchors.map((a, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* Extracted Preferences */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            Extracted Taste Profile
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {profile.categories.wine &&
              (profile.extractedPreferences.wine.styles.length > 0 ||
                profile.extractedPreferences.wine.grapes.length > 0) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="text-violet-400 font-medium text-sm">🍷 Wine</h3>
                  {profile.extractedPreferences.wine.styles.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Styles: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.wine.styles.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.wine.grapes.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Grapes: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.wine.grapes.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.wine.regions.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Regions: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.wine.regions.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.wine.attributes.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Attributes: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.wine.attributes.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

            {profile.categories.beer &&
              (profile.extractedPreferences.beer.styles.length > 0 ||
                profile.extractedPreferences.beer.breweries.length > 0) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="text-amber-400 font-medium text-sm">🍺 Beer</h3>
                  {profile.extractedPreferences.beer.styles.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Styles: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.beer.styles.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.beer.breweries.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Breweries: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.beer.breweries.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.beer.attributes.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Attributes: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.beer.attributes.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

            {profile.categories.cocktails &&
              (profile.extractedPreferences.cocktails.styles.length > 0 ||
                profile.extractedPreferences.cocktails.spirits.length > 0) && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <h3 className="text-emerald-400 font-medium text-sm">🍸 Cocktails</h3>
                  {profile.extractedPreferences.cocktails.styles.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Styles: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.cocktails.styles.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.cocktails.spirits.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Spirits: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.cocktails.spirits.join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.extractedPreferences.cocktails.attributes.length > 0 && (
                    <div>
                      <span className="text-zinc-500 text-xs">Attributes: </span>
                      <span className="text-zinc-300 text-sm">
                        {profile.extractedPreferences.cocktails.attributes.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </section>

        {/* Feedback Stats */}
        {feedback.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Your History
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <p className="text-xl font-bold text-white">{history.length}</p>
                <p className="text-zinc-500 text-xs">Scans</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <p className="text-xl font-bold text-emerald-400">
                  {likedItems.length}
                </p>
                <p className="text-zinc-500 text-xs">Liked</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <p className="text-xl font-bold text-rose-400">
                  {dislikedItems.length}
                </p>
                <p className="text-zinc-500 text-xs">Passed</p>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="space-y-3 pt-4">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
          >
            Update My Preferences
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-3 text-zinc-600 hover:text-rose-400 text-sm transition-colors"
            >
              Reset All Data
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-rose-900/50 text-rose-400 font-medium rounded-xl"
              >
                Yes, Reset
              </button>
            </div>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
