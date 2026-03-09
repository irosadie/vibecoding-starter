import { zValidator as honoZValidator } from "@hono/zod-validator"
import type { Context } from "hono"
import type { ValidationTargets } from "hono/types"
import type { SafeParseReturnType, ZodIssue, ZodSchema } from "zod"

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  honoZValidator(
    target,
    schema,
    (result: SafeParseReturnType<unknown, unknown>, c: Context) => {
      if (!result.success) {
        const errors = result.error.issues.map((issue: ZodIssue) => ({
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

      return undefined
    },
  )
