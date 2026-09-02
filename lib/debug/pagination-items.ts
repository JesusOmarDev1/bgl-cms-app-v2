export type DebugPaginationItem =
  { type: "page"; page: number } | { type: "ellipsis"; id: "start" | "end" }

function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, index) => start + index)
}

export function getDebugPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): DebugPaginationItem[] {
  if (totalPages <= 1) {
    return []
  }

  const totalPageNumbers = siblingCount * 2 + 5

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages).map((page) => ({ type: "page", page }))
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    return [
      ...range(1, leftItemCount).map((page) => ({
        type: "page" as const,
        page,
      })),
      { type: "ellipsis", id: "start" },
      { type: "page", page: totalPages },
    ]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    return [
      { type: "page", page: 1 },
      { type: "ellipsis", id: "end" },
      ...range(totalPages - rightItemCount + 1, totalPages).map((page) => ({
        type: "page" as const,
        page,
      })),
    ]
  }

  return [
    { type: "page", page: 1 },
    { type: "ellipsis", id: "start" },
    ...range(leftSibling, rightSibling).map((page) => ({
      type: "page" as const,
      page,
    })),
    { type: "ellipsis", id: "end" },
    { type: "page", page: totalPages },
  ]
}
