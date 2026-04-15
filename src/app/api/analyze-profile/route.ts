import Anthropic from "@anthropic-ai/sdk";
import { ANALYZE_PROFILE_PROMPT } from "@/lib/prompts";
import { NextRequest } from "next/server";

interface DrinkImageInput {
  category: string;
  dataUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const { description, anchors, images } = await request.json();

    const hasImages = images && images.length > 0;

    // Build the message content
    const content: Anthropic.Messages.ContentBlockParam[] = [];

    // Add images first if present
    if (hasImages) {
      (images as DrinkImageInput[]).forEach((img, i) => {
        const dataUrl = img.dataUrl;
        const base64Data = dataUrl.includes(",")
          ? dataUrl.split(",")[1]
          : dataUrl;
        const prefix = dataUrl.split(",")[0] || "";

        let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
          "image/jpeg";
        if (prefix.includes("image/png")) mediaType = "image/png";
        else if (prefix.includes("image/webp")) mediaType = "image/webp";
        else if (prefix.includes("image/gif")) mediaType = "image/gif";

        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64Data },
        });
        content.push({
          type: "text",
          text: `[Photo ${i + 1}: a ${img.category} the user enjoys]`,
        });
      });
    }

    // Add the text description
    const hasDescription = description && description.trim().length > 0;
    let userText = "";

    if (hasDescription) {
      userText = `Here is my taste description: "${description}"`;
    }
    if (anchors?.length > 0) {
      userText += `\n\nSpecific wines/beers/cocktails I've enjoyed: ${anchors.join(", ")}`;
    }
    if (hasImages) {
      userText += `${userText ? "\n\n" : ""}I've uploaded ${images.length} photo(s) of drinks I enjoy. Please identify each drink from the photos and build my taste profile based on what you see.`;
    }
    if (!userText.trim()) {
      userText = "Please analyze the uploaded photos to build my taste profile.";
    }
    content.push({ type: "text", text: userText });

    // Use a prompt that also asks to identify drinks from photos
    const systemPrompt = hasImages
      ? ANALYZE_PROFILE_PROMPT +
        `\n\nIMPORTANT: The user has uploaded photos of drinks they enjoy. Identify each drink from the photos (brand, name, style, variety). Include an "identifiedDrinks" field in your response that maps each category to an array of identified drink names. Format:
{
  "wine": { ... },
  "beer": { ... },
  "cocktails": { ... },
  "identifiedDrinks": {
    "wine": ["Identified Wine Name 1"],
    "beer": ["Identified Beer Name 1"],
    "cocktails": ["Identified Cocktail Name 1"]
  }
}
Use the identified drinks to also inform the preference extraction (styles, attributes, etc).`
      : ANALYZE_PROFILE_PROMPT;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code block wrappers if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse profile" },
        { status: 500 }
      );
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // Separate identifiedDrinks from extractedPreferences
    const { identifiedDrinks, ...extractedPreferences } = parsed;

    return Response.json({
      extractedPreferences,
      identifiedDrinks: identifiedDrinks || {},
    });
  } catch (e) {
    console.error("analyze-profile error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
