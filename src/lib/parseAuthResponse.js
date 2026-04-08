/**
 * Chuẩn hoá body đăng nhập/đăng ký từ nhiều kiểu API (accessToken vs token, nested data, v.v.)
 */
export function parseAuthResponseBody(raw) {
  if (raw == null || typeof raw !== "object") {
    return { accessToken: null, user: null };
  }

  const inner =
    raw.data != null && typeof raw.data === "object" && !Array.isArray(raw.data)
      ? raw.data
      : raw;

  const accessToken =
    inner.accessToken ??
    inner.token ??
    inner.access_token ??
    null;

  const user =
    inner.user ??
    inner.data?.user ??
    (inner.profile && typeof inner.profile === "object" ? inner.profile : null) ??
    null;

  return {
    accessToken: accessToken != null ? String(accessToken) : null,
    user,
  };
}

/** Phản hồi GET /auth/me */
export function parseMeResponse(raw) {
  if (raw == null || typeof raw !== "object") return null;
  if (raw.user && typeof raw.user === "object") return raw.user;
  const inner =
    raw.data != null && typeof raw.data === "object" && !Array.isArray(raw.data)
      ? raw.data
      : null;
  if (inner) {
    if (inner.user && typeof inner.user === "object") return inner.user;
    if (inner.email != null || inner._id != null) return inner;
  }
  if (raw.email != null || raw._id != null) return raw;
  return null;
}
