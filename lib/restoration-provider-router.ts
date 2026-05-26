import { restoreWithLocalProvider } from "@/lib/restoration-local-provider";
import { hasOpenAIImageConfig, restoreWithOpenAIProvider } from "@/lib/restoration-openai-provider";
import { RestorationMode, RestorationProvider, RestorationProviderResult, RestorationStyle } from "@/lib/restoration-types";

export function providerForMode(mode: RestorationMode): RestorationProvider {
  const defaultProvider = mode === "hd" ? "openai" : "local";
  const configured =
    mode === "hd"
      ? process.env.RESTORATION_HD_PROVIDER ?? defaultProvider
      : process.env.RESTORATION_PREVIEW_PROVIDER ?? defaultProvider;

  if (configured === "openai" || configured === "local" || configured === "future-self-hosted") {
    return configured;
  }

  return defaultProvider;
}

export async function runRestorationProvider(
  sourceImagePath: string,
  mode: RestorationMode,
  style: RestorationStyle
): Promise<RestorationProviderResult> {
  const provider = providerForMode(mode);

  if (provider === "local") {
    return restoreWithLocalProvider(sourceImagePath, mode);
  }

  if (provider === "openai") {
    if (!hasOpenAIImageConfig()) {
      if (mode === "hd") {
        throw new Error("OpenAI API key is required for HD export.");
      }
      return restoreWithLocalProvider(sourceImagePath, mode);
    }

    return restoreWithOpenAIProvider(sourceImagePath, mode, style);
  }

  throw new Error("Self-hosted restoration provider is planned but not implemented yet.");
}
