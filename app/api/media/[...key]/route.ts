import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: { key: string[] } | Promise<{ key: string[] }> }) {
  const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!bucket) return new Response("Media storage is not configured.", { status: 503 });
  const params = await context.params;
  const key = params.key.join("/");
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", headers.get("cache-control") ?? "public, max-age=31536000");
  return new Response(object.body, { headers });
}
