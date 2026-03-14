"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { queryKeys } from "$/constants"
import {
  useExamCommerceCart,
  useExamCommerceOrderStatus,
  useExamCommerceUpdateOne,
} from "$/hooks/transactions/use-exam-commerce"
import { useQueryClient } from "@tanstack/react-query"
import type { CommerceOrderStatus } from "@vibecoding-starter/types"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

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

  return "Terjadi kesalahan pada proses checkout."
}

const getStatusVariant = (status: CommerceOrderStatus) => {
  if (status === "PAID") {
    return "success"
  }

  if (status === "PENDING_PAYMENT") {
    return "warning"
  }

  if (status === "FAILED" || status === "EXPIRED") {
    return "danger"
  }

  return "neutral"
}

type PaymentMethodOption = {
  label: string
  value: "BANK_TRANSFER" | "EWALLET" | "VIRTUAL_ACCOUNT"
}

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    label: "Bank Transfer",
    value: "BANK_TRANSFER",
  },
  {
    label: "E-Wallet",
    value: "EWALLET",
  },
  {
    label: "Virtual Account",
    value: "VIRTUAL_ACCOUNT",
  },
]

export default function CheckoutPageContent() {
  const queryClient = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState<
    "BANK_TRANSFER" | "EWALLET" | "VIRTUAL_ACCOUNT"
  >("VIRTUAL_ACCOUNT")
  const [paymentChannel, setPaymentChannel] = useState("BCA")
  const [orderId, setOrderId] = useState<string | null>(null)
  const { data: cart, isLoading, error } = useExamCommerceCart()
  const checkoutMutation = useExamCommerceUpdateOne()
  const { data: order, error: orderError } = useExamCommerceOrderStatus({
    orderId: orderId || "",
    enabled: !!orderId,
  })
  const checkoutError = checkoutMutation.error

  const totalAmount = useMemo(() => cart?.summary.grand_total_amount || 0, [
    cart?.summary.grand_total_amount,
  ])

  const isCreateOrderDisabled =
    !cart || cart.items.length === 0 || checkoutMutation.isPending

  const handleCheckout = () => {
    checkoutMutation.mutate(
      {
        payment_method: paymentMethod,
        channel_code: paymentChannel,
      },
      {
        onSuccess: (result) => {
          setOrderId(result.id)
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.commerce.cart],
          })
        },
      },
    )
  }

  const latestOrder = order || checkoutMutation.data

  useEffect(() => {
    if (order?.status !== "PAID") {
      return
    }

    void queryClient.invalidateQueries({
      queryKey: [queryKeys.commerce.cart],
    })
    void queryClient.invalidateQueries({
      queryKey: [queryKeys.catalogExams.index],
    })
  }, [order?.status, queryClient])

  const status = latestOrder?.status || "PENDING_PAYMENT"
  const statusVariant = getStatusVariant(status)

  const panelDescription = useMemo(
    () => "Review cart dan pilih channel pembayaran.",
    [],
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Checkout"
        description={panelDescription}
      >
        {error ? (
          <div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {getErrorMessage(error)}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat data cart...</p>
        ) : null}

        {!isLoading && cart && cart.items.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Cart kamu masih kosong. Tambahkan exam dari katalog untuk lanjut
            checkout.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
            <div className="mt-3 space-y-3">
              {(cart?.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                >
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.subtotal_amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Payment Method
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        paymentMethod === option.value
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                      onClick={() => setPaymentMethod(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Payment Channel"
                value={paymentChannel}
                onChange={(event) => setPaymentChannel(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart?.summary.subtotal_amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Discount</span>
                <span>{formatPrice(cart?.summary.discount_amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-gray-900">
                <span className="font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-primary-700">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              intent="primary"
              className="mt-4 w-full"
              onClick={handleCheckout}
              loading={checkoutMutation.isPending}
              disabled={isCreateOrderDisabled}
            >
              Create order & pay
            </Button>
            <Link
              href="/exams"
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Back to catalog
            </Link>
          </div>
        </div>
      </PanelCard>

      {checkoutError ? (
        <PanelCard className="rounded-3xl" title="Checkout gagal">
          <p className="text-sm text-danger-600">{getErrorMessage(checkoutError)}</p>
        </PanelCard>
      ) : null}

      {orderError ? (
        <PanelCard className="rounded-3xl" title="Gagal memuat status order">
          <p className="text-sm text-danger-600">{getErrorMessage(orderError)}</p>
        </PanelCard>
      ) : null}

      {latestOrder && (
        <PanelCard
          className="rounded-3xl"
          title="Order Status"
          description="Status order dipolling otomatis setiap 5 detik."
        >
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm text-gray-600">Order Reference</p>
              <p className="text-sm font-semibold text-gray-900">
                {latestOrder.id}
              </p>
              {latestOrder.payment_reference ? (
                <p className="text-xs text-gray-500">
                  Payment Ref: {latestOrder.payment_reference}
                </p>
              ) : null}
            </div>
            <StatusBadge variant={statusVariant}>{status}</StatusBadge>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Setelah pembayaran berhasil, entitlement exam akan aktif otomatis.
          </p>
        </PanelCard>
      )}
    </main>
  )
}
