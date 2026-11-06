import bcrypt from "bcryptjs";
import { createToken, createUser, getUserById } from "@/lib/portal/db";
import type { PortalRole } from "@/lib/portal/types";

export async function ensureSqlitePortalShadowUser(input: {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: PortalRole;
}) {
  if (getUserById(input.id)) return;

  createUser({
    id: input.id,
    email: input.email,
    name: input.name,
    phone: input.phone,
    role: input.role,
    passwordHash: await bcrypt.hash(createToken(), 12),
  });
}
