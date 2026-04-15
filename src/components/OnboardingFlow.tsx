"use client";

import { useState, useRef, useCallback } from "react";
import { TasteProfile, Category } from "@/lib/types";
import { saveProfile, setOnboarded } from "@/lib/storage";
import { useRouter } from "next/navigation";

// Compress an image to max 800px on longest side, JPEG quality 0.7
function compressImage(dataUrl: string, maxSize = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

interface DrinkImage {
  id: string;
  dataUrl: string;
  thumbnail: string;
}

interface CategoryInput {
  enabled: boolean;
  description: string;
  anchors: string;
  images: DrinkImage[];
}

const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    color: string;
    icon: string;
    placeholder: string;
    anchorsPlaceholder: string;
    photoHint: string;
  }
> = {
  wine: {
    label: "Wine",
    color: "text-violet-400 border-violet-500/50 bg-violet-500/10",
    icon: "🍷",
    placeholder:
      "e.g., I love big bold reds — Malbecs and Cab Sauvs. For whites, I like buttery Chardonnays but not super sweet Rieslings.",
    anchorsPlaceholder:
      "e.g., Catena Zapata Malbec, Caymus Cab, Cakebread Chardonnay",
    photoHint: "Snap a bottle or label",
  },
  beer: {
    label: "Beer",
    color: "text-amber-400 border-amber-500/50 bg-amber-500/10",
    icon: "🍺",
    placeholder:
      "e.g., I'm into hazy IPAs and Belgian whites. Not a fan of super bitter or heavy stouts.",
    anchorsPlaceholder:
      "e.g., Tree House Julius, Allagash White, Sierra Nevada Pale Ale",
    photoHint: "Snap a can, bottle, or tap",
  },
  cocktails: {
    label: "Cocktails",
    color: "text-emerald-400 border-emerald-500/50 bg-emerald-500/10",
    icon: "🍸",
    placeholder:
      "e.g., I love spirit-forward drinks like Old Fashioneds and Negronis. I also enjoy a good mezcal cocktail.",
    anchorsPlaceholder: "e.g., Old Fashioned, Negroni, Penicillin, Paper Plane",
    photoHint: "Snap a drink or bottle",
  },
};

const ALL_CATEGORIES: Category[] = ["wine", "beer", "cocktails"];

function ImageThumbnail({
  image,
  onRemove,
}: {
  image: DrinkImage;
  onRemove: () => void;
}) {
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
      <img
        src={image.thumbnail}
        alt="Uploaded drink"
        className="w-full h-full object-cover"
      />
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-400 text-xs"
      >
        ×
      </button>
    </div>
  );
}

interface OnboardingFlowProps {
  existingProfile?: TasteProfile | null;
}

function buildInitialInputs(profile?: TasteProfile | null): Record<Category, CategoryInput> {
  const defaults: Record<Category, CategoryInput> = {
    wine: { enabled: false, description: "", anchors: "", images: [] },
    beer: { enabled: false, description: "", anchors: "", images: [] },
    cocktails: { enabled: false, description: "", anchors: "", images: [] },
  };

  if (!profile) return defaults;

  for (const cat of ALL_CATEGORIES) {
    const catData = profile.categories[cat];
    if (catData) {
      defaults[cat] = {
        enabled: true,
        description: catData.description,
        anchors: catData.anchors.join(", "),
        images: [],
      };
    }
  }

  return defaults;
}

