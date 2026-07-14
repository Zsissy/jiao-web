import { getSiteData } from "../../lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSiteData();
  return Response.json(data);
}
