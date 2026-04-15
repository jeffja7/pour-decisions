"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Camera from "@/components/Camera";
import RecommendationCards from "@/components/RecommendationCards";
import BottomNav from "@/components/BottomNav";
import {
  isOnboarded,
  getProfile,
  getRecentFeedback,
  addScanToHistory,
  addFeedbackToScan,
} from "@/lib/storage";
import { RecommendationResponse } from "@/lib/types";

export default function ScanPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnboarded()) {
      router.push("/onboarding");
    } else {
      setReady(true);
    }
  }, [router]);

  const handleCapture = useCallback(
    async (imageData: string) => {
      setLoading(true);
      setError(null);

      const profile = getProfile();
      if (!profile) {
        router.push("/onboarding");
        return;
      }

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageData,
            profile,
            recentFeedback: getRecentFeedback(),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || "Failed to get recommendations");
        }

        const data: RecommendationResponse = await res.json();
        setRecommendations(data);

        const scanId = Date.now().toString(36);
        setCurrentScanId(scanId);
        addScanToHistory({
          id: scanId,
          timestamp: Date.now(),
          menuType: "unknown",
          recommendations: data,
          feedback: [],
        });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Something went wrong. Try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleFeedback = useCallback(
    (item: string, rating: "up" | "down") => {
      if (!currentScanId) return;
      addFeedbackToScan(currentScanId, {
        item,
        rating,
        timestamp: Date.now(),
        menuType: "unknown",
      });
    },
    [currentScanId]
  );

  const handleDismiss = useCallback(() => {
    setRecommendations(null);
    setCurrentScanId(null);
    setError(null);
  }, []);

  if (!ready) return null;

  return (
    <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-24">
      <div className="w-full max-w-lg">
        {!loading && !recommendations && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">
                PourDecision
              </h1>
              <p className="text-zinc-500 text-sm">
                Snap a wine or beer list for personalized picks
              </p>
            </div>
            <Camera onCapture={handleCapture} />
          </>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-zinc-300 font-medium">Analyzing menu...</p>
              <p className="text-zinc-500 text-sm mt-1">
                Finding your perfect pour
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12 space-y-4">
            <p className="text-rose-400">{error}</p>
            <button
              onClick={handleDismiss}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {recommendations && (
          <RecommendationCards
            data={recommendations}
            onFeedback={handleFeedback}
            onDismiss={handleDismiss}
          />
        )}
      </div>
      <BottomNav />
    </main>
  );
}
