import { NextResponse } from "next/server";
import { getR2Object, hasR2Config } from "@/lib/r2-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (!hasR2Config()) {
    return NextResponse.json({ error: "R2 storage is not configured." }, { status: 404 });
  }

  const { key } = await params;
  const objectKey = key.join("/");

  try {
    const object = await getR2Object(objectKey);
    const body =
      object.body && typeof object.body === "object" && "transformToWebStream" in object.body
        ? object.body.transformToWebStream()
        : (object.body as BodyInit);

    return new Response(body, {
      headers: {
        "Content-Type": object.contentType,
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
