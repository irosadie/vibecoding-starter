import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useQuery } from "@tanstack/react-query"
import type { CatalogExamResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type UseGetOneProps = {
  slug: string
  enabled?: boolean
}

const getOne = async (slug: string) => {
  const result = await axios<CatalogExamResponseProps>({
    method: "GET",
    url: pathVariable(apiRouters.catalogExams.show, { slug }),
  })

  return result
}

const useGetOne = ({ slug, enabled = true }: UseGetOneProps) => {
  const query = useQuery<
    CatalogExamResponseProps,
    ErrorResponse<AxiosError>,
    CatalogExamResponseProps,
    [string, string]
  >({
    queryKey: [queryKeys.catalogExams.get, slug],
    queryFn: () => getOne(slug),
    enabled: enabled && !!slug,
  })

  return {
    ...query,
  }
}

export default useGetOne
export { useGetOne as useExamCommerceGetOne }
