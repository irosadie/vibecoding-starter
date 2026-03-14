"use client"

import { Button } from "$/components/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "$/components/drawer"
import { PanelCard } from "$/components/panel-card"
import Link from "next/link"
import { useMemo, useState } from "react"

type ExamCatalogItem = {
  id: string
  slug: string
  title: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  shortDescription: string
  priceAmount: number
}

type CartItem = {
  id: string
  examId: string
  title: string
  priceAmount: number
}

const DUMMY_EXAMS: ExamCatalogItem[] = [
  {
    id: "ex-001",
    slug: "tes-cpns-intensif-2026",
    title: "Tes CPNS Intensif 2026",
    category: "CPNS",
    level: "INTERMEDIATE",
    shortDescription: "Tryout + pembahasan video untuk TWK, TIU, dan TKP.",
    priceAmount: 149000,
  },
  {
    id: "ex-002",
    slug: "simulasi-utbk-saintek",
    title: "Simulasi UTBK Saintek",
    category: "UTBK",
    level: "ADVANCED",
    shortDescription: "Paket soal tinggi + bank pembahasan step-by-step.",
    priceAmount: 199000,
  },
  {
    id: "ex-003",
    slug: "bahasa-inggris-akademik",
    title: "Bahasa Inggris Akademik",
    category: "Language",
    level: "BEGINNER",
    shortDescription: "Latihan reading & grammar untuk tes masuk kampus.",
    priceAmount: 89000,
  },
]

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

export default function ExamCatalogPageContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const cartSummary = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        grandTotalAmount: acc.grandTotalAmount + item.priceAmount,
      }),
      { totalItems: 0, grandTotalAmount: 0 },
    )
  }, [cartItems])

  const addToCart = (exam: ExamCatalogItem) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.examId === exam.id)) {
        return prev
      }

      return [
        ...prev,
        {
          id: `cart-${exam.id}`,
          examId: exam.id,
          title: exam.title,
          priceAmount: exam.priceAmount,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Exam Catalog"
        description="Pilih ujian yang ingin dibeli, lalu lanjut checkout."
        action={
          <Button
            intent="secondary"
            onClick={() => setIsCartOpen(true)}
            className="min-w-[140px]"
          >
            Cart ({cartSummary.totalItems})
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DUMMY_EXAMS.map((exam) => (
            <article
              key={exam.id}
              className="rounded-2xl border border-gray-200 p-5 shadow-xs"
            >
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                {exam.category} · {exam.level}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {exam.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{exam.shortDescription}</p>
              <p className="mt-4 text-xl font-semibold text-primary-700">
                {formatPrice(exam.priceAmount)}
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
                  onClick={() => addToCart(exam)}
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
                        {formatPrice(item.priceAmount)}
                      </p>
                    </div>
                    <Button
                      intent="danger"
                      textOnly
                      className="h-auto p-0"
                      onClick={() => removeFromCart(item.id)}
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
                {formatPrice(cartSummary.grandTotalAmount)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              onClick={() => setIsCartOpen(false)}
            >
              Continue to checkout
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  )
}
