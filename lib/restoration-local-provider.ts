import { readFile } from "node:fs/promises";
import { createMockRestoration } from "@/lib/image-watermark";
import { RestorationMode, RestorationProviderResult } from "@/lib/restoration-types";

export async function restoreWithLocalProvider(sourceImagePath: string, mode: RestorationMode): Promise<RestorationProviderResult> {
  const source = await readFile(sourceImagePath);

  return {
    provider: "local",
    buffer: await createMockRestoration(source, mode),
    estimatedCostUsd: 0
  };
}
