import { readFile } from "node:fs/promises";
import OpenAI, { toFile } from "openai";
import { RestorationMode, RestorationProviderResult } from "@/lib/restoration-types";

const RESTORATION_PROMPT = [
  "Restore this old damaged photograph into a realistic high-definition image while preserving identity, emotions, authenticity, skin texture, clothing details, facial structure, age, expression, and historical accuracy.",
  "Remove scratches, dust, stains, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Improve facial clarity, lighting, sharpness, contrast, and color balance naturally.",
  "If the image is black and white, colorize it with historically plausible colors.",
  "Do not beautify, modernize, alter age, change facial identity, over-smooth skin, invent unrealistic details, or make the result look artificially generated.",
  "Preserve the original composition and emotional tone."
].join(" ");

export function hasOpenAIImageConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function restoreWithOpenAIProvider(sourceImagePath: string, mode: RestorationMode): Promise<RestorationProviderResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
  const quality =
    mode === "hd"
      ? process.env.OPENAI_IMAGE_HD_QUALITY ?? "high"
      : process.env.OPENAI_IMAGE_PREVIEW_QUALITY ?? "low";
  const inputFidelity =
    mode === "hd"
      ? process.env.OPENAI_HD_INPUT_FIDELITY ?? "high"
      : process.env.OPENAI_PREVIEW_INPUT_FIDELITY ?? "low";

  const imageBuffer = await readFile(sourceImagePath);
  const imageFile = await toFile(imageBuffer, filenameForMime(sourceImagePath), {
    type: mimeTypeForPath(sourceImagePath)
  });

  const response = await client.images.edit({
    model,
    image: imageFile,
    prompt: RESTORATION_PROMPT,
    quality: quality as "low" | "medium" | "high" | "auto",
    size: "auto",
    output_format: "jpeg",
    input_fidelity: inputFidelity as "low" | "high",
    user: `yaadein-${mode}`
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image edit returned no image data.");
  }

  return {
    provider: "openai",
    buffer: Buffer.from(b64, "base64"),
    estimatedCostUsd: estimateOpenAIImageCost(mode)
  };
}

export { RESTORATION_PROMPT };

function estimateOpenAIImageCost(mode: RestorationMode) {
  const envValue = mode === "hd" ? process.env.OPENAI_HD_ESTIMATED_COST_USD : process.env.OPENAI_PREVIEW_ESTIMATED_COST_USD;
  if (envValue) return Number(envValue);
  return mode === "hd" ? 0.2 : 0.11;
}

function mimeTypeForPath(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function filenameForMime(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "source.png";
  if (lower.endsWith(".webp")) return "source.webp";
  return "source.jpg";
}
