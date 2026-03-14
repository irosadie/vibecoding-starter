"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import { queryKeys } from "$/constants"
import {
  useExamCommerceGetOne,
  useExamCommerceInsertOne,
} from "$/hooks/transactions/use-exam-commerce"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

type ExamDetailPageContentProps = {
  slug: string
}

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

  return "Exam tidak ditemukan."
}

export default function ExamDetailPageContent({
  slug,
}: ExamDetailPageContentProps) {
  const queryClient = useQueryClient()
  const {
    data: exam,
    isLoading,
    error,
  } = useExamCommerceGetOne({
    slug,
  })
  const addToCartMutation = useExamCommerceInsertOne()

  const handleAddToCart = () => {
    if (!exam) {
      return
    }

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
        },
      },
    )
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <PanelCard className="rounded-3xl" title="Memuat detail exam...">
          <p className="text-sm text-gray-600">Mohon tunggu sebentar.</p>
        </PanelCard>
      </main>
    )
  }

  if (!exam || error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <PanelCard className="rounded-3xl" title="Exam tidak ditemukan">
          <p className="text-sm text-gray-600">
            {error
              ? getErrorMessage(error)
              : `Slug ${slug} tidak tersedia di katalog`}
          </p>
          <Link
            href="/exams"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Kembali ke katalog
          </Link>
        </PanelCard>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <PanelCard className="rounded-3xl" noPadding>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
              {exam.category} · {exam.level}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{exam.title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {exam.description || exam.short_description}
            </p>
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Benefit yang didapat
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
                <li>Akses penuh ke bank soal exam ini</li>
                <li>Pembahasan dan pembaruan materi berkala</li>
                <li>Progress tersimpan otomatis pada akun kamu</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-600">Kategori</p>
            <p className="text-lg font-semibold text-gray-900">{exam.category}</p>

            <p className="mt-4 text-sm text-gray-600">Level</p>
            <p className="text-lg font-semibold text-gray-900">{exam.level}</p>

            <p className="mt-4 text-sm text-gray-600">Harga</p>
            <p className="text-2xl font-bold text-primary-700">
              {formatPrice(exam.price_amount)}
            </p>

            <div className="mt-5 grid gap-2">
              <Link
                href="/checkout"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Checkout sekarang
              </Link>
              <Button
                intent="secondary"
                loading={addToCartMutation.isPending}
                onClick={handleAddToCart}
              >
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      </PanelCard>
    </main>
  )
}
