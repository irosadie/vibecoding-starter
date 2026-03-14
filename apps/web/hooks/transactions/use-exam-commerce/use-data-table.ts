import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { DataTableResponse, ErrorResponse } from "$/types/generals"
import { type QueryFunctionContext, useQuery } from "@tanstack/react-query"
import {
  type ExamCatalogQuerySchemaProps,
  examCatalogQuerySchema,
} from "@vibecoding-starter/schemas"
import type { CatalogExamResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const DEFAULT_LIMIT = 10

type DataTableFilterProps = {
  search?: string
  category?: string
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
}

type UseDataTableProps = {
  isAutoFetch?: boolean
  key?: string
  page?: number
  filter?: DataTableFilterProps
  limit?: number
}

type DataTableQueryKey = [
  string,
  {
    page: number
    limit: number
    filter?: DataTableFilterProps
  },
]

const fetchDataTable = async (
  args: QueryFunctionContext<DataTableQueryKey>,
) => {
  const [, { page, limit, filter }] = args.queryKey
  const queryParams: ExamCatalogQuerySchemaProps = examCatalogQuerySchema.parse({
    page,
    perPage: limit,
    search: filter?.search?.trim() || undefined,
    category: filter?.category?.trim() || undefined,
    level: filter?.level,
  })

  const result = await axios<DataTableResponse<CatalogExamResponseProps>>({
    method: "GET",
    url: apiRouters.catalogExams.index,
    params: queryParams,
  })

  return result
}

const useDataTable = (args?: UseDataTableProps) => {
  const {
    key = queryKeys.catalogExams.index,
    page = 1,
    filter,
    limit = DEFAULT_LIMIT,
    isAutoFetch = true,
  } = args || {}

  const dataTable = useQuery<
    DataTableResponse<CatalogExamResponseProps>,
    ErrorResponse<AxiosError>,
    DataTableResponse<CatalogExamResponseProps>,
    DataTableQueryKey
  >({
    queryKey: [key, { page, limit, filter }],
    enabled: isAutoFetch,
    queryFn: fetchDataTable,
  })

  return {
    limit,
    refetch: dataTable.refetch,
    data: dataTable.data?.list,
    pagination: dataTable.data?.meta.pagination,
    error: dataTable.error,
    isLoading: dataTable.isLoading,
  }
}

export default useDataTable
export { useDataTable as useExamCommerceDataTable }
