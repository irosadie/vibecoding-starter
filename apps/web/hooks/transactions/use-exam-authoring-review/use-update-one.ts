import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorExamDraftUpdateSchemaProps,
  creatorExamDraftUpdateSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorExamDraftResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UpdateOneParamsProps = {
  id: string
  payload: CreatorExamDraftUpdateSchemaProps
}

const updateOne = async ({ id, payload }: UpdateOneParamsProps) => {
  const validatedPayload = creatorExamDraftUpdateSchema.parse(payload)

  const result = await axios<CreatorExamDraftResponseProps>({
    method: "PUT",
    url: pathVariable(apiRouters.creatorExams.update, { id }),
    data: validatedPayload,
  })

  return result
}

const useUpdateOne = () => {
  const mutation = useMutation<
    CreatorExamDraftResponseProps,
    ErrorResponse<AxiosError>,
    UpdateOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorExams.update],
    mutationFn: updateOne,
  })

  return {
    ...mutation,
  }
}

export default useUpdateOne
export { useUpdateOne as useExamAuthoringReviewUpdateOne }
export type { UpdateOneParamsProps }
