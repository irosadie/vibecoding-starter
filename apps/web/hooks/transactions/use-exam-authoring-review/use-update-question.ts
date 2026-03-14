import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorExamQuestionUpdateSchemaProps,
  creatorExamQuestionUpdateSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorExamQuestionResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UpdateQuestionParamsProps = {
  id: string
  questionId: string
  payload: CreatorExamQuestionUpdateSchemaProps
}

const updateQuestion = async ({
  id,
  questionId,
  payload,
}: UpdateQuestionParamsProps) => {
  const validatedPayload = creatorExamQuestionUpdateSchema.parse(payload)

  const result = await axios<CreatorExamQuestionResponseProps>({
    method: "PUT",
    url: pathVariable(apiRouters.creatorExams.updateQuestion, {
      id,
      questionId,
    }),
    data: validatedPayload,
  })

  return result
}

const useUpdateQuestion = () => {
  const mutation = useMutation<
    CreatorExamQuestionResponseProps,
    ErrorResponse<AxiosError>,
    UpdateQuestionParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.updateQuestion],
    mutationFn: updateQuestion,
  })

  return {
    ...mutation,
  }
}

export default useUpdateQuestion
export { useUpdateQuestion as useExamAuthoringReviewUpdateQuestion }
export type { UpdateQuestionParamsProps }
