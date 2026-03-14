import { CommerceService } from "@/application/services/commerce-service"
import {
  addCartItemSchema,
  cartItemParamSchema,
  checkoutSchema,
  orderParamSchema,
  paymentWebhookSchema,
} from "@/application/validators/commerce.schemas"
import { PrismaCommerceRepository } from "@/infrastructure/database/PrismaCommerceRepository"
import { CommerceController } from "@/interfaces/http/controllers/commerce-controller"
import {
  authSessionMiddleware,
  requireRoles,
} from "@/interfaces/http/middleware/auth-session"
import { zValidator } from "@/interfaces/http/utils/validation"
import { Hono } from "hono"

const repository = new PrismaCommerceRepository()
const commerceService = new CommerceService({
  repository,
})
const commerceController = new CommerceController(commerceService)

export const commerceRoutes = new Hono()
  .get(
    "/cart",
    authSessionMiddleware,
    requireRoles(["user", "creator", "admin"]),
    commerceController.getCart,
  )
  .post(
    "/cart/items",
    authSessionMiddleware,
    requireRoles(["user", "creator", "admin"]),
    zValidator("json", addCartItemSchema),
    commerceController.addCartItem,
  )
  .delete(
    "/cart/items/:id",
    authSessionMiddleware,
    requireRoles(["user", "creator", "admin"]),
    zValidator("param", cartItemParamSchema),
    commerceController.removeCartItem,
  )
  .post(
    "/checkout",
    authSessionMiddleware,
    requireRoles(["user", "creator", "admin"]),
    zValidator("json", checkoutSchema),
    commerceController.checkout,
  )
  .get(
    "/orders/:id",
    authSessionMiddleware,
    requireRoles(["user", "creator", "admin"]),
    zValidator("param", orderParamSchema),
    commerceController.getOrder,
  )
  .post(
    "/payments/webhook/xendit",
    zValidator("json", paymentWebhookSchema),
    commerceController.xenditWebhook,
  )
