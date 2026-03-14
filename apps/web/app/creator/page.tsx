import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import CreatorPageContent from "./_components/creator-content"

export default function CreatorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorPageContent />
    </Suspense>
  )
}
