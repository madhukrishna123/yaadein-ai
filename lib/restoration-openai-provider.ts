import OpenAI, { toFile } from "openai";
import { RestorationMode, RestorationProviderResult, RestorationStyle } from "@/lib/restoration-types";
import { readStoredImageBuffer } from "@/lib/storage-read";

const YAADEIN_MAGIC_PROMPT = [
  "Create a beautiful, emotionally warm, realistic restoration of this exact photo.",
  "This is identity-preserving photo enhancement, not face reconstruction.",
  "Keep each person's facial geometry exactly aligned with the source: face shape, jawline, cheek shape, eye spacing, nose width, mouth shape, smile, eyebrows, hairline, forehead, ears, age, and expression must remain the same.",
  "Make the result feel magical, premium, and share-worthy while preserving the same people, pose, body shape, clothing, background, camera angle, aspect ratio, and overall composition.",
  "Improve blur, noise, scratches, faded color, low light, contrast, detail, skin texture, and natural sharpness without changing identity.",
  "Do not replace faces, beautify faces, change facial structure, alter body shape, modernize clothing, add people, remove people, crop people out, zoom in, or reframe the scene.",
  "For modern low-resolution or blurry photos, preserve the scene and people exactly; improve clarity and lighting without inventing different faces or a different photograph.",
  "For black-and-white or very old photos, keep the historic feeling and only reconstruct missing details when needed.",
  "The output should look like the original memory was captured beautifully, not like a new unrelated AI-generated photo."
].join(" ");

const MEMORY_RECREATE_PROMPT = [
  "Create a beautiful realistic high-definition AI restoration based on this old damaged photograph.",
  "Remove scratches, dust, stains, pen marks, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Reconstruct missing details only where the original is badly damaged or unreadable, while preserving the person's likely identity, age, expression, clothing style, and historical feel.",
  "Colorize black-and-white photos with historically plausible colors and natural lighting.",
  "Make the result emotionally warm and shareable, but avoid a plastic, over-smoothed, cartoon, or obviously generated look.",
  "Preserve the original portrait framing unless repair requires subtle cropping."
].join(" ");

export const RESTORATION_PROMPT = YAADEIN_MAGIC_PROMPT;

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
  return style === "recreate" ? MEMORY_RECREATE_PROMPT : YAADEIN_MAGIC_PROMPT;
}

function inputFidelityFor(mode: RestorationMode, style: RestorationStyle) {
  if (style === "faithful") return "high";
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
