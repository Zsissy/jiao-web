import { env } from "cloudflare:workers";
import { isAdminRequest } from "../../../lib/auth";

export const dynamic = "force-dynamic";

function extensionFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ ok: false, message: "需要管理权限。" }, { status: 401 });
  }
  const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA;
  if (!bucket) {
    return Response.json({ ok: false, message: "图片存储尚未配置。" }, { status: 503 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ ok: false, message: "请选择图片文件。" }, { status: 400 });
  }
  const objectKey = `uploads/${Date.now()}-${crypto.randomUUID()}.${extensionFromType(file.type)}`;
  await bucket.put(objectKey, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000",
    },
  });
  return Response.json({ ok: true, url: `/api/media/${objectKey}`, objectKey });
}
