import OpenAI, { toFile } from "openai";
import { RestorationMode, RestorationProviderResult, RestorationStyle } from "@/lib/restoration-types";
import { readStoredImageBuffer } from "@/lib/storage-read";

const FAITHFUL_RESTORE_PROMPT = [
  "Restore this old damaged photograph into a realistic high-definition image while preserving identity, emotions, authenticity, skin texture, clothing details, facial structure, age, expression, and historical accuracy.",
  "Remove scratches, dust, stains, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Improve facial clarity, lighting, sharpness, contrast, and color balance naturally.",
  "Keep black-and-white photos black and white unless color is clearly present in the source.",
  "Preserve the original composition, crop, pose, background, clothing, expression, face shape, and emotional tone.",
  "Do not beautify, modernize, alter age, change facial identity, over-smooth skin, invent unrealistic details, or make the result look artificially generated."
].join(" ");

const MEMORY_RECREATE_PROMPT = [
  "Create a beautiful realistic high-definition AI restoration based on this old damaged photograph.",
  "Remove scratches, dust, stains, pen marks, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Reconstruct missing details only where the original is badly damaged or unreadable, while preserving the person's likely identity, age, expression, clothing style, and historical feel.",
  "Colorize black-and-white photos with historically plausible colors and natural lighting.",
  "Make the result emotionally warm and shareable, but avoid a plastic, over-smoothed, cartoon, or obviously generated look.",
  "Preserve the original portrait framing unless repair requires subtle cropping."
].join(" ");

export const RESTORATION_PROMPT = FAITHFUL_RESTORE_PROMPT;

export function hasOpenAIImageConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function restoreWithOpenAIProvider(
  sourceImagePath: string,
  mode: RestorationMode,
  style: RestorationStyle
): Promise<RestorationProviderResult> {
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

  const imageBuffer = await readStoredImageBuffer(sourceImagePath);
  const imageFile = await toFile(imageBuffer, filenameForMime(sourceImagePath), {
    type: mimeTypeForPath(sourceImagePath)
  });

  const response = await client.images.edit({
    model,
    image: imageFile,
    prompt: promptForStyle(style),
    quality: quality as "low" | "medium" | "high" | "auto",
    size: "auto",
    output_format: "jpeg",
    input_fidelity: inputFidelity as "low" | "high",
    user: `yaadein-${mode}-${style}`
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

function promptForStyle(style: RestorationStyle) {
  return style === "recreate" ? MEMORY_RECREATE_PROMPT : FAITHFUL_RESTORE_PROMPT;
}

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
