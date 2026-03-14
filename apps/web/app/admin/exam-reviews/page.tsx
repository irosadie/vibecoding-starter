import { Suspense } from "react"
import { LoadingSpinner } from "$/components/loading-spinner"
import AdminExamReviewQueuePageContent from "./_components/admin-exam-review-queue-page-content"

export default function AdminExamReviewsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminExamReviewQueuePageContent />
    </Suspense>
  )
}
