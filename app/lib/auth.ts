const cookieName = "jiao_admin_session";

function getPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getSessionToken() {
  const password = getPassword();
  if (!password) return "";
  return sha256(`jiao-admin:${password}`);
}

export async function verifyPassword(password: string) {
  const expected = getPassword();
  return Boolean(expected) && password === expected;
}

export async function isAdminRequest(request: Request) {
  const token = await getSessionToken();
  if (!token) return false;
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${cookieName}=${token}`);
}

export async function adminCookie() {
  const token = await getSessionToken();
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000;${secure}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure}`;
}

export function isAdminConfigured() {
  return Boolean(getPassword());
}
