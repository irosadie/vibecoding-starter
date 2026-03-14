"use client"

import { Button } from "$/components/button"
import { PanelCard } from "$/components/panel-card"
import Link from "next/link"

type ExamDetailItem = {
  slug: string
  title: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  description: string
  benefits: string[]
  totalQuestion: number
  durationMinutes: number
  priceAmount: number
}

type ExamDetailPageContentProps = {
  slug: string
}

const DUMMY_EXAM_DETAILS: Record<string, ExamDetailItem> = {
  "tes-cpns-intensif-2026": {
    slug: "tes-cpns-intensif-2026",
    title: "Tes CPNS Intensif 2026",
    category: "CPNS",
    level: "INTERMEDIATE",
    description:
      "Paket latihan lengkap untuk persiapan CPNS dengan simulasi waktu nyata dan pembahasan detail.",
    benefits: [
      "1000+ bank soal",
      "Video pembahasan tiap domain",
      "Progress tracking per kompetensi",
    ],
    totalQuestion: 110,
    durationMinutes: 100,
    priceAmount: 149000,
  },
  "simulasi-utbk-saintek": {
    slug: "simulasi-utbk-saintek",
    title: "Simulasi UTBK Saintek",
    category: "UTBK",
    level: "ADVANCED",
    description:
      "Simulasi UTBK untuk saintek dengan fokus ke hitungan, penalaran, dan strategi waktu.",
    benefits: [
      "Latihan adaptif berdasarkan performa",
      "Pembahasan mendalam",
      "Rekomendasi topik remedial",
    ],
    totalQuestion: 120,
    durationMinutes: 110,
    priceAmount: 199000,
  },
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

export default function ExamDetailPageContent({
  slug,
}: ExamDetailPageContentProps) {
  const exam = DUMMY_EXAM_DETAILS[slug]

  if (!exam) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <PanelCard className="rounded-3xl" title="Exam tidak ditemukan">
          <p className="text-sm text-gray-600">
            Slug <span className="font-medium text-gray-900">{slug}</span> tidak
            tersedia di katalog dummy.
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
              {exam.description}
            </p>
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Benefit yang didapat
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
                {exam.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-600">Durasi</p>
            <p className="text-lg font-semibold text-gray-900">
              {exam.durationMinutes} menit
            </p>

            <p className="mt-4 text-sm text-gray-600">Total soal</p>
            <p className="text-lg font-semibold text-gray-900">
              {exam.totalQuestion} soal
            </p>

            <p className="mt-4 text-sm text-gray-600">Harga</p>
            <p className="text-2xl font-bold text-primary-700">
              {formatPrice(exam.priceAmount)}
            </p>

            <div className="mt-5 grid gap-2">
              <Link
                href="/checkout"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Checkout sekarang
              </Link>
              <Button intent="secondary">Add to cart</Button>
            </div>
          </div>
        </div>
      </PanelCard>
    </main>
  )
}
