import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import CreatorApplicationStatusContent from "./creator-application-status-content"

export default function CreatorApplicationStatusPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorApplicationStatusContent />
    </Suspense>
  )
}
