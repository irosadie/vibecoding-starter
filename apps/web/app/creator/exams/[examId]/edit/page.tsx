import { Suspense } from "react"
import { LoadingSpinner } from "$/components/loading-spinner"
import CreatorExamEditorPageContent from "./_components/creator-exam-editor-page-content"

type CreatorExamEditorPageProps = {
  params: {
    examId: string
  }
}

export default function CreatorExamEditorPage({
  params,
}: CreatorExamEditorPageProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreatorExamEditorPageContent examId={params.examId} />
    </Suspense>
  )
}
