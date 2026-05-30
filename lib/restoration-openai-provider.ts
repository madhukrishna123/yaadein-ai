import OpenAI, { toFile } from "openai";
import { RestorationMode, RestorationProviderResult, RestorationStyle } from "@/lib/restoration-types";
import { readStoredImageBuffer } from "@/lib/storage-read";

const NATURAL_ENHANCE_PROMPT = [
  "Enhance this photo naturally while keeping the same people and scene.",
  "Improve clarity, lighting, sharpness, color balance, noise, blur, and compression artifacts.",
  "Preserve the original face, expression, body shape, pose, clothing, background, framing, and camera angle.",
  "Do not recreate the photo, replace faces, beautify people, change facial structure, change body proportions, remove people, add people, crop in, or invent missing details.",
  "If details are too blurry to know, keep them softly natural instead of guessing.",
  "The result should look like a cleaner version of the original photo, not a new AI-generated photo."
].join(" ");

const MEMORY_RESTORE_PROMPT = [
  "Restore this old or damaged photograph into a realistic, clean, high-definition memory.",
  "Preserve the same people, identity, emotions, clothing, background, composition, and historical feeling.",
  "Remove scratches, dust, stains, fading, low light, noise, blur, and compression artifacts.",
  "Improve facial clarity, lighting, color balance, texture, and natural sharpness without changing who the people are.",
  "Colorize only when appropriate and keep colors natural and historically plausible.",
  "Do not make faces plastic, modernize clothing, change age, change expression, add people, remove people, or make the image look artificially generated."
].join(" ");

const MEMORY_RECREATE_PROMPT = [
  "Create a beautiful realistic high-definition AI restoration based on this old damaged photograph.",
  "Remove scratches, dust, stains, pen marks, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Reconstruct missing details only where the original is badly damaged or unreadable, while preserving the person's likely identity, age, expression, clothing style, and historical feel.",
  "Colorize black-and-white photos with historically plausible colors and natural lighting.",
  "Make the result emotionally warm and shareable, but avoid a plastic, over-smoothed, cartoon, or obviously generated look.",
  "Preserve the original portrait framing unless repair requires subtle cropping."
].join(" ");

export const RESTORATION_PROMPT = NATURAL_ENHANCE_PROMPT;

export function hasOpenAIImageConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function restoreWithOpenAIProvider(
  sourceImagePath: string,
  mode: RestorationMode,
  style: RestorationStyle
): Promise<RestorationProviderResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
  const quality =
    mode === "hd"
      ? process.env.OPENAI_IMAGE_HD_QUALITY ?? "high"
      : process.env.OPENAI_IMAGE_PREVIEW_QUALITY ?? "low";
  const inputFidelity = inputFidelityFor(mode, style);

  const imageBuffer = await readStoredImageBuffer(sourceImagePath);
  const imageFile = await toFile(imageBuffer, filenameForMime(sourceImagePath), {
    type: mimeTypeForPath(sourceImagePath)
  });

  const editRequest = {
    model,
    image: imageFile,
    prompt: promptForStyle(style),
    quality: quality as "low" | "medium" | "high" | "auto",
    size: "auto" as const,
    output_format: "jpeg" as const,
    user: `yaadein-${mode}-${style}`
  };

  const response = await client.images.edit(
    model === "gpt-image-2"
      ? editRequest
      : {
          ...editRequest,
          input_fidelity: inputFidelity as "low" | "high"
        }
  );

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
  if (style === "recreate") return MEMORY_RECREATE_PROMPT;
  if (style === "restore") return MEMORY_RESTORE_PROMPT;
  return NATURAL_ENHANCE_PROMPT;
}

function inputFidelityFor(mode: RestorationMode, style: RestorationStyle) {
  if (style === "natural" || style === "faithful" || style === "restore") return "high";
  return mode === "hd"
    ? process.env.OPENAI_HD_INPUT_FIDELITY ?? "high"
    : process.env.OPENAI_PREVIEW_INPUT_FIDELITY ?? "low";
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
