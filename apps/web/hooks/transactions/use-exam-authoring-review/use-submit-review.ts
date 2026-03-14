import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorExamSubmitReviewSchemaProps,
  creatorExamSubmitReviewSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorExamSubmitReviewResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type SubmitReviewParamsProps = {
  id: string
  payload?: CreatorExamSubmitReviewSchemaProps
}

const submitReview = async ({ id, payload }: SubmitReviewParamsProps) => {
  const validatedPayload = creatorExamSubmitReviewSchema.parse(payload || {})

  const result = await axios<CreatorExamSubmitReviewResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.creatorExams.submitReview, { id }),
    data: validatedPayload,
  })

  return result
}

const useSubmitReview = () => {
  const mutation = useMutation<
    CreatorExamSubmitReviewResponseProps,
    ErrorResponse<AxiosError>,
    SubmitReviewParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.submitReview],
    mutationFn: submitReview,
  })

  return {
    ...mutation,
  }
}

export default useSubmitReview
export { useSubmitReview as useExamAuthoringReviewSubmitReview }
export type { SubmitReviewParamsProps }
