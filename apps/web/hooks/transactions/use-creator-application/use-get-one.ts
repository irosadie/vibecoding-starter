import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { CreatorApplicationGetOneResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

type UseGetOneProps = {
  enabled?: boolean
}

const getOne = async () => {
  const result = await axios<CreatorApplicationGetOneResponseProps>({
    method: "GET",
    url: apiRouters.creatorApplications.get,
  })

  return result
}

const useGetOne = (args?: UseGetOneProps) => {
  const { enabled = true } = args || {}

  const query = useQuery<
    CreatorApplicationGetOneResponseProps,
    ErrorResponse<AxiosError>,
    CreatorApplicationGetOneResponseProps,
    [string]
  >({
    queryKey: [queryKeys.creatorApplications.get],
    queryFn: getOne,
    enabled,
  })

  return {
    ...query,
  }
}

export default useGetOne
export { useGetOne as useCreatorApplicationGetOne }
