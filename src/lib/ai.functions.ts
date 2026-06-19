import { createServerFn } from "@tanstack/react-start";

export interface PotholeAnalysis {
  isPothole: boolean;
  severity: "minor" | "moderate" | "severe" | "dangerous";
  sizeEstimate: string;
  analysis: string;
  confidence: number;
}

const SYSTEM = `You are a civic road-infrastructure inspector for Bengaluru's municipal body (BBMP).
You analyze a single photo of a road defect and estimate its severity for pothole repair prioritization.
Return STRICT JSON only, no markdown, with keys:
- isPothole (boolean): is a pothole / road defect clearly visible
- severity: one of "minor" | "moderate" | "severe" | "dangerous"
- sizeEstimate (string): short human estimate of size & depth, e.g. "~40cm wide, shallow"
- analysis (string): 1-2 concise sentences describing the defect and risk to vehicles
- confidence (number 0-1)
Severity guide: minor=cosmetic crack/shallow dip; moderate=noticeable pothole; severe=large deep hole risking vehicle damage; dangerous=immediate hazard to two-wheelers/safety.`;

export const analyzePothole = createServerFn({ method: "POST" })
  .inputValidator((data: { imageDataUrl: string }) => {
    if (!data?.imageDataUrl || typeof data.imageDataUrl !== "string") {
      throw new Error("imageDataUrl is required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<PotholeAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this road defect photo and return the JSON." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI usage limit reached. Please add credits to continue.");
    if (!res.ok) throw new Error(`AI analysis failed (${res.status})`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: Partial<PotholeAnalysis> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    const allowed = ["minor", "moderate", "severe", "dangerous"] as const;
    const severity = allowed.includes(parsed.severity as never) ? parsed.severity! : "moderate";
    return {
      isPothole: parsed.isPothole ?? true,
      severity,
      sizeEstimate: parsed.sizeEstimate ?? "Unknown",
      analysis: parsed.analysis ?? "Unable to determine details from the image.",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    };
  });