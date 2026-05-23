import { createMockRestoration } from "@/lib/image-watermark";
import { RestorationMode, RestorationProviderResult } from "@/lib/restoration-types";
import { readStoredImageBuffer } from "@/lib/storage-read";

export async function restoreWithLocalProvider(sourceImagePath: string, mode: RestorationMode): Promise<RestorationProviderResult> {
  const source = await readStoredImageBuffer(sourceImagePath);

  return {
    provider: "local",
    buffer: await createMockRestoration(source, mode),
    estimatedCostUsd: 0
  };
}
