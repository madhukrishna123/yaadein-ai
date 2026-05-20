export type RestorationMode = "preview" | "hd";

export type RestorationProvider = "local" | "openai" | "future-self-hosted";

export type RestorationProviderResult = {
  provider: RestorationProvider;
  buffer: Buffer;
  estimatedCostUsd: number;
};

export type RestorationResult = {
  provider: RestorationProvider;
  restoredPath: string;
  restoredUrl: string;
  watermarkedPath?: string;
  watermarkedUrl?: string;
  estimatedCostUsd: number;
};
