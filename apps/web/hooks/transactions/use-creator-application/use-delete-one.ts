import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorApplicationRejectSchemaProps,
  creatorApplicationRejectSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type DeleteOneParamsProps = {
  id: string
  payload: CreatorApplicationRejectSchemaProps
}

const deleteOne = async ({ id, payload }: DeleteOneParamsProps) => {
  const validatedPayload = creatorApplicationRejectSchema.parse(payload)

  const result = await axios<CreatorApplicationResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.creatorApplications.delete, { id }),
    data: validatedPayload,
  })

  return result
}

const useDeleteOne = () => {
  const mutation = useMutation<
    CreatorApplicationResponseProps,
    ErrorResponse<AxiosError>,
    DeleteOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorApplications.delete],
    mutationFn: deleteOne,
  })

  return {
    ...mutation,
  }
}

export default useDeleteOne
export { useDeleteOne as useCreatorApplicationDeleteOne }
export type { DeleteOneParamsProps }
