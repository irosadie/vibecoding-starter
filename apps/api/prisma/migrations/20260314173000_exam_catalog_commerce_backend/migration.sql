DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
    CREATE TYPE "ProductType" AS ENUM ('EXAM', 'MENTORING_PACKAGE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamLevel') THEN
    CREATE TYPE "ExamLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommerceOrderStatus') THEN
    CREATE TYPE "CommerceOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'EXPIRED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "exam_products" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "level" "ExamLevel" NOT NULL,
  "short_description" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price_amount" INTEGER NOT NULL,
  "is_published" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(6),
  CONSTRAINT "exam_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "commerce_cart_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "product_type" "ProductType" NOT NULL,
  "product_id" UUID NOT NULL,
  "title_snapshot" VARCHAR(255) NOT NULL,
  "unit_price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_cart_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "commerce_cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "commerce_orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "status" "CommerceOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "total_amount" INTEGER NOT NULL,
  "payment_provider" VARCHAR(50),
  "payment_reference" VARCHAR(150),
  "paid_at" TIMESTAMP(6),
  "failed_at" TIMESTAMP(6),
  "expired_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "commerce_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "commerce_order_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "product_type" "ProductType" NOT NULL,
  "product_id" UUID NOT NULL,
  "title_snapshot" VARCHAR(255) NOT NULL,
  "price_amount" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "commerce_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "commerce_ownerships" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "order_id" UUID NOT NULL,
  "product_type" "ProductType" NOT NULL,
  "product_id" UUID NOT NULL,
  "granted_at" TIMESTAMP(6) NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_ownerships_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "commerce_ownerships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "commerce_ownerships_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "exam_products_slug_key" ON "exam_products"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "commerce_cart_items_user_id_product_type_product_id_key" ON "commerce_cart_items"("user_id", "product_type", "product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "commerce_ownerships_user_id_product_type_product_id_key" ON "commerce_ownerships"("user_id", "product_type", "product_id");

CREATE INDEX IF NOT EXISTS "exam_products_is_published_idx" ON "exam_products"("is_published");
CREATE INDEX IF NOT EXISTS "exam_products_category_idx" ON "exam_products"("category");
CREATE INDEX IF NOT EXISTS "exam_products_level_idx" ON "exam_products"("level");
CREATE INDEX IF NOT EXISTS "commerce_cart_items_user_id_idx" ON "commerce_cart_items"("user_id");
CREATE INDEX IF NOT EXISTS "commerce_cart_items_product_type_product_id_idx" ON "commerce_cart_items"("product_type", "product_id");
CREATE INDEX IF NOT EXISTS "commerce_orders_user_id_idx" ON "commerce_orders"("user_id");
CREATE INDEX IF NOT EXISTS "commerce_orders_status_idx" ON "commerce_orders"("status");
CREATE INDEX IF NOT EXISTS "commerce_orders_payment_reference_idx" ON "commerce_orders"("payment_reference");
CREATE INDEX IF NOT EXISTS "commerce_order_items_order_id_idx" ON "commerce_order_items"("order_id");
CREATE INDEX IF NOT EXISTS "commerce_order_items_product_type_product_id_idx" ON "commerce_order_items"("product_type", "product_id");
CREATE INDEX IF NOT EXISTS "commerce_ownerships_order_id_idx" ON "commerce_ownerships"("order_id");
CREATE INDEX IF NOT EXISTS "commerce_ownerships_product_type_product_id_idx" ON "commerce_ownerships"("product_type", "product_id");
