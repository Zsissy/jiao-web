import { getSiteData } from "../lib/data";
import { AdminPanel } from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getSiteData();
  return <AdminPanel initialData={data} />;
}
