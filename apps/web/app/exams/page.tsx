import { Suspense } from "react"
import ExamCatalogPageContent from "./_components/exam-catalog-page-content"

export default function ExamCatalogPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-sm text-slate-500">
          Loading exam catalog...
        </main>
      }
    >
      <ExamCatalogPageContent />
    </Suspense>
  )
}
