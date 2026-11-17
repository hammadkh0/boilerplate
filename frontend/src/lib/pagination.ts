export const PAGE_ELLIPSIS = 'ellipsis' as const;

export type PageNumberItem = number | typeof PAGE_ELLIPSIS;

/** Builds a compact page list such as 1, ellipsis, 4, 5, 6, ellipsis, 10. */
export function getPageNumbers(currentPage: number, totalPages: number): PageNumberItem[] {
  if (totalPages <= 0) {
    return [];
  }
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageNumberItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push(PAGE_ELLIPSIS);
  }
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  if (end < totalPages - 1) {
    pages.push(PAGE_ELLIPSIS);
  }
  pages.push(totalPages);
  return pages;
}

export function getPaginationRange(
  page: number,
  pageSize: number,
  total: number,
): { from: number; to: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  return { from, to, totalPages };
}
