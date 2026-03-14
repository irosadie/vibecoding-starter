import { Suspense } from "react"
import ExamDetailPageContent from "./_components/exam-detail-page-content"

type ExamDetailPageProps = {
  params: {
    slug: string
  }
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 text-sm text-slate-500">
          Loading exam detail...
        </main>
      }
    >
      <ExamDetailPageContent slug={params.slug} />
    </Suspense>
  )
}
