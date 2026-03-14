import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { CommerceOrderResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UseOrderStatusProps = {
  orderId: string
  enabled?: boolean
  refetchInterval?: number
}

const getOrderStatus = async (orderId: string) => {
  const result = await axios<CommerceOrderResponseProps>({
    method: "GET",
    url: pathVariable(apiRouters.commerce.orderStatus, { id: orderId }),
  })

  return result
}

const useOrderStatus = ({
  orderId,
  enabled = true,
  refetchInterval = 5000,
}: UseOrderStatusProps) => {
  const query = useQuery<
    CommerceOrderResponseProps,
    ErrorResponse<AxiosError>,
    CommerceOrderResponseProps,
    [string, string]
  >({
    queryKey: [queryKeys.commerce.orderStatus, orderId],
    queryFn: () => getOrderStatus(orderId),
    enabled: enabled && !!orderId,
    refetchInterval,
  })

  return {
    ...query,
  }
}

export default useOrderStatus
export { useOrderStatus as useExamCommerceOrderStatus }
