/**
 * Chuẩn hoá metadata phân trang từ response API (tên field có thể khác nhau).
 * @param {object} res - Body response sau axios interceptor
 * @param {number} requestedPage - Trang đang yêu cầu
 * @param {number} limit - page size
 */
export function normalizeListPagination(res, requestedPage, limit) {
  const p = res?.pagination ?? res?.meta?.pagination;
  const total = Number(
    p?.total ?? p?.totalCount ?? res?.total ?? 0,
  );
  const page = Number(p?.page ?? p?.currentPage ?? requestedPage) || 1;
  const limitFromApi = Number(p?.limit ?? limit) || limit;
  let totalPages = Number(p?.totalPages ?? p?.total_pages);
  if (!Number.isFinite(totalPages) || totalPages < 0) {
    totalPages =
      total > 0 && limitFromApi > 0
        ? Math.max(1, Math.ceil(total / limitFromApi))
        : total === 0
          ? 0
          : 1;
  }
  return {
    total,
    page,
    limit: limitFromApi,
    totalPages,
  };
}
