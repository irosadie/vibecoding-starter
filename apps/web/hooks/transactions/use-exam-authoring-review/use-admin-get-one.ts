import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { AdminExamReviewResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UseAdminGetOneProps = {
  id: string
  enabled?: boolean
}

const getOne = async (id: string) => {
  const result = await axios<AdminExamReviewResponseProps>({
    method: "GET",
    url: pathVariable(apiRouters.adminExamReviews.show, { id }),
  })

  return result
}

const useAdminGetOne = ({ id, enabled = true }: UseAdminGetOneProps) => {
  const query = useQuery<
    AdminExamReviewResponseProps,
    ErrorResponse<AxiosError>,
    AdminExamReviewResponseProps,
    [string, string]
  >({
    queryKey: [queryKeys.adminExamReviews.get, id],
    queryFn: () => getOne(id),
    enabled: Boolean(id) && enabled,
  })

  return {
    ...query,
  }
}

export default useAdminGetOne
export { useAdminGetOne as useExamAuthoringReviewAdminGetOne }
