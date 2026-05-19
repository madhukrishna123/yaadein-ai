import { readFile } from "node:fs/promises";
import OpenAI, { toFile } from "openai";
import { createMockRestoration, createWatermarkedPreview, normalizeHdExport } from "@/lib/image-watermark";
import { saveImageBuffer } from "@/lib/local-storage";

const RESTORATION_PROMPT = [
  "Restore this old damaged photograph into a realistic high-definition image while preserving identity, emotions, authenticity, skin texture, clothing details, facial structure, age, expression, and historical accuracy.",
  "Remove scratches, dust, stains, noise, blur, fading, compression artifacts, and low-quality damage.",
  "Improve facial clarity, lighting, sharpness, contrast, and color balance naturally.",
  "If the image is black and white, colorize it with historically plausible colors.",
  "Do not beautify, modernize, alter age, change facial identity, over-smooth skin, invent unrealistic details, or make the result look artificially generated.",
  "Preserve the original composition and emotional tone."
].join(" ");

export type RestorationMode = "preview" | "hd";

export type RestorationResult = {
  mode: "mock" | "openai";
  restoredPath: string;
  restoredUrl: string;
  watermarkedPath?: string;
  watermarkedUrl?: string;
};

export function hasOpenAIImageConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function restorePhotoForJob(input: {
  jobId: string;
  sourceImagePath: string;
  mode: RestorationMode;
}): Promise<RestorationResult> {
  const restoredBuffer = hasOpenAIImageConfig()
    ? await restoreWithOpenAI(input.sourceImagePath, input.mode)
    : await restoreWithLocalMock(input.sourceImagePath, input.mode);

  const restoredName = input.mode === "hd" ? "restored-hd.jpg" : "restored-preview.jpg";
  const restored = await saveImageBuffer(restoredBuffer, input.jobId, restoredName);

  if (input.mode === "preview") {
    const watermarkedBuffer = await createWatermarkedPreview(restoredBuffer);
    const watermarked = await saveImageBuffer(watermarkedBuffer, input.jobId, "restored-preview-watermarked.jpg");

    return {
      mode: hasOpenAIImageConfig() ? "openai" : "mock",
      restoredPath: restored.absolutePath,
      restoredUrl: restored.publicUrl,
      watermarkedPath: watermarked.absolutePath,
      watermarkedUrl: watermarked.publicUrl
    };
  }

  const hdBuffer = await normalizeHdExport(restoredBuffer);
  const hd = await saveImageBuffer(hdBuffer, input.jobId, "restored-hd-export.jpg");

  return {
    mode: hasOpenAIImageConfig() ? "openai" : "mock",
    restoredPath: hd.absolutePath,
    restoredUrl: hd.publicUrl
  };
}

async function restoreWithOpenAI(sourceImagePath: string, mode: RestorationMode) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
  const quality =
    mode === "hd"
      ? process.env.OPENAI_IMAGE_HD_QUALITY ?? "high"
      : process.env.OPENAI_IMAGE_PREVIEW_QUALITY ?? "medium";

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
    input_fidelity: "high",
    user: `yaadein-${mode}`
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image edit returned no image data.");
  }

  return Buffer.from(b64, "base64");
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

async function restoreWithLocalMock(sourceImagePath: string, mode: RestorationMode) {
  const source = await readFile(sourceImagePath);
  return createMockRestoration(source, mode);
}

export { RESTORATION_PROMPT };
