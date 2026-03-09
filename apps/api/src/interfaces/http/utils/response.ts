import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

interface SuccessResponseOptions {
  message: string
  data?: unknown
  meta?: unknown
}

/**
 * Send a success JSON response.
 * Only includes `data` and `meta` if provided.
 * Never includes `errors`.
 */
export function successResponse(
  c: Context,
  options: SuccessResponseOptions,
  status: ContentfulStatusCode = 200,
) {
  const body: Record<string, unknown> = {
    success: true,
    message: options.message,
  }

  if (options.data !== undefined) {
    body.data = options.data
  }

  if (options.meta !== undefined) {
    body.meta = options.meta
  }

  return c.json(body, status)
}
