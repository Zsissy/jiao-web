import { isAdminRequest } from "../../../lib/auth";

export const dynamic = "force-dynamic";

function extensionFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function getSupabaseUploadConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "site-media";
  if (!url || !serviceKey) return null;
  return { url, serviceKey, bucket };
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ ok: false, message: "需要管理权限。" }, { status: 401 });
  }
  const config = getSupabaseUploadConfig();
  if (!config) {
    return Response.json({ ok: false, message: "图片存储尚未配置。" }, { status: 503 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return Response.json({ ok: false, message: "请选择图片文件。" }, { status: 400 });
  }

  const objectKey = `uploads/${Date.now()}-${crypto.randomUUID()}.${extensionFromType(file.type)}`;
  const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${objectKey}`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      authorization: `Bearer ${config.serviceKey}`,
      "content-type": file.type,
      "cache-control": "31536000",
      upsert: "true",
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    return Response.json({ ok: false, message: await response.text() }, { status: 500 });
  }

  return Response.json({
    ok: true,
    url: `${config.url}/storage/v1/object/public/${config.bucket}/${objectKey}`,
    objectKey,
  });
}
