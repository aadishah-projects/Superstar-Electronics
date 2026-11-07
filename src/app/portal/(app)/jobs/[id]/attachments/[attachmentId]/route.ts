import fs from "node:fs/promises";
import path from "node:path";
import { getCurrentPortalUser } from "@/lib/portal/auth";
import { getJobAttachment, getServiceJob, getServiceJobs } from "@/lib/portal/queries";
import { getPrivateR2Object, getR2KeyFromStoredName } from "@/lib/integrations/r2";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const user = await getCurrentPortalUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id, attachmentId } = await params;
  const [job, attachment] = await Promise.all([getServiceJob(id), getJobAttachment(attachmentId)]);
  if (!job || !attachment || attachment.job_id !== id) return new Response("Not found", { status: 404 });
  if (user.role === "technician" && !(await getServiceJobs({ role: "technician", userId: user.id })).some((item) => item.id === id)) return new Response("Forbidden", { status: 403 });

  const r2Key = getR2KeyFromStoredName(attachment.stored_name);
  if (r2Key) {
    try {
      const object = await getPrivateR2Object(r2Key);
      if (!object) return new Response("File not found", { status: 404 });
      const safeName = attachment.original_name.replace(/[^a-zA-Z0-9._ -]/g, "_");
      return new Response(Buffer.from(object.body), { headers: { "Content-Type": attachment.mime_type, "Content-Length": String(object.contentLength), "Content-Disposition": `inline; filename="${safeName}"`, "X-Content-Type-Options": "nosniff" } });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  const storedPath = path.join(process.cwd(), "data", "portal-uploads", "jobs", id, attachment.stored_name);
  try {
    const file = await fs.readFile(storedPath);
    const safeName = attachment.original_name.replace(/[^a-zA-Z0-9._ -]/g, "_");
    return new Response(file, { headers: { "Content-Type": attachment.mime_type, "Content-Length": String(file.byteLength), "Content-Disposition": `inline; filename="${safeName}"`, "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}