export default function OnboardingFlow({ existingProfile }: OnboardingFlowProps) {
  const router = useRouter();
  const isEditing = !!existingProfile;
  const [step, setStep] = useState<"categories" | "details" | "loading">(
    isEditing ? "details" : "categories"
  );
  const [inputs, setInputs] = useState<Record<Category, CategoryInput>>(
    () => buildInitialInputs(existingProfile)
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(
    "Building your taste profile..."
  );
  const fileInputRefs = useRef<Record<Category, HTMLInputElement | null>>({
    wine: null,
    beer: null,
    cocktails: null,
  });

  const enabledCategories = ALL_CATEGORIES.filter((c) => inputs[c].enabled);

  function toggleCategory(cat: Category) {
    setInputs((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], enabled: !prev[cat].enabled },
    }));
  }

  function updateInput(
    cat: Category,
    field: "description" | "anchors",
    value: string
  ) {
    setInputs((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: value },
    }));
  }

  const handleImageUpload = useCallback(
    async (cat: Category, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        const reader = new FileReader();
        const rawDataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Compress for API (800px) and thumbnail (200px)
        const [compressed, thumb] = await Promise.all([
          compressImage(rawDataUrl, 800),
          compressImage(rawDataUrl, 200),
        ]);

        const id =
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 5);

        setInputs((prev) => ({
          ...prev,
          [cat]: {
            ...prev[cat],
            images: [
              ...prev[cat].images,
              { id, dataUrl: compressed, thumbnail: thumb },
            ],
          },
        }));
      }

      // Reset the input so the same file can be re-selected
      e.target.value = "";
    },
    []
  );

  function removeImage(cat: Category, imageId: string) {
    setInputs((prev) => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        images: prev[cat].images.filter((img) => img.id !== imageId),
      },
    }));
  }

  const canProceedToDetails = enabledCategories.length > 0;
  const canSubmit = enabledCategories.every(
    (c) =>
      inputs[c].description.trim().length > 0 ||
      inputs[c].images.length > 0
  );

  const totalImages = enabledCategories.reduce(
    (sum, c) => sum + inputs[c].images.length,
    0
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("loading");
    setError(null);

    try {
      // If there are images, update loading message
      if (totalImages > 0) {
        setLoadingMessage("Analyzing your drink photos...");
      }

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

      // Collect all images with their category context
      const allImages = enabledCategories.flatMap((c) =>
        inputs[c].images.map((img) => ({
          category: c,
          dataUrl: img.dataUrl,
        }))
      );

      const res = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: descriptions.join("\n\n"),
          anchors: allAnchors,
          images: allImages,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to analyze profile");
      }
      const data = await res.json();

      const categories: TasteProfile["categories"] = {};
      for (const cat of enabledCategories) {
        // Merge text anchors with any AI-identified drinks from photos
        const textAnchors = inputs[cat].anchors
          .split(/[,\n]/)
          .map((a) => a.trim())
          .filter(Boolean);

        const photoAnchors = data.identifiedDrinks?.[cat] || [];

        categories[cat] = {
          description: inputs[cat].description,
          anchors: [...textAnchors, ...photoAnchors],
        };
      }

      const profile: TasteProfile = {
        categories,
        extractedPreferences: {
          wine: data.extractedPreferences.wine || {
            styles: [],
            grapes: [],
            regions: [],
            attributes: [],
          },
          beer: data.extractedPreferences.beer || {
            styles: [],
            breweries: [],
            attributes: [],
          },
          cocktails: data.extractedPreferences.cocktails || {
            styles: [],
            spirits: [],
            attributes: [],
          },
        },
      };

      saveProfile(profile);
      setOnboarded();
      router.push("/");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
      setStep("details");
    }
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">PourDecision</h1>
        <p className="text-zinc-400">
          {isEditing ? "Update your taste profile" : "Your AI sommelier & beer advisor"}
        </p>
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
                <h3
                  className={`font-medium flex items-center gap-2 ${config.color.split(" ")[0]}`}
                >
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

                {/* Photo upload section */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500">
                    Upload photos of drinks you like (optional)
                  </label>

                  {/* Image thumbnails */}
                  {inputs[cat].images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {inputs[cat].images.map((img) => (
                        <ImageThumbnail
                          key={img.id}
                          image={img}
                          onRemove={() => removeImage(cat, img.id)}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRefs.current[cat]?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-500 hover:text-zinc-300 text-sm transition-colors w-full justify-center"
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
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                      />
                    </svg>
                    {config.photoHint}
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[cat] = el; }}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(cat, e)}
                    className="hidden"
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
              {isEditing ? "Update Profile" : "Build My Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
