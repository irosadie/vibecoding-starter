import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorApplicationApproveSchemaProps,
  creatorApplicationApproveSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationApproveResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UpdateOneParamsProps = {
  id: string
  payload: CreatorApplicationApproveSchemaProps
}

const updateOne = async ({ id, payload }: UpdateOneParamsProps) => {
  const validatedPayload = creatorApplicationApproveSchema.parse(payload)

  const result = await axios<CreatorApplicationApproveResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.creatorApplications.update, { id }),
    data: validatedPayload,
  })

  return result
}

const useUpdateOne = () => {
  const mutation = useMutation<
    CreatorApplicationApproveResponseProps,
    ErrorResponse<AxiosError>,
    UpdateOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorApplications.update],
    mutationFn: updateOne,
  })

  return {
    ...mutation,
  }
}

export default useUpdateOne
export { useUpdateOne as useCreatorApplicationUpdateOne }
export type { UpdateOneParamsProps }
