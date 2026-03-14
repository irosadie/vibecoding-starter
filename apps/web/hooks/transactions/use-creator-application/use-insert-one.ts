import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { objectToForm } from "$/utils/object-to-form"
import { useMutation } from "@tanstack/react-query"
import {
  type CreatorApplicationSchemaProps,
  creatorApplicationSchema,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const insertOne = async (payload: CreatorApplicationSchemaProps) => {
  const validatedPayload = creatorApplicationSchema.parse(payload)
  const formData = objectToForm(validatedPayload)

  const result = await axios<CreatorApplicationResponseProps>({
    method: "POST",
    url: apiRouters.creatorApplications.insert,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return result
}

const useInsertOne = () => {
  const mutation = useMutation<
    CreatorApplicationResponseProps,
    ErrorResponse<AxiosError>,
    CreatorApplicationSchemaProps,
    unknown
  >({
    mutationKey: [queryKeys.creatorApplications.insert],
    mutationFn: insertOne,
  })

  return {
    ...mutation,
  }
}

export default useInsertOne
export { useInsertOne as useCreatorApplicationInsertOne }
