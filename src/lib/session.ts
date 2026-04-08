import { cookies } from "next/headers";

const COOKIE = "vitorum_session";

export async function getSessionUserId(): Promise<number | null> {
  const c = await cookies();
  const raw = c.get(COOKIE)?.value;
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}
