import { TasteProfile, FeedbackEntry } from "./types";

export function buildRecommendationPrompt(
  profile: TasteProfile,
  recentFeedback: FeedbackEntry[]
): string {
  const feedbackSummary =
    recentFeedback.length > 0
      ? `\n\nRecent ordering history and feedback:\n${recentFeedback
          .map(
            (f) =>
              `- ${f.item}: ${f.rating === "up" ? "Enjoyed" : f.rating === "down" ? "Didn't enjoy" : "Skipped"}`
          )
          .join("\n")}`
      : "";

  // Build category-specific preference sections
  const categorySections: string[] = [];

  if (profile.categories.wine) {
    categorySections.push(`Wine preferences:
- Their words: "${profile.categories.wine.description}"
${profile.categories.wine.anchors.length > 0 ? `- Favorites: ${profile.categories.wine.anchors.join(", ")}` : ""}
- Styles: ${profile.extractedPreferences.wine.styles.join(", ") || "Not specified"}
- Grapes: ${profile.extractedPreferences.wine.grapes.join(", ") || "Not specified"}
- Regions: ${profile.extractedPreferences.wine.regions.join(", ") || "Not specified"}
- Attributes: ${profile.extractedPreferences.wine.attributes.join(", ") || "Not specified"}`);
  }

  if (profile.categories.beer) {
    categorySections.push(`Beer preferences:
- Their words: "${profile.categories.beer.description}"
${profile.categories.beer.anchors.length > 0 ? `- Favorites: ${profile.categories.beer.anchors.join(", ")}` : ""}
- Styles: ${profile.extractedPreferences.beer.styles.join(", ") || "Not specified"}
- Breweries: ${profile.extractedPreferences.beer.breweries.join(", ") || "Not specified"}
- Attributes: ${profile.extractedPreferences.beer.attributes.join(", ") || "Not specified"}`);
  }

  if (profile.categories.cocktails) {
    categorySections.push(`Cocktail preferences:
- Their words: "${profile.categories.cocktails.description}"
${profile.categories.cocktails.anchors.length > 0 ? `- Favorites: ${profile.categories.cocktails.anchors.join(", ")}` : ""}
- Styles: ${profile.extractedPreferences.cocktails.styles.join(", ") || "Not specified"}
- Spirits: ${profile.extractedPreferences.cocktails.spirits.join(", ") || "Not specified"}
- Attributes: ${profile.extractedPreferences.cocktails.attributes.join(", ") || "Not specified"}`);
  }

  return `You are an expert sommelier, cicerone (beer expert), and mixologist helping someone choose from a menu.

## User's Taste Profile

${categorySections.join("\n\n")}
${feedbackSummary}

## Instructions

1. Read the menu in the photo carefully. Extract every item you can see.
2. Based on the user's taste profile and history, select your TOP 2 recommendations — the two items on this menu that best match what they'd enjoy. These should represent different moods or styles (e.g., one bold, one lighter) so the user has a meaningful choice.
3. Also select ONE adventure pick — something outside their usual zone they might enjoy. Calibrate how adventurous based on their feedback history.
4. For each recommendation, explain WHY in one concise sentence that teaches the user something.
5. IMPORTANT: Return EXACTLY 2 top picks and 1 adventure pick. No more.

Respond with ONLY valid JSON in this exact format:
{
  "menuItems": ["item1", "item2", ...],
  "topPicks": [
    {
      "item": "exact name from menu",
      "confidence": 0.85,
      "reason": "One sentence explaining why this matches and what to expect",
      "adventureLevel": "comfort"
    },
    {
      "item": "exact name from menu",
      "confidence": 0.75,
      "reason": "One sentence explaining why this is a different but great option",
      "adventureLevel": "comfort"
    }
  ],
  "adventurePick": {
    "item": "exact name from menu",
    "reason": "Why this is worth trying despite being outside their usual zone"
  }
}`;
}

export const ANALYZE_PROFILE_PROMPT = `You are an expert sommelier, cicerone (beer expert), and mixologist. The user is describing their taste preferences for specific drink categories. Extract a structured taste profile from their descriptions.

Respond with ONLY valid JSON in this exact format:
{
  "wine": {
    "styles": ["e.g., full-bodied reds", "dry whites"],
    "grapes": ["e.g., Malbec", "Cabernet Sauvignon"],
    "regions": ["e.g., Napa Valley", "Mendoza"],
    "attributes": ["e.g., bold", "tannic", "oaky", "fruity"]
  },
  "beer": {
    "styles": ["e.g., IPA", "Belgian Wit", "Stout"],
    "breweries": ["e.g., Tree House", "Hill Farmstead"],
    "attributes": ["e.g., hoppy", "hazy", "crisp", "malty"]
  },
  "cocktails": {
    "styles": ["e.g., Old Fashioned", "Sour", "Tiki"],
    "spirits": ["e.g., bourbon", "mezcal", "gin"],
    "attributes": ["e.g., spirit-forward", "refreshing", "bitter", "sweet"]
  }
}

Only populate arrays for categories the user mentioned. Leave arrays empty for categories they didn't describe. Extract as much as you can infer — for example, if someone says "I like Malbecs", you can infer they like full-bodied reds, Argentine wine regions, bold/fruity attributes.`;
