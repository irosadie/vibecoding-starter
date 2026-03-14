import { LoadingSpinner } from "$/components/loading-spinner"
import { Suspense } from "react"
import AdminPageContent from "./_components/admin-content"

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminPageContent />
    </Suspense>
  )
}
