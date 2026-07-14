import { adminCookie, isAdminConfigured, verifyPassword } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ ok: false, message: "管理密码尚未配置。" }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  const ok = await verifyPassword(String(body.password ?? ""));
  if (!ok) {
    return Response.json({ ok: false, message: "密码不正确。" }, { status: 401 });
  }
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": await adminCookie(),
      },
    }
  );
}
