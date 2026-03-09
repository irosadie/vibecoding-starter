/**
 * Parse sortBy query parameter to Prisma orderBy format
 * Supports single or multiple fields separated by comma
 * Format: "field" for ascending, "-field" for descending
 *
 * @param sortBy - The sortBy query parameter (e.g., "name", "-createdAt", "id,-name")
 * @param validFields - Array of valid field names that can be sorted
 * @param defaultSort - Default sort object if sortBy is invalid or not provided
 * @returns Prisma orderBy object or array
 *
 * @example
 * parseSortBy("name", ["name", "createdAt"]) // { name: "asc" }
 * parseSortBy("-createdAt", ["name", "createdAt"]) // { createdAt: "desc" }
 * parseSortBy("id,-name", ["id", "name"]) // [{ id: "asc" }, { name: "desc" }]
 */
export function parseSortBy<T extends string>(
  sortBy: string | undefined,
  validFields: readonly T[],
  defaultSort: Record<string, "asc" | "desc"> = { id: "asc" },
): Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">> {
  if (!sortBy) {
    return defaultSort
  }

  const sortFields = sortBy
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)

  if (sortFields.length === 0) {
    return defaultSort
  }

  const parsedFields: Array<Record<string, "asc" | "desc">> = []

  for (const sortField of sortFields) {
    const isDescending = sortField.startsWith("-")
    const field = isDescending ? sortField.substring(1) : sortField
    const direction: "asc" | "desc" = isDescending ? "desc" : "asc"

    // Validate field against allowed fields
    if (validFields.includes(field as T)) {
      parsedFields.push({ [field]: direction })
    }
  }

  // If no valid fields found, return default
  if (parsedFields.length === 0) {
    return defaultSort
  }

  // If single field, return as object, otherwise return as array
  if (parsedFields.length === 1) {
    // We know parsedFields has exactly one element, so we can safely return it
    return parsedFields[0] as Record<string, "asc" | "desc">
  }
  return parsedFields
}

/**
 * Parse pagination query parameters
 *
 * @param page - Page number (default: "1")
 * @param limit - Items per page (default: "10", max: 100)
 * @returns Object with validated page and limit numbers
 */
export function parsePagination(
  page: string | undefined,
  limit: string | undefined,
): { page: number; limit: number; skip: number } {
  const pageNum = Math.max(1, Number.parseInt(page || "1"))
  const limitNum = Math.min(Math.max(1, Number.parseInt(limit || "10")), 100)
  const skip = (pageNum - 1) * limitNum

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  }
}

/**
 * Build pagination metadata for API response
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): {
  page: number
  limit: number
  total: number
  totalPages: number
} {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
