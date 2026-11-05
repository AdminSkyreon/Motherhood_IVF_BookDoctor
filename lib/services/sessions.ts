import { randomUUID } from "node:crypto";
import { db } from "@/lib/server/store";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export function createSession(phone: string, name: string): string {
  const token = randomUUID();
  db.sessions.set(token, { phone, name, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function getSession(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = token ? db.sessions.get(token) : undefined;
  if (!session || session.expiresAt < Date.now()) return null;
  return session;
}
