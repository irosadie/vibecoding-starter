/**
 * Standard Domain Error Codes
 */
export const ErrorCode = {
  // Authentication & Authorization (401, 403)
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation Errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Duplicate/Conflict Errors (409)
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  DUPLICATE_CODE: "DUPLICATE_CODE",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",

  // Not Found Errors (404)
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  PROPERTY_NOT_FOUND: "PROPERTY_NOT_FOUND",
  VENDOR_NOT_FOUND: "VENDOR_NOT_FOUND",

  // Server Errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Business Logic Errors (400, 422)
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

interface DomainErrorOptions {
  code: ErrorCodeType | string
  message: string
  details?: unknown
}

/**
 * Base Domain Error Class
 * Framework-agnostic error for domain and application layers
 */
export class DomainError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly details?: unknown

  constructor(options: DomainErrorOptions, statusCode = 400) {
    super(options.message)
    this.code = options.code
    this.status = statusCode
    this.details = options.details
    this.name = "DomainError"
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    const error: Record<string, unknown> = {
      code: this.code,
      message: this.message,
    }

    // If details contains path and type, flatten them to top level
    if (
      this.details &&
      typeof this.details === "object" &&
      "path" in this.details &&
      "type" in this.details
    ) {
      error.path = (this.details as { path: unknown }).path
      error.type = (this.details as { type: unknown }).type
    } else if (this.details) {
      error.details = this.details
    }

    return {
      success: false,
      errors: [error],
    }
  }

  // ===== Factory Methods for Common Errors =====

  /**
   * Authentication Errors (401)
   */
  static unauthorized(message = "Unauthorized access", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.UNAUTHORIZED,
        message,
        details,
      },
      401,
    )
  }

  static invalidCredentials(
    message = "Invalid email or password",
    details?: unknown,
  ) {
    return new DomainError(
      {
        code: ErrorCode.INVALID_CREDENTIALS,
        message,
        details,
      },
      401,
    )
  }

  static invalidToken(message = "Invalid or expired token", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.INVALID_TOKEN,
        message,
        details,
      },
      401,
    )
  }

  /**
   * Authorization Errors (403)
   */
  static forbidden(message = "Access forbidden", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.FORBIDDEN,
        message,
        details,
      },
      403,
    )
  }

  /**
   * Not Found Errors (404)
   */
  static notFound(message = "Resource not found", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message,
        details,
      },
      404,
    )
  }

  static userNotFound(message = "User not found", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.USER_NOT_FOUND,
        message,
        details,
      },
      404,
    )
  }

  static vendorNotFound(message = "Vendor not found", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.VENDOR_NOT_FOUND,
        message,
        details,
      },
      404,
    )
  }

  /**
   * Validation Errors (400)
   */
  static validationError(message = "Validation failed", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.VALIDATION_ERROR,
        message,
        details,
      },
      400,
    )
  }

  static invalidInput(message = "Invalid input provided", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.INVALID_INPUT,
        message,
        details,
      },
      400,
    )
  }

  /**
   * Conflict Errors (409)
   */
  static conflict(message = "Resource conflict", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.RESOURCE_CONFLICT,
        message,
        details,
      },
      409,
    )
  }

  static duplicate(message = "Duplicate entry", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.DUPLICATE_ENTRY,
        message,
        details,
      },
      409,
    )
  }

  static duplicateEmail(
    message = "Email already registered",
    details?: unknown,
  ) {
    return new DomainError(
      {
        code: ErrorCode.DUPLICATE_EMAIL,
        message,
        details,
      },
      409,
    )
  }

  static duplicatePhone(
    message = "Phone number already registered",
    details?: unknown,
  ) {
    return new DomainError(
      {
        code: ErrorCode.DUPLICATE_PHONE,
        message,
        details,
      },
      409,
    )
  }

  static duplicateCode(message = "Code already exists", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.DUPLICATE_CODE,
        message,
        details,
      },
      409,
    )
  }

  /**
   * Server Errors (500)
   */
  static internalError(message = "Internal server error", details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message,
        details,
      },
      500,
    )
  }

  static databaseError(
    message = "Database operation failed",
    details?: unknown,
  ) {
    return new DomainError(
      {
        code: ErrorCode.DATABASE_ERROR,
        message,
        details,
      },
      500,
    )
  }

  /**
   * Business Logic Errors (422)
   */
  static businessLogicError(message: string, details?: unknown) {
    return new DomainError(
      {
        code: ErrorCode.BUSINESS_LOGIC_ERROR,
        message,
        details,
      },
      422,
    )
  }
}
