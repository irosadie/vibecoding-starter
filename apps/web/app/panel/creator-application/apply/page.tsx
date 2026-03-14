import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import CreatorApplicationApplyContent from "./creator-application-apply-content"

export default function CreatorApplicationApplyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorApplicationApplyContent />
    </Suspense>
  )
}
