import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorExamQuestionSchemaProps,
  creatorExamQuestionSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorExamQuestionResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type InsertQuestionParamsProps = {
  id: string
  payload: CreatorExamQuestionSchemaProps
}

const insertQuestion = async ({ id, payload }: InsertQuestionParamsProps) => {
  const validatedPayload = creatorExamQuestionSchema.parse(payload)

  const result = await axios<CreatorExamQuestionResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.creatorExams.insertQuestion, { id }),
    data: validatedPayload,
  })

  return result
}

const useInsertQuestion = () => {
  const mutation = useMutation<
    CreatorExamQuestionResponseProps,
    ErrorResponse<AxiosError>,
    InsertQuestionParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.insertQuestion],
    mutationFn: insertQuestion,
  })

  return {
    ...mutation,
  }
}

export default useInsertQuestion
export { useInsertQuestion as useExamAuthoringReviewInsertQuestion }
export type { InsertQuestionParamsProps }
