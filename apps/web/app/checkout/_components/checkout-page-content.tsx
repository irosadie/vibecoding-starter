"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import Link from "next/link"
import { useMemo, useState } from "react"

type CheckoutItem = {
  id: string
  title: string
  priceAmount: number
}

const DUMMY_CHECKOUT_ITEMS: CheckoutItem[] = [
  {
    id: "ex-001",
    title: "Tes CPNS Intensif 2026",
    priceAmount: 149000,
  },
]

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

export default function CheckoutPageContent() {
  const [paymentChannel, setPaymentChannel] = useState("BCA_VA")
  const [isOrderCreated, setIsOrderCreated] = useState(false)

  const totalAmount = useMemo(
    () => DUMMY_CHECKOUT_ITEMS.reduce((acc, item) => acc + item.priceAmount, 0),
    [],
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Checkout"
        description="Review cart dan pilih channel pembayaran."
      >
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Order Items</h2>
            <div className="mt-3 space-y-3">
              {DUMMY_CHECKOUT_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                >
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.priceAmount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Input
                label="Payment Channel"
                value={paymentChannel}
                onChange={(event) => setPaymentChannel(event.target.value)}
              />
              <Input
                label="Coupon Code (opsional)"
                placeholder="Masukkan kode promo"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Discount</span>
                <span>{formatPrice(0)}</span>
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
              onClick={() => setIsOrderCreated(true)}
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

      {isOrderCreated && (
        <PanelCard
          className="rounded-3xl"
          title="Order Status"
          description="Mock hasil checkout sebelum integrasi backend payment."
        >
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm text-gray-600">Order Reference</p>
              <p className="text-sm font-semibold text-gray-900">
                ORD-FT003-MOCK-001
              </p>
            </div>
            <StatusBadge variant="warning">PENDING_PAYMENT</StatusBadge>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Langkah berikutnya: redirect ke payment URL provider dan polling
            status order sampai `PAID`.
          </p>
        </PanelCard>
      )}
    </main>
  )
}
