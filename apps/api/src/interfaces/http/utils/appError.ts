import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { DomainError, ErrorCode } from "../../../domain/errors/DomainError"

export type { ErrorCodeType } from "../../../domain/errors/DomainError"
export { ErrorCode, DomainError }

/**
 * AppError - Hono HTTP adapter for DomainError
 * Converts domain errors to Hono HTTPException for web layer
 */
export class AppError extends HTTPException {
  public readonly code: string
  public readonly details?: unknown

  constructor(domainError: DomainError) {
    super(domainError.status as ContentfulStatusCode, {
      message: domainError.message,
    })
    this.code = domainError.code
    this.details = domainError.details
    this.name = "AppError"
  }

  /**
   * Create AppError from DomainError
   */
  static fromDomainError(domainError: DomainError): AppError {
    return new AppError(domainError)
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    const error: Record<string, unknown> = {
      code: this.code,
      message: this.message,
    }

    if (this.details) {
      error.details = this.details
    }

    return {
      success: false,
      errors: [error],
    }
  }
}
