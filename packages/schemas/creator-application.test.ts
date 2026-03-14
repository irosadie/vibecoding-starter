import { describe, expect, it } from "vitest"
import {
  creatorApplicationApproveSchema,
  creatorApplicationRejectSchema,
  creatorApplicationSchema,
  getCreatorApplicationStatusLabel,
} from "./creator-application"

describe("creator application schema", () => {
  it("validates submit payload", () => {
    const payload = {
      payout_account_name: "Imron Rosadie",
      payout_bank_name: "BCA",
      payout_account_number: "1234567890",
      ktp_file: new File(["mock"], "ktp.png", { type: "image/png" }),
    }

    const result = creatorApplicationSchema.safeParse(payload)

    expect(result.success).toBe(true)
  })

  it("rejects submit payload without ktp file", () => {
    const payload = {
      payout_account_name: "Imron Rosadie",
      payout_bank_name: "BCA",
      payout_account_number: "1234567890",
      ktp_file: null,
    }

    const result = creatorApplicationSchema.safeParse(payload)

    expect(result.success).toBe(false)
  })

  it("requires review note when rejecting", () => {
    const result = creatorApplicationRejectSchema.safeParse({
      review_note: "",
    })

    expect(result.success).toBe(false)
  })

  it("allows empty payload when approving", () => {
    const result = creatorApplicationApproveSchema.safeParse({})

    expect(result.success).toBe(true)
  })

  it("returns label for known status", () => {
    expect(getCreatorApplicationStatusLabel("PENDING")).toBe("Pending")
  })
})
