import { isAdminRequest } from "../../../lib/auth";
import { getSiteData, saveCollection, saveSettings } from "../../../lib/data";
import type { SiteData } from "../../../lib/types";

export const dynamic = "force-dynamic";

const collections = [
  "workspaceItems",
  "photos",
  "loveEvents",
  "loveWishes",
  "quarterGoals",
  "travelPlans",
] as const;

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ ok: false, message: "需要管理权限。" }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<SiteData>;
  if (payload.settings) {
    await saveSettings(payload.settings);
  }
  for (const collection of collections) {
    if (Array.isArray(payload[collection])) {
      await saveCollection(collection, payload[collection] ?? []);
    }
  }

  return Response.json({ ok: true, data: await getSiteData() });
}
