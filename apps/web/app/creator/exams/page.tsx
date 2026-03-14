import { Suspense } from "react"
import { LoadingSpinner } from "$/components/loading-spinner"
import CreatorExamDashboardPageContent from "./_components/creator-exam-dashboard-page-content"

export default function CreatorExamDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorExamDashboardPageContent />
    </Suspense>
  )
}
