import { describe, expect, it, vi } from "vitest"
import { type ExampleRepository, GetExampleUseCase } from "./ExampleUseCase"

describe("GetExampleUseCase", () => {
  it("should return item from repository", async () => {
    const mockRepo: ExampleRepository = {
      findById: vi.fn().mockResolvedValue({
        id: "example-1",
        name: "Example Name",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      }),
    }

    const useCase = new GetExampleUseCase(mockRepo)
    const result = await useCase.execute({ id: "example-1" })

    expect(mockRepo.findById).toHaveBeenCalledWith("example-1")
    expect(result.id).toBe("example-1")
    expect(result.name).toBe("Example Name")
  })
})
