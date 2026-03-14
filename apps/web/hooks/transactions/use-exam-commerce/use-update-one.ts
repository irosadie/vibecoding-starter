import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  checkoutCommerceSchema,
  type CheckoutCommerceSchemaProps,
} from "@vibecoding-starter/schemas"
import type { CommerceOrderResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const updateOne = async (payload: CheckoutCommerceSchemaProps) => {
  const validatedPayload = checkoutCommerceSchema.parse(payload)

  const result = await axios<CommerceOrderResponseProps>({
    method: "POST",
    url: apiRouters.commerce.checkout,
    data: validatedPayload,
  })

  return result
}

const useUpdateOne = () => {
  const mutation = useMutation<
    CommerceOrderResponseProps,
    ErrorResponse<AxiosError>,
    CheckoutCommerceSchemaProps,
    unknown
  >({
    mutationKey: [queryKeys.commerce.checkout],
    mutationFn: updateOne,
  })

  return {
    ...mutation,
  }
}

export default useUpdateOne
export { useUpdateOne as useExamCommerceUpdateOne }
