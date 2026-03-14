import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import CreatorApplicationStatusPageContent from "./_components/status-content"

export default function CreatorApplicationStatusPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorApplicationStatusPageContent />
    </Suspense>
  )
}
