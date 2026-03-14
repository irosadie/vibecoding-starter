import { apiRouters, queryKeys } from "$/constants"
import { axios } from "$/services/axios"
import type { ErrorResponse } from "$/types/generals"
import { useMutation } from "@tanstack/react-query"
import {
  type AdminExamReviewRejectSchemaProps,
  adminExamReviewRejectSchema,
} from "@vibecoding-starter/schemas"
import type { AdminExamReviewResponseProps } from "@vibecoding-starter/types"
import { pathVariable } from "@vibecoding-starter/utils"
import type { AxiosError } from "axios"

type AdminRejectOneParamsProps = {
  id: string
  payload: AdminExamReviewRejectSchemaProps
}

const rejectOne = async ({ id, payload }: AdminRejectOneParamsProps) => {
  const validatedPayload = adminExamReviewRejectSchema.parse(payload)

  const result = await axios<AdminExamReviewResponseProps>({
    method: "POST",
    url: pathVariable(apiRouters.adminExamReviews.reject, { id }),
    data: validatedPayload,
  })

  return result
}

const useAdminRejectOne = () => {
  const mutation = useMutation<
    AdminExamReviewResponseProps,
    ErrorResponse<AxiosError>,
    AdminRejectOneParamsProps,
    unknown
  >({
    mutationKey: [queryKeys.adminExamReviews.reject],
    mutationFn: rejectOne,
  })

  return {
    ...mutation,
  }
}

export default useAdminRejectOne
export { useAdminRejectOne as useExamAuthoringReviewAdminRejectOne }
export type { AdminRejectOneParamsProps }
