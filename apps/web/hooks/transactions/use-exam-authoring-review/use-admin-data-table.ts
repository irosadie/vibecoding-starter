import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { DataTableResponse, ErrorResponse } from "$/types/generals"
import { type QueryFunctionContext, useQuery } from "@tanstack/react-query"
import {
  type AdminExamReviewListQuerySchemaProps,
  type ExamAuthoringReviewStatus,
  adminExamReviewListQuerySchema,
} from "@vibecoding-starter/schemas"
import type { AdminExamReviewSummaryResponseProps } from "@vibecoding-starter/types"
import type { AxiosError } from "axios"

const DEFAULT_LIMIT = 10

type DataTableFilterProps = {
  search?: string
  status?: ExamAuthoringReviewStatus
}

type UseAdminDataTableProps = {
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
  const queryParams: AdminExamReviewListQuerySchemaProps =
    adminExamReviewListQuerySchema.parse({
      page,
      perPage: limit,
      search: filter?.search?.trim() || undefined,
      status: filter?.status,
    })

  const result = await axios<DataTableResponse<AdminExamReviewSummaryResponseProps>>({
    method: "GET",
    url: apiRouters.adminExamReviews.index,
    params: queryParams,
  })

  return result
}

const useAdminDataTable = (args?: UseAdminDataTableProps) => {
  const {
    key = queryKeys.adminExamReviews.index,
    page = 1,
    filter,
    limit = DEFAULT_LIMIT,
    isAutoFetch = true,
  } = args || {}

  const dataTable = useQuery<
    DataTableResponse<AdminExamReviewSummaryResponseProps>,
    ErrorResponse<AxiosError>,
    DataTableResponse<AdminExamReviewSummaryResponseProps>,
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

export default useAdminDataTable
export { useAdminDataTable as useExamAuthoringReviewAdminDataTable }
