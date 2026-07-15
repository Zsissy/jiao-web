import { getRuntimeEnv } from "../../../lib/runtime-env";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const bucket = getRuntimeEnv()?.MEDIA;
  if (!bucket) return new Response("Media storage is not connected.", { status: 503 });

  const { key } = await params;
  const objectKey = key.join("/");
  const object = await bucket.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", object.httpMetadata?.cacheControl ?? "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}
