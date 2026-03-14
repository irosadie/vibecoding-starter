import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import PanelPageContent from "./_components/panel-content"

export default function PanelPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PanelPageContent />
    </Suspense>
  )
}
