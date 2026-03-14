import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type AdminExamReviewApproveSchemaProps,
  adminExamReviewApproveSchema,
} from "@vibecoding-starter/schemas"
import type { AdminExamReviewResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type AdminApproveOneParamsProps = {
  id: string
  payload?: AdminExamReviewApproveSchemaProps
}

const approveOne = async ({ id, payload }: AdminApproveOneParamsProps) => {
  const validatedPayload = adminExamReviewApproveSchema.parse(payload || {})

  const result = await axios<AdminExamReviewResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.adminExamReviews.approve, { id }),
    data: validatedPayload,
  })

  return result
}

const useAdminApproveOne = () => {
  const mutation = useMutation<
    AdminExamReviewResponseProps,
    ErrorResponse<AxiosError>,
    AdminApproveOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.adminExamReviews.approve],
    mutationFn: approveOne,
  })

  return {
    ...mutation,
  }
}

export default useAdminApproveOne
export { useAdminApproveOne as useExamAuthoringReviewAdminApproveOne }
export type { AdminApproveOneParamsProps }
