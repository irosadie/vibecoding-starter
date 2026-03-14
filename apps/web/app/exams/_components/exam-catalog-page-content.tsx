"use client"

import { Button } from "$/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "$/components/drawer"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { queryKeys } from "$/constants"
import {
  useExamCommerceCart,
  useExamCommerceDataTable,
  useExamCommerceDeleteOne,
  useExamCommerceInsertOne,
} from "$/hooks/transactions/use-exam-commerce"
import { useQueryClient } from "@tanstack/react-query"
import type { CatalogExamResponseProps } from "@vibecoding-starter/types"
import Link from "next/link"
import { useMemo, useState } from "react"

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Terjadi kesalahan saat memuat data."
}

export default function ExamCatalogPageContent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { data: exams, isLoading, error } = useExamCommerceDataTable({
    filter: {
      search: search.trim() || undefined,
    },
  })
  const {
    data: cart,
    isLoading: isCartLoading,
    error: cartError,
  } = useExamCommerceCart({
    enabled: isCartOpen,
  })
  const addToCartMutation = useExamCommerceInsertOne()
  const removeCartItemMutation = useExamCommerceDeleteOne()

  const cartItems = cart?.items || []

  const cartSummary = useMemo(
    () =>
      cart?.summary || {
        total_items: 0,
        subtotal_amount: 0,
        discount_amount: 0,
        grand_total_amount: 0,
      },
    [cart?.summary],
  )

  const handleAddToCart = (exam: CatalogExamResponseProps) => {
    addToCartMutation.mutate(
      {
        product_type: "EXAM",
        product_id: exam.id,
        quantity: 1,
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.commerce.cart],
          })
          setIsCartOpen(true)
        },
      },
    )
  }

  const handleRemoveFromCart = (itemId: string) => {
    removeCartItemMutation.mutate(itemId, {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.commerce.cart],
        })
      },
    })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Exam Catalog"
        description="Pilih ujian yang ingin dibeli, lalu lanjut checkout"
        action={
          <Button
            intent="secondary"
            onClick={() => setIsCartOpen(true)}
            className="min-w-[140px]"
          >
            Cart ({cartSummary.total_items})
          </Button>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Cari judul ujian..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {getErrorMessage(error)}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat katalog ujian...</p>
        ) : null}

        {!isLoading && !error && exams?.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada exam yang tersedia.</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(exams || []).map((exam) => (
            <article key={exam.id} className="rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                {exam.category} · {exam.level}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {exam.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {exam.short_description}
              </p>
              <p className="mt-4 text-xl font-semibold text-primary-700">
                {formatPrice(exam.price_amount)}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/exams/${exam.slug}`}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Detail
                </Link>
                <Button
                  intent="primary"
                  className="flex-1"
                  loading={addToCartMutation.isPending}
                  onClick={() => handleAddToCart(exam)}
                >
                  Add to cart
                </Button>
              </div>
            </article>
          ))}
        </div>
      </PanelCard>

      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DrawerContent>
          <DrawerHeader className="border-b border-gray-200 px-6 py-4">
            <DrawerTitle>Exam Cart</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartError ? (
              <p className="text-sm text-danger-600">{getErrorMessage(cartError)}</p>
            ) : null}

            {isCartLoading ? (
              <p className="text-sm text-gray-500">Memuat cart...</p>
            ) : null}

            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500">Cart masih kosong.</p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price_amount)}
                      </p>
                    </div>
                    <Button
                      intent="danger"
                      textOnly
                      className="h-auto p-0"
                      loading={removeCartItemMutation.isPending}
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DrawerFooter className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Grand total</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(cartSummary.grand_total_amount)}
              </span>
            </div>
            <Link
              href="/checkout"
              className={`inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 ${
                cartItems.length === 0 ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={cartItems.length === 0}
              onClick={() => {
                if (cartItems.length === 0) {
                  return
                }

                setIsCartOpen(false)
              }}
            >
              Continue to checkout
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  )
}
