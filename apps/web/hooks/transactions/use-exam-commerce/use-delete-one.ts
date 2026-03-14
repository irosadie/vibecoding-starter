import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

const deleteOne = async (id: string) => {
  const result = await axios<{
    id: string
    removed: boolean
  }>({
    method: "DELETE",
    url: pathVariable(apiRouters.commerce.removeCartItem, { id }),
  })

  return result
}

const useDeleteOne = () => {
  const mutation = useMutation<
    {
      id: string
      removed: boolean
    },
    ErrorResponse<AxiosError>,
    string,
    unknown
  >({
    mutationKey: [queryKeys.commerce.removeCartItem],
    mutationFn: deleteOne,
  })

  return {
    ...mutation,
  }
}

export default useDeleteOne
export { useDeleteOne as useExamCommerceDeleteOne }
