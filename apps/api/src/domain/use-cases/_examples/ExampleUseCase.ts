export type ExampleEntity = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type ExampleRepository = {
  findById(id: string): Promise<ExampleEntity | null>
}

type GetExampleInput = {
  id: string
}

export class GetExampleUseCase {
  constructor(private readonly repository: ExampleRepository) {}

  async execute(input: GetExampleInput): Promise<ExampleEntity> {
    const item = await this.repository.findById(input.id)

    if (!item) {
      throw new Error(`Example ${input.id} not found`)
    }

    return item
  }
}
