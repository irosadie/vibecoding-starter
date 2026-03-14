import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { CreatorExamDraftResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UseGetOneProps = {
  id: string
  enabled?: boolean
}

const getOne = async (id: string) => {
  const result = await axios<CreatorExamDraftResponseProps>({
    method: "GET",
    url: pathVariable(apiRouters.creatorExams.show, { id }),
  })

  return result
}

const useGetOne = ({ id, enabled = true }: UseGetOneProps) => {
  const query = useQuery<
    CreatorExamDraftResponseProps,
    ErrorResponse<AxiosError>,
    CreatorExamDraftResponseProps,
    [string, string]
  >({
    queryKey: [queryKeys.creatorExams.get, id],
    queryFn: () => getOne(id),
    enabled: Boolean(id) && enabled,
  })

  return {
    ...query,
  }
}

export default useGetOne
export { useGetOne as useExamAuthoringReviewGetOne }
