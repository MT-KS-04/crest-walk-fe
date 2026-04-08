/**
 * Chuẩn hoá lỗi API thành chuỗi cho toast/UI (tránh truyền object vào React child).
 */
export function formatApiErrorMessage(error, fallback = "Đã xảy ra lỗi.") {
  const data = error?.response?.data;
  if (data == null) return fallback;

  if (typeof data === "string" && data.trim()) return data.trim();

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  const fromRecord = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    const parts = [];
    for (const [, v] of Object.entries(obj)) {
      if (typeof v === "string") parts.push(v);
      else if (Array.isArray(v)) {
        v.forEach((x) => {
          if (typeof x === "string") parts.push(x);
        });
      }
    }
    return parts;
  };

  const err = data.error;
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object") {
    const parts = fromRecord(err);
    if (parts.length) return parts.join(" ");
  }

  if (data.errors && typeof data.errors === "object") {
    const parts = fromRecord(data.errors);
    if (parts.length) return parts.join(" ");
  }

  // Một số API trả { email: "...", password: "..." } trực tiếp trong body
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    data.message == null &&
    data.error == null &&
    data.errors == null
  ) {
    const parts = fromRecord(data);
    if (parts.length) return parts.join(" ");
  }

  return fallback;
}
