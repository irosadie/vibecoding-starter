import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorExamDraftSchemaProps,
  creatorExamDraftSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorExamDraftResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const insertOne = async (payload: CreatorExamDraftSchemaProps) => {
  const validatedPayload = creatorExamDraftSchema.parse(payload)

  const result = await axios<CreatorExamDraftResponseProps>({
    method: "POST",
    url: apiRouters.creatorExams.insert,
    data: validatedPayload,
  })

  return result
}

const useInsertOne = () => {
  const mutation = useMutation<
    CreatorExamDraftResponseProps,
    ErrorResponse<AxiosError>,
    CreatorExamDraftSchemaProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.insert],
    mutationFn: insertOne,
  })

  return {
    ...mutation,
  }
}

export default useInsertOne
export { useInsertOne as useExamAuthoringReviewInsertOne }
