import Anthropic from "@anthropic-ai/sdk";
import { buildRecommendationPrompt } from "@/lib/prompts";
import { TasteProfile, FeedbackEntry } from "@/lib/types";
import { NextRequest } from "next/server";

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
    const {
      image,
      profile,
      recentFeedback,
    }: {
      image: string;
      profile: TasteProfile;
      recentFeedback: FeedbackEntry[];
    } = await request.json();

    const systemPrompt = buildRecommendationPrompt(profile, recentFeedback);

    // Strip data URL prefix and detect media type
    let base64Data: string;
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";

    if (image.includes(",")) {
      const prefix = image.split(",")[0]; // e.g. "data:image/png;base64"
      base64Data = image.split(",")[1];
      if (prefix.includes("image/png")) mediaType = "image/png";
      else if (prefix.includes("image/webp")) mediaType = "image/webp";
      else if (prefix.includes("image/gif")) mediaType = "image/gif";
    } else {
      base64Data = image;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: "Here is the wine/beer list. Please analyze it and give me your recommendations based on my taste profile.",
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (Claude sometimes wraps in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse recommendations" },
        { status: 500 }
      );
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    return Response.json(recommendations);
  } catch (e) {
    console.error("recommend error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
