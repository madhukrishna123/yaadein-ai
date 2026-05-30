export type RestorationMode = "preview" | "hd";

export type RestorationStyle = "natural" | "restore" | "recreate" | "faithful";

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
  beforeAfterSharePath?: string;
  beforeAfterShareUrl?: string;
  estimatedCostUsd: number;
};
