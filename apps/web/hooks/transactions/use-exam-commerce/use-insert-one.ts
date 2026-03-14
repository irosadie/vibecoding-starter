import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  addCommerceCartItemSchema,
  type AddCommerceCartItemSchemaProps,
} from "@vibecoding-starter/schemas"
import type { CommerceCartItemResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const insertOne = async (payload: AddCommerceCartItemSchemaProps) => {
  const validatedPayload = addCommerceCartItemSchema.parse(payload)

  const result = await axios<CommerceCartItemResponseProps>({
    method: "POST",
    url: apiRouters.commerce.addToCart,
    data: validatedPayload,
  })

  return result
}

const useInsertOne = () => {
  const mutation = useMutation<
    CommerceCartItemResponseProps,
    ErrorResponse<AxiosError>,
    AddCommerceCartItemSchemaProps,
    unknown
  >({
    mutationKey: [queryKeys.commerce.addToCart],
    mutationFn: insertOne,
  })

  return {
    ...mutation,
  }
}

export default useInsertOne
export { useInsertOne as useExamCommerceInsertOne }
