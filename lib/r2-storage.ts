import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | undefined;

export type R2Object = {
  key: string;
  url: string;
};

export function hasR2Config() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
}

export function r2Endpoint() {
  return process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

export function getR2Client() {
  if (!hasR2Config()) {
    throw new Error("R2 storage is not configured.");
  }

  client ??= new S3Client({
    region: "auto",
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? ""
    }
  });

  return client;
}

export async function putR2Object(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<R2Object> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType
    })
  );

  return {
    key: input.key,
    url: objectUrl(input.key)
  };
}

export async function getR2Object(key: string) {
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error("R2 object has no body.");
  }

  return {
    body: response.Body,
    contentType: response.ContentType ?? "application/octet-stream"
  };
}

export async function getR2ObjectBuffer(key: string) {
  const object = await getR2Object(key);
  const body = object.body;

  if (body && typeof body === "object" && "transformToByteArray" in body) {
    return Buffer.from(await body.transformToByteArray());
  }

  if (body && typeof body === "object" && Symbol.asyncIterator in body) {
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  throw new Error("Unable to read R2 object body.");
}

function objectUrl(key: string) {
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBase) return `${publicBase}/${key}`;
  return `/api/files/${key}`;
}
