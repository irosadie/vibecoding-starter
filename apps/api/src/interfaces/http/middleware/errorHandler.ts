import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { ZodError } from "zod"
import { DomainError } from "../../../domain/errors/DomainError"
import { AppError } from "../utils/appError"

export const errorHandler = (error: Error, c: Context): Response => {
  // Handle DomainError (convert to AppError for HTTP)
  if (error instanceof DomainError) {
    return c.json(
      error.toJSON(),
      error.status as 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500,
    )
  }

  // Handle AppError (our HTTP adapter)
  if (error instanceof AppError) {
    return c.json(error.toJSON(), error.status)
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      code: "VALIDATION_ERROR",
      message: issue.message,
      path: issue.path.join(".") || "unknown",
      type: issue.code,
    }))

    return c.json(
      {
        success: false,
        errors,
      },
      422,
    )
  }

  // Handle HTTP exceptions
  if (error instanceof HTTPException) {
    return c.json(
      {
        success: false,
        errors: [
          {
            code: "HTTP_EXCEPTION",
            message: error.message,
          },
        ],
      },
      error.status,
    )
  }

  // Handle unknown errors
  return c.json(
    {
      success: false,
      errors: [
        {
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "Internal Server Error"
              : error.message,
        },
      ],
    },
    500,
  )
}
