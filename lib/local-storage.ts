import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasR2Config, putR2Object } from "@/lib/r2-storage";

const uploadRoot = path.join(process.cwd(), "public", "uploads");

export type StoredFile = {
  absolutePath: string;
  publicUrl: string;
  key?: string;
};

export async function ensureUploadDir(...segments: string[]) {
  const target = path.join(uploadRoot, ...segments);
  await mkdir(target, { recursive: true });
  return target;
}

export async function saveUploadedImage(file: File, jobId: string): Promise<StoredFile> {
  const extension = extensionFromFile(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (hasR2Config()) {
    const key = `${jobId}/original.${extension}`;
    const stored = await putR2Object({
      key,
      body: buffer,
      contentType: file.type || mimeTypeForExtension(extension)
    });

    return {
      absolutePath: stored.key,
      publicUrl: stored.url,
      key: stored.key
    };
  }

  const directory = await ensureUploadDir(jobId);
  const absolutePath = path.join(directory, `original.${extension}`);
  await writeFile(absolutePath, buffer);

  return {
    absolutePath,
    publicUrl: `/uploads/${jobId}/original.${extension}`
  };
}

export async function saveImageBuffer(buffer: Buffer, jobId: string, name: string): Promise<StoredFile> {
  if (hasR2Config()) {
    const key = `${jobId}/${name}`;
    const stored = await putR2Object({
      key,
      body: buffer,
      contentType: mimeTypeForExtension(name.split(".").pop() ?? "jpg")
    });

    return {
      absolutePath: stored.key,
      publicUrl: stored.url,
      key: stored.key
    };
  }

  const directory = await ensureUploadDir(jobId);
  const absolutePath = path.join(directory, name);
  await writeFile(absolutePath, buffer);

  return {
    absolutePath,
    publicUrl: `/uploads/${jobId}/${name}`
  };
}

export function extensionFromFile(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg" || file.type === "image/jpg") return "jpg";

  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  if (nameExtension === "png" || nameExtension === "webp" || nameExtension === "jpg" || nameExtension === "jpeg") {
    return nameExtension === "jpeg" ? "jpg" : nameExtension;
  }

  return "jpg";
}

export function isSupportedImage(file: File) {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
}

function mimeTypeForExtension(extension: string) {
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}
