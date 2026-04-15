"use client";

import { useState } from "react";
import { TasteProfile, Category } from "@/lib/types";
import { saveProfile, setOnboarded } from "@/lib/storage";
import { useRouter } from "next/navigation";

interface CategoryInput {
  enabled: boolean;
  description: string;
  anchors: string;
}

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; icon: string; placeholder: string; anchorsPlaceholder: string }
> = {
  wine: {
    label: "Wine",
    color: "text-violet-400 border-violet-500/50 bg-violet-500/10",
    icon: "🍷",
    placeholder:
      "e.g., I love big bold reds — Malbecs and Cab Sauvs. For whites, I like buttery Chardonnays but not super sweet Rieslings.",
    anchorsPlaceholder: "e.g., Catena Zapata Malbec, Caymus Cab, Cakebread Chardonnay",
  },
  beer: {
    label: "Beer",
    color: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    icon: "🍺",
    placeholder:
      "e.g., I'm into hazy IPAs and Belgian whites. Not a fan of super bitter or heavy stouts.",
    anchorsPlaceholder: "e.g., Tree House Julius, Allagash White, Sierra Nevada Pale Ale",
  },
  cocktails: {
    label: "Cocktails",
    color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
    icon: "🍸",
    placeholder:
      "e.g., I love spirit-forward drinks like Old Fashioneds and Negronis. I also enjoy a good mezcal cocktail.",
    anchorsPlaceholder: "e.g., Old Fashioned, Negroni, Penicillin, Paper Plane",
  },
};

const ALL_CATEGORIES: Category[] = ["wine", "beer", "cocktails"];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"categories" | "details" | "loading">(
    "categories"
  );
  const [inputs, setInputs] = useState<Record<Category, CategoryInput>>({
    wine: { enabled: false, description: "", anchors: "" },
    beer: { enabled: false, description: "", anchors: "" },
    cocktails: { enabled: false, description: "", anchors: "" },
  });
  const [error, setError] = useState<string | null>(null);

  const enabledCategories = ALL_CATEGORIES.filter((c) => inputs[c].enabled);

  function toggleCategory(cat: Category) {
    setInputs((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], enabled: !prev[cat].enabled },
    }));
  }

  function updateInput(cat: Category, field: "description" | "anchors", value: string) {
    setInputs((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: value },
    }));
  }

  const canProceedToDetails = enabledCategories.length > 0;
  const canSubmit = enabledCategories.every(
    (c) => inputs[c].description.trim().length > 0
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("loading");
    setError(null);

    try {
      // Build combined description for API
      const descriptions = enabledCategories.map(
        (c) => `${CATEGORY_CONFIG[c].label}: ${inputs[c].description}`
      );
      const allAnchors = enabledCategories.flatMap((c) =>
        inputs[c].anchors
          .split(/[,\n]/)
          .map((a) => a.trim())
          .filter(Boolean)
      );

      const res = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: descriptions.join("\n\n"),
          anchors: allAnchors,
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze profile");
      const data = await res.json();

      const categories: TasteProfile["categories"] = {};
      for (const cat of enabledCategories) {
        categories[cat] = {
          description: inputs[cat].description,
          anchors: inputs[cat].anchors
            .split(/[,\n]/)
            .map((a) => a.trim())
            .filter(Boolean),
        };
      }

      const profile: TasteProfile = {
        categories,
        extractedPreferences: {
          wine: data.extractedPreferences.wine || { styles: [], grapes: [], regions: [], attributes: [] },
          beer: data.extractedPreferences.beer || { styles: [], breweries: [], attributes: [] },
          cocktails: data.extractedPreferences.cocktails || { styles: [], spirits: [], attributes: [] },
        },
      };

      saveProfile(profile);
      setOnboarded();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("details");
    }
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Building your taste profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">PourDecision</h1>
        <p className="text-zinc-400">Your AI sommelier & beer advisor</p>
      </div>

      {step === "categories" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              What do you drink?
            </label>
            <p className="text-xs text-zinc-500">
              Select the categories you want recommendations for.
            </p>
          </div>

          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const selected = inputs[cat].enabled;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? config.color
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                  }`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="font-medium text-lg">{config.label}</span>
                  {selected && (
                    <svg
                      className="w-5 h-5 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep("details")}
            disabled={!canProceedToDetails}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="space-y-6">
          {enabledCategories.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <div
                key={cat}
                className="space-y-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30"
              >
                <h3 className={`font-medium flex items-center gap-2 ${config.color.split(" ")[0]}`}>
                  <span>{config.icon}</span>
                  {config.label}
                </h3>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">
                    Describe what you like
                  </label>
                  <textarea
                    value={inputs[cat].description}
                    onChange={(e) =>
                      updateInput(cat, "description", e.target.value)
                    }
                    placeholder={config.placeholder}
                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder:text-zinc-700 focus:border-violet-500 focus:outline-none resize-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">
                    Name specific favorites (optional)
                  </label>
                  <input
                    value={inputs[cat].anchors}
                    onChange={(e) =>
                      updateInput(cat, "anchors", e.target.value)
                    }
                    placeholder={config.anchorsPlaceholder}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder:text-zinc-700 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            );
          })}

          {error && (
            <p className="text-rose-400 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("categories")}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
            >
              Build My Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
