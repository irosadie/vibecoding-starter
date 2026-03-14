import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import type { CreatorExamQuestionDeleteResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type DeleteOneParamsProps = {
  id: string
  questionId: string
}

const deleteOne = async ({ id, questionId }: DeleteOneParamsProps) => {
  const result = await axios<CreatorExamQuestionDeleteResponseProps>({
    method: "DELETE",
    url: pathVariable(apiRouters.creatorExams.deleteQuestion, {
      id,
      questionId,
    }),
  })

  return result
}

const useDeleteOne = () => {
  const mutation = useMutation<
    CreatorExamQuestionDeleteResponseProps,
    ErrorResponse<AxiosError>,
    DeleteOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.delete],
    mutationFn: deleteOne,
  })

  return {
    ...mutation,
  }
}

export default useDeleteOne
export { useDeleteOne as useExamAuthoringReviewDeleteOne }
export type { DeleteOneParamsProps }
