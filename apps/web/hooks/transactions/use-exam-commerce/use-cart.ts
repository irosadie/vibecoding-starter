import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { CommerceCartResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

type UseCartProps = {
  enabled?: boolean
}

const getCart = async () => {
  const result = await axios<CommerceCartResponseProps>({
    method: "GET",
    url: apiRouters.commerce.cart,
  })

  return result
}

const useCart = (args?: UseCartProps) => {
  const { enabled = true } = args || {}

  const query = useQuery<
    CommerceCartResponseProps,
    ErrorResponse<AxiosError>,
    CommerceCartResponseProps,
    [string]
  >({
    queryKey: [queryKeys.commerce.cart],
    queryFn: getCart,
    enabled,
  })

  return {
    ...query,
  }
}

export default useCart
export { useCart as useExamCommerceCart }
