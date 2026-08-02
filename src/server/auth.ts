/**
 * Session auth for the operator portal and the admin panel. SERVER ONLY.
 *
 * ⚠ DEMO CREDENTIALS. There is no user table yet, so operator logins are derived
 * from the seeded operators in src/data and admin logins from a single env-backed
 * account. Passwords are scrypt-hashed at module load rather than compared as
 * plaintext, and sessions are HMAC-signed cookies — but this is still a stand-in
 * for Auth.js against the `OperatorUser` / `AdminUser` tables in PLAN.md.
 *
 * What must change when the database lands:
 *   - credentials move to hashed columns, seeded per user
 *   - this file becomes Auth.js callbacks; the session shape below stays
 *
 * Customer accounts are deliberately NOT here. Customers still browse and book
 * anonymously; wiring saved lists to a customer login is Phase 1 work.
 */

import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { operators } from "@/data/operators";
import { safeEqual } from "./bookings";

export type Role = "operator" | "admin";

export interface Session {
  role: Role;
  /** Operator id for role=operator, admin email for role=admin. */
  subject: string;
  name: string;
  email: string;
  expiresAt: number;
}

const COOKIE = "atlaso_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Falls back to a random per-boot secret when AUTH_SECRET is unset, so sessions
 * still work locally but do not survive a restart — and a deployment without the
 * variable set can never accidentally ship a predictable signing key.
 */
const SECRET = process.env.AUTH_SECRET ?? randomBytes(32).toString("hex");

/** Documented dev passwords. Override per environment; never use these in production. */
const OPERATOR_PASSWORD = process.env.OPERATOR_DEMO_PASSWORD ?? "operator-demo";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@atlaso.in";
const ADMIN_PASSWORD = process.env.ADMIN_DEMO_PASSWORD ?? "admin-demo";

/* ── Password hashing ─────────────────────────────────────────────────────── */

function hash(password: string, salt: string): Buffer {
  return scryptSync(password, salt, 64);
}

interface Credential {
  salt: string;
  digest: Buffer;
}

function makeCredential(password: string): Credential {
  const salt = randomBytes(16).toString("hex");
  return { salt, digest: hash(password, salt) };
}

function checkCredential(credential: Credential, attempt: string): boolean {
  const candidate = hash(attempt, credential.salt);
  return (
    candidate.length === credential.digest.length &&
    timingSafeEqual(candidate, credential.digest)
  );
}

/* Hashed once at boot rather than stored in the repo as plaintext comparisons. */
const OPERATOR_CREDENTIAL = makeCredential(OPERATOR_PASSWORD);
const ADMIN_CREDENTIAL = makeCredential(ADMIN_PASSWORD);

/* ── Cookie signing ───────────────────────────────────────────────────────── */

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): Session | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(sign(payload), signature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!session.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/* ── Login ────────────────────────────────────────────────────────────────── */

export interface LoginResult {
  ok: boolean;
  error?: string;
}

/**
 * Any seeded operator can sign in with their listed contact email and the shared
 * demo password. Verified and unverified operators can both log in — an operator
 * awaiting verification still needs to manage their listings.
 */
export async function loginOperator(email: string, password: string): Promise<LoginResult> {
  const operator = operators.find(
    (o) => o.contactEmail.toLowerCase() === email.trim().toLowerCase()
  );

  // Always run the hash so a wrong email and a wrong password take the same time.
  const passwordOk = checkCredential(OPERATOR_CREDENTIAL, password);
  if (!operator || !passwordOk) {
    return { ok: false, error: "That email and password combination is not recognised." };
  }
  if (operator.verificationStatus === "SUSPENDED" || operator.verificationStatus === "REJECTED") {
    return { ok: false, error: "This account is suspended. Contact Atlaso support." };
  }

  await setSession({
    role: "operator",
    subject: operator.id,
    name: operator.name,
    email: operator.contactEmail,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  });
  return { ok: true };
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const passwordOk = checkCredential(ADMIN_CREDENTIAL, password);
  if (!emailOk || !passwordOk) {
    return { ok: false, error: "That email and password combination is not recognised." };
  }
  await setSession({
    role: "admin",
    subject: ADMIN_EMAIL,
    name: "Atlaso Admin",
    email: ADMIN_EMAIL,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  });
  return { ok: true };
}

async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/* ── Reading the session ──────────────────────────────────────────────────── */

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return token ? decode(token) : null;
}
