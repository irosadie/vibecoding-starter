import { z } from "zod"

export const examAuthoringLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const

export const examAuthoringLevelLabels = [
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
] as const

export const getExamAuthoringLevelLabel = (
  value: (typeof examAuthoringLevels)[number],
) => {
  const level = examAuthoringLevelLabels.find(
    (levelOption) => levelOption.value === value,
  )

  return level?.label ?? value
}

export const examAuthoringDraftStatuses = [
  "DRAFT",
  "IN_REVIEW",
  "NEEDS_REVISION",
  "PUBLISHED",
] as const

export const examAuthoringDraftStatusLabels = [
  { label: "Draft", value: "DRAFT" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Published", value: "PUBLISHED" },
] as const

export const getExamAuthoringDraftStatusLabel = (
  value: (typeof examAuthoringDraftStatuses)[number],
) => {
  const status = examAuthoringDraftStatusLabels.find(
    (statusOption) => statusOption.value === value,
  )

  return status?.label ?? value
}

export const examAuthoringReviewStatuses = [
  "IN_REVIEW",
  "PUBLISHED",
  "REJECTED",
] as const

export const examAuthoringReviewStatusLabels = [
  { label: "Pending Review", value: "IN_REVIEW" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Rejected", value: "REJECTED" },
] as const

export const getExamAuthoringReviewStatusLabel = (
  value: (typeof examAuthoringReviewStatuses)[number],
) => {
  const status = examAuthoringReviewStatusLabels.find(
    (statusOption) => statusOption.value === value,
  )

  return status?.label ?? value
}

export const examAuthoringQuestionCorrectOptions = ["A", "B", "C", "D"] as const

export const examAuthoringLevelSchema = z.enum(examAuthoringLevels)
export const examAuthoringDraftStatusSchema = z.enum(examAuthoringDraftStatuses)
export const examAuthoringReviewStatusSchema = z.enum(examAuthoringReviewStatuses)
export const examAuthoringQuestionCorrectOptionSchema = z.enum(
  examAuthoringQuestionCorrectOptions,
)

export const creatorExamDraftListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: examAuthoringDraftStatusSchema.optional(),
})

export const adminExamReviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().min(1).optional(),
  status: examAuthoringReviewStatusSchema.optional(),
})

export const creatorExamDraftSchema = z.object({
  title: z.string().trim().min(1, "Exam title is required").max(255),
  category: z.string().trim().min(1, "Category is required").max(100),
  level: examAuthoringLevelSchema,
  short_description: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(5000),
  duration_minutes: z.coerce.number().int().positive().max(600),
})

export const creatorExamDraftUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    level: examAuthoringLevelSchema.optional(),
    short_description: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    duration_minutes: z.coerce.number().int().positive().max(600).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })

export const creatorExamQuestionSchema = z.object({
  prompt: z.string().trim().min(1).max(5000),
  option_a: z.string().trim().min(1).max(1000),
  option_b: z.string().trim().min(1).max(1000),
  option_c: z.string().trim().min(1).max(1000),
  option_d: z.string().trim().min(1).max(1000),
  correct_option: examAuthoringQuestionCorrectOptionSchema,
  explanation_text: z.string().trim().max(5000).optional(),
  explanation_video_url: z.string().trim().url().optional(),
})

export const creatorExamQuestionUpdateSchema = z
  .object({
    prompt: z.string().trim().min(1).max(5000).optional(),
    option_a: z.string().trim().min(1).max(1000).optional(),
    option_b: z.string().trim().min(1).max(1000).optional(),
    option_c: z.string().trim().min(1).max(1000).optional(),
    option_d: z.string().trim().min(1).max(1000).optional(),
    correct_option: examAuthoringQuestionCorrectOptionSchema.optional(),
    explanation_text: z.string().trim().max(5000).optional(),
    explanation_video_url: z.string().trim().url().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })

export const creatorExamSubmitReviewSchema = z.object({
  submit_note: z.string().trim().max(1000).optional(),
})

export const adminExamReviewApproveSchema = z.object({
  review_note: z.string().trim().max(1000).optional(),
})

export const adminExamReviewRejectSchema = z.object({
  review_note: z.string().trim().min(3).max(1000),
})

export type ExamAuthoringLevel = z.infer<typeof examAuthoringLevelSchema>
export type ExamAuthoringDraftStatus = z.infer<
  typeof examAuthoringDraftStatusSchema
>
export type ExamAuthoringReviewStatus = z.infer<
  typeof examAuthoringReviewStatusSchema
>
export type ExamAuthoringQuestionCorrectOption = z.infer<
  typeof examAuthoringQuestionCorrectOptionSchema
>

export type CreatorExamDraftListQuerySchemaProps = z.infer<
  typeof creatorExamDraftListQuerySchema
>
export type AdminExamReviewListQuerySchemaProps = z.infer<
  typeof adminExamReviewListQuerySchema
>
export type CreatorExamDraftSchemaProps = z.infer<typeof creatorExamDraftSchema>
export type CreatorExamDraftUpdateSchemaProps = z.infer<
  typeof creatorExamDraftUpdateSchema
>
export type CreatorExamQuestionSchemaProps = z.infer<
  typeof creatorExamQuestionSchema
>
export type CreatorExamQuestionUpdateSchemaProps = z.infer<
  typeof creatorExamQuestionUpdateSchema
>
export type CreatorExamSubmitReviewSchemaProps = z.infer<
  typeof creatorExamSubmitReviewSchema
>
export type AdminExamReviewApproveSchemaProps = z.infer<
  typeof adminExamReviewApproveSchema
>
export type AdminExamReviewRejectSchemaProps = z.infer<
  typeof adminExamReviewRejectSchema
>
