import { CommerceService } from "@/application/services/commerce-service"
import { PrismaCommerceRepository } from "@/infrastructure/database/PrismaCommerceRepository"
import { CommerceController } from "@/interfaces/http/controllers/commerce-controller"
import { Hono } from "hono"

const repository = new PrismaCommerceRepository()
const commerceService = new CommerceService({
  repository,
})
const commerceController = new CommerceController(commerceService)

export const catalogRoutes = new Hono()
  .get("/exams", commerceController.listCatalog)
  .get("/exams/:slug", commerceController.getCatalogDetail)
