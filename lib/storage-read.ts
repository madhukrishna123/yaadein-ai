import path from "node:path";
import { readFile } from "node:fs/promises";
import { getR2ObjectBuffer, hasR2Config } from "@/lib/r2-storage";

export async function readStoredImageBuffer(sourceImagePath: string) {
  if (hasR2Config() && !path.isAbsolute(sourceImagePath)) {
    return getR2ObjectBuffer(sourceImagePath);
  }

  return readFile(sourceImagePath);
}
