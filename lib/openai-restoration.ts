import { createBeforeAfterShareImage, createWatermarkedPreview, normalizeHdExport } from "@/lib/image-watermark";
import { saveImageBuffer } from "@/lib/local-storage";
import { runRestorationProvider } from "@/lib/restoration-provider-router";
import { RestorationMode, RestorationResult, RestorationStyle } from "@/lib/restoration-types";
import { readStoredImageBuffer } from "@/lib/storage-read";
export { RESTORATION_PROMPT, hasOpenAIImageConfig } from "@/lib/restoration-openai-provider";
export type { RestorationMode, RestorationProvider, RestorationResult } from "@/lib/restoration-types";

export async function restorePhotoForJob(input: {
  jobId: string;
  sourceImagePath: string;
  mode: RestorationMode;
  style: RestorationStyle;
}): Promise<RestorationResult> {
  const providerResult = await runRestorationProvider(input.sourceImagePath, input.mode, input.style);
  const restoredName = input.mode === "hd" ? "restored-hd.jpg" : "restored-preview.jpg";
  const restored = await saveImageBuffer(providerResult.buffer, input.jobId, restoredName);

  if (input.mode === "preview") {
    const watermarkedBuffer = await createWatermarkedPreview(providerResult.buffer);
    const watermarked = await saveImageBuffer(watermarkedBuffer, input.jobId, "restored-preview-watermarked.jpg");

    return {
      provider: providerResult.provider,
      restoredPath: restored.absolutePath,
      restoredUrl: restored.publicUrl,
      watermarkedPath: watermarked.absolutePath,
      watermarkedUrl: watermarked.publicUrl,
      estimatedCostUsd: providerResult.estimatedCostUsd
    };
  }

  const hdBuffer = await normalizeHdExport(providerResult.buffer);
  const hd = await saveImageBuffer(hdBuffer, input.jobId, "restored-hd-export.jpg");
  const sourceBuffer = await readStoredImageBuffer(input.sourceImagePath);
  const shareBuffer = await createBeforeAfterShareImage(sourceBuffer, hdBuffer);
  const share = await saveImageBuffer(shareBuffer, input.jobId, "before-after-share.jpg");

  return {
    provider: providerResult.provider,
    restoredPath: hd.absolutePath,
    restoredUrl: hd.publicUrl,
    beforeAfterSharePath: share.absolutePath,
    beforeAfterShareUrl: share.publicUrl,
    estimatedCostUsd: providerResult.estimatedCostUsd
  };
}
