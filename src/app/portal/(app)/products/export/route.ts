import { requirePortalUser } from "@/lib/portal/auth";

export const runtime = "nodejs";

export async function GET() {
  await requirePortalUser(["owner", "manager"]);
  return new Response("Product export is disabled. The public catalogue is maintained in src/data/catalog.ts.\n", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
