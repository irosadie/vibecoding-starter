import type { CommerceService } from "@/application/services/commerce-service"
import {
  addCartItemSchema,
  cartItemParamSchema,
  catalogExamQuerySchema,
  catalogExamSlugParamSchema,
  checkoutSchema,
  orderParamSchema,
  paymentWebhookSchema,
} from "@/application/validators/commerce.schemas"
import { DomainError } from "@/domain/errors/DomainError"
import { getAuthSession } from "@/interfaces/http/middleware/auth-session"
import { successResponse } from "@/interfaces/http/utils/response"
import type { Context } from "hono"

const DEFAULT_WEBHOOK_TOKEN = "dev-xendit-token"

export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  listCatalog = async (c: Context) => {
    const query = catalogExamQuerySchema.parse(c.req.query())
    const result = await this.commerceService.listCatalog(query)

    return successResponse(c, {
      message: "Catalog loaded",
      data: result.list,
      meta: {
        total: result.total,
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: Math.max(1, Math.ceil(result.total / result.perPage)),
      },
    })
  }

  getCatalogDetail = async (c: Context) => {
    const params = catalogExamSlugParamSchema.parse(c.req.param())
    const result = await this.commerceService.getCatalogDetail(params.slug)

    return successResponse(c, {
      message: "Catalog detail loaded",
      data: result,
    })
  }

  getCart = async (c: Context) => {
    const session = getAuthSession(c)
    const result = await this.commerceService.getCart(session.userId)

    return successResponse(c, {
      message: "Cart loaded",
      data: result,
    })
  }

  addCartItem = async (c: Context) => {
    const session = getAuthSession(c)
    const payload = addCartItemSchema.parse(await c.req.json())
    const result = await this.commerceService.addCartItem(session.userId, payload)

    return successResponse(
      c,
      {
        message: "Cart item added",
        data: result,
      },
      201,
    )
  }

  removeCartItem = async (c: Context) => {
    const session = getAuthSession(c)
    const params = cartItemParamSchema.parse(c.req.param())
    await this.commerceService.removeCartItem(session.userId, params.id)

    return successResponse(c, {
      message: "Cart item removed",
      data: {
        id: params.id,
        removed: true,
      },
    })
  }

  checkout = async (c: Context) => {
    const session = getAuthSession(c)
    const payload = checkoutSchema.parse(await c.req.json())
    const result = await this.commerceService.checkout(session.userId, payload)

    return successResponse(
      c,
      {
        message: "Checkout created",
        data: result,
      },
      201,
    )
  }

  getOrder = async (c: Context) => {
    const session = getAuthSession(c)
    const params = orderParamSchema.parse(c.req.param())
    const result = await this.commerceService.getOrder(session.userId, params.id)

    return successResponse(c, {
      message: "Order loaded",
      data: result,
    })
  }

  xenditWebhook = async (c: Context) => {
    const callbackToken = c.req.header("x-callback-token")
    const expectedToken =
      process.env.XENDIT_CALLBACK_TOKEN || DEFAULT_WEBHOOK_TOKEN

    if (!callbackToken || callbackToken !== expectedToken) {
      throw DomainError.unauthorized("Invalid callback token")
    }

    const payload = paymentWebhookSchema.parse(await c.req.json())
    await this.commerceService.handlePaymentWebhook(payload)

    return successResponse(c, {
      message: "Webhook accepted",
      data: {
        accepted: true,
      },
    })
  }
}
