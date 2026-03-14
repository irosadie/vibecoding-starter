import { describe, expect, it } from "vitest"
import {
  adminExamReviewRejectSchema,
  creatorExamDraftSchema,
  creatorExamDraftUpdateSchema,
  creatorExamQuestionSchema,
  getExamAuthoringDraftStatusLabel,
  getExamAuthoringReviewStatusLabel,
} from "./exam-authoring-review"

describe("exam authoring review schema", () => {
  it("validates create draft payload", () => {
    const payload = {
      title: "Tryout CPNS Numerik",
      category: "CPNS",
      level: "INTERMEDIATE",
      short_description: "Ringkasan exam",
      description: "Deskripsi exam lengkap",
      duration_minutes: 90,
    }

    const result = creatorExamDraftSchema.safeParse(payload)

    expect(result.success).toBe(true)
  })

  it("rejects empty update draft payload", () => {
    const result = creatorExamDraftUpdateSchema.safeParse({})

    expect(result.success).toBe(false)
  })

  it("validates question payload", () => {
    const payload = {
      prompt: "Berapa hasil 2 + 2?",
      option_a: "2",
      option_b: "3",
      option_c: "4",
      option_d: "5",
      correct_option: "C",
      explanation_text: "2 + 2 adalah 4",
    }

    const result = creatorExamQuestionSchema.safeParse(payload)

    expect(result.success).toBe(true)
  })

  it("requires reject review note with minimum length", () => {
    const result = adminExamReviewRejectSchema.safeParse({
      review_note: "ok",
    })

    expect(result.success).toBe(false)
  })

  it("returns label for known draft and review statuses", () => {
    expect(getExamAuthoringDraftStatusLabel("DRAFT")).toBe("Draft")
    expect(getExamAuthoringReviewStatusLabel("IN_REVIEW")).toBe(
      "Pending Review",
    )
  })
})
