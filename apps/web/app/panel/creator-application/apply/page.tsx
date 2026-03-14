import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import CreatorApplicationApplyPageContent from "./_components/apply-content"

export default function CreatorApplicationApplyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorApplicationApplyPageContent />
    </Suspense>
  )
}
