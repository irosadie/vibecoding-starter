import { z } from "zod"

export const examLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
export const examDraftStatusSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "NEEDS_REVISION",
  "PUBLISHED",
])
export const examReviewStatusSchema = z.enum([
  "IN_REVIEW",
  "PUBLISHED",
  "REJECTED",
])
export const questionCorrectOptionSchema = z.enum(["A", "B", "C", "D"])

export const examIdParamSchema = z.object({
  id: z.string().uuid("Exam id is invalid"),
})

export const examReviewIdParamSchema = z.object({
  id: z.string().uuid("Exam review id is invalid"),
})

export const examQuestionParamSchema = z.object({
  id: z.string().uuid("Exam id is invalid"),
  questionId: z.string().uuid("Question id is invalid"),
})

export const listCreatorExamDraftsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: examDraftStatusSchema.optional(),
})

export const listAdminExamReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: examReviewStatusSchema.optional(),
})

export const createExamDraftSchema = z.object({
  title: z.string().trim().min(1, "Exam title is required").max(255),
  category: z.string().trim().min(1, "Category is required").max(100),
  level: examLevelSchema,
  short_description: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(5000),
  duration_minutes: z.coerce.number().int().positive().max(600),
})

export const updateExamDraftSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    level: examLevelSchema.optional(),
    short_description: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    duration_minutes: z.coerce.number().int().positive().max(600).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })

export const createExamQuestionSchema = z.object({
  prompt: z.string().trim().min(1).max(5000),
  option_a: z.string().trim().min(1).max(1000),
  option_b: z.string().trim().min(1).max(1000),
  option_c: z.string().trim().min(1).max(1000),
  option_d: z.string().trim().min(1).max(1000),
  correct_option: questionCorrectOptionSchema,
  explanation_text: z.string().trim().max(5000).optional(),
  explanation_video_url: z.string().trim().url().optional(),
})

export const updateExamQuestionSchema = z
  .object({
    prompt: z.string().trim().min(1).max(5000).optional(),
    option_a: z.string().trim().min(1).max(1000).optional(),
    option_b: z.string().trim().min(1).max(1000).optional(),
    option_c: z.string().trim().min(1).max(1000).optional(),
    option_d: z.string().trim().min(1).max(1000).optional(),
    correct_option: questionCorrectOptionSchema.optional(),
    explanation_text: z.string().trim().max(5000).optional(),
    explanation_video_url: z.string().trim().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })

export const submitExamReviewSchema = z.object({
  submit_note: z.string().trim().max(1000).optional(),
})

export const approveExamReviewSchema = z.object({
  review_note: z.string().trim().max(1000).optional(),
})

export const rejectExamReviewSchema = z.object({
  review_note: z.string().trim().min(3).max(1000),
})

export type ListCreatorExamDraftsQuery = z.infer<
  typeof listCreatorExamDraftsQuerySchema
>
export type ListAdminExamReviewsQuery = z.infer<
  typeof listAdminExamReviewsQuerySchema
>
export type CreateExamDraftPayload = z.infer<typeof createExamDraftSchema>
export type UpdateExamDraftPayload = z.infer<typeof updateExamDraftSchema>
export type CreateExamQuestionPayload = z.infer<typeof createExamQuestionSchema>
export type UpdateExamQuestionPayload = z.infer<typeof updateExamQuestionSchema>
export type SubmitExamReviewPayload = z.infer<typeof submitExamReviewSchema>
export type ApproveExamReviewPayload = z.infer<typeof approveExamReviewSchema>
export type RejectExamReviewPayload = z.infer<typeof rejectExamReviewSchema>
