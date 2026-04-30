// Authenticated fetch for admin actions. Reads the JWT from localStorage
// (auth_token primary, admin-token mirrored by the login flow) and attaches
// it to the Authorization header. Falls back to a plain fetch when no
// token is present so callers don't have to special-case logged-out users
// (the server will 401 and the error toast will handle it).

export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("admin-token") ||
    "";

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Only set JSON content-type when there's a body and no explicit type.
  // Multipart uploads (FormData) must NOT have content-type set manually
  // or the browser-generated boundary is overwritten.
  if (
    init.body !== undefined &&
    !headers.has("Content-Type") &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
