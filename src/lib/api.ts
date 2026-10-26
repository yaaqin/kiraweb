import { API_URL } from "./config";
import type { AuthSession } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// The access token lives only in memory; the refresh token is an httpOnly
// cookie owned by the API, so a reload restores the session via refreshSession().
let accessToken: string | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;
let sessionListener: ((session: AuthSession | null) => void) | null = null;

export function onSessionChange(listener: typeof sessionListener) {
  sessionListener = listener;
}

/** Single-flight so concurrent callers never rotate the same refresh token twice. */
export function refreshSession(): Promise<AuthSession | null> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      const session = res.ok ? ((await res.json()) as AuthSession) : null;
      accessToken = session?.accessToken ?? null;
      return session;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function login(email: string, password: string) {
  const session = await apiFetch<AuthSession>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  accessToken = session.accessToken;
  return session;
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(
    () => undefined,
  );
  accessToken = null;
}

interface FetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: FetchOptions = {},
): Promise<T> {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(auth && accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await send();
  if (res.status === 401 && auth) {
    const session = await refreshSession();
    sessionListener?.(session);
    if (!session) throw new ApiError(401, "Sesi berakhir, silakan login ulang");
    res = await send();
  }

  if (!res.ok) throw new ApiError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    return Array.isArray(data.message) ? data.message.join(", ") : (data.message ?? res.statusText);
  } catch {
    return res.statusText;
  }
}
