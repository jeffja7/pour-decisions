import Anthropic from "@anthropic-ai/sdk";
import { ANALYZE_PROFILE_PROMPT } from "@/lib/prompts";
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
    const { description, anchors } = await request.json();

    const userMessage = `Here is my taste description: "${description}"

${anchors?.length > 0 ? `Specific wines/beers I've enjoyed: ${anchors.join(", ")}` : ""}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: ANALYZE_PROFILE_PROMPT,
      messages: [{ role: "user", content: userMessage }],
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

    return Response.json({ extractedPreferences: parsed });
  } catch (e) {
    console.error("analyze-profile error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
