"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { Textarea } from "$/components/textarea"
import {
  useExamAuthoringReviewDeleteOne,
  useExamAuthoringReviewGetOne,
  useExamAuthoringReviewInsertQuestion,
  useExamAuthoringReviewSubmitReview,
  useExamAuthoringReviewUpdateOne,
  useExamAuthoringReviewUpdateQuestion,
} from "$/hooks/transactions/use-exam-authoring-review"
import {
  type ExamAuthoringQuestionCorrectOption,
  getExamAuthoringReviewStatusLabel,
} from "@vibecoding-starter/schemas"
import type { CreatorExamQuestionResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type CreatorExamEditorPageContentProps = {
  examId: string
}

type ExamQuestionDraft = {
  id: string
  prompt: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: ExamAuthoringQuestionCorrectOption
  explanation_text: string
  explanation_video_url: string
}

const reviewStatusVariantMap = {
  IN_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
} as const

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object") {
    if (
      "errors" in error &&
      Array.isArray(error.errors) &&
      error.errors[0] &&
      typeof error.errors[0] === "object" &&
      "message" in error.errors[0] &&
      typeof error.errors[0].message === "string"
    ) {
      return error.errors[0].message
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
  }

  return fallback
}

const toQuestionDraft = (
  question: CreatorExamQuestionResponseProps,
): ExamQuestionDraft => {
  return {
    id: question.id,
    prompt: question.prompt,
    option_a: question.option_a,
    option_b: question.option_b,
    option_c: question.option_c,
    option_d: question.option_d,
    correct_option: question.correct_option,
    explanation_text: question.explanation_text || "",
    explanation_video_url: question.explanation_video_url || "",
  }
}

export default function CreatorExamEditorPageContent({
  examId,
}: CreatorExamEditorPageContentProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"

  const draftQuery = useExamAuthoringReviewGetOne({
    id: examId,
    enabled: hasCreatorAccess,
  })
  const updateDraftMutation = useExamAuthoringReviewUpdateOne()
  const insertQuestionMutation = useExamAuthoringReviewInsertQuestion()
  const updateQuestionMutation = useExamAuthoringReviewUpdateQuestion()
  const deleteQuestionMutation = useExamAuthoringReviewDeleteOne()
  const submitReviewMutation = useExamAuthoringReviewSubmitReview()

  const draft = draftQuery.data

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
    "BEGINNER",
  )
  const [durationMinutes, setDurationMinutes] = useState("90")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<ExamQuestionDraft[]>([])
  const [activeQuestionId, setActiveQuestionId] = useState<string | undefined>(
    undefined,
  )
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!draft) {
      return
    }

    setTitle(draft.title)
    setCategory(draft.category)
    setLevel(draft.level)
    setDurationMinutes(String(draft.duration_minutes))
    setShortDescription(draft.short_description)
    setDescription(draft.description)

    const draftQuestions = draft.questions.map(toQuestionDraft)
    setQuestions(draftQuestions)
    setActiveQuestionId((currentActiveQuestionId) => {
      const hasCurrentQuestion = draftQuestions.some(
        (question) => question.id === currentActiveQuestionId,
      )

      if (hasCurrentQuestion) {
        return currentActiveQuestionId
      }

      return draftQuestions[0]?.id
    })
  }, [draft])

  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeQuestionId) || null,
    [questions, activeQuestionId],
  )

  const updateActiveQuestion = (
    updater: (question: ExamQuestionDraft) => ExamQuestionDraft,
  ) => {
    if (!activeQuestionId) {
      return
    }

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === activeQuestionId ? updater(question) : question,
      ),
    )
  }

  const handleSaveDraft = () => {
    const parsedDuration = Number(durationMinutes)

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setActionError("Durasi exam harus berupa angka lebih dari 0")
      setActionNotice(null)
      return
    }

    setActionError(null)
    setActionNotice(null)

    updateDraftMutation.mutate(
      {
        id: examId,
        payload: {
          title: title.trim(),
          category: category.trim(),
          level,
          short_description: shortDescription.trim(),
          description: description.trim(),
          duration_minutes: parsedDuration,
        },
      },
      {
        onSuccess: () => {
          draftQuery.refetch()
          setLastSavedAt(new Date().toISOString())
          setActionNotice("Metadata draft berhasil disimpan.")
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "Gagal menyimpan metadata draft."))
        },
      },
    )
  }

  const handleAddQuestion = () => {
    setActionError(null)
    setActionNotice(null)

    insertQuestionMutation.mutate(
      {
        id: examId,
        payload: {
          prompt: "Pertanyaan baru",
          option_a: "Option A",
          option_b: "Option B",
          option_c: "Option C",
          option_d: "Option D",
          correct_option: "A",
          explanation_text: "Tambahkan pembahasan soal.",
        },
      },
      {
        onSuccess: (result) => {
          draftQuery.refetch()
          setActiveQuestionId(result.id)
          setActionNotice("Soal baru berhasil ditambahkan.")
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "Gagal menambahkan soal baru."))
        },
      },
    )
  }

  const handleSaveActiveQuestion = () => {
    if (!activeQuestion) {
      setActionError("Pilih soal yang ingin disimpan.")
      setActionNotice(null)
      return
    }

    if (
      !activeQuestion.prompt.trim() ||
      !activeQuestion.option_a.trim() ||
      !activeQuestion.option_b.trim() ||
      !activeQuestion.option_c.trim() ||
      !activeQuestion.option_d.trim()
    ) {
      setActionError("Prompt dan seluruh option wajib diisi sebelum menyimpan.")
      setActionNotice(null)
      return
    }

    setActionError(null)
    setActionNotice(null)

    updateQuestionMutation.mutate(
      {
        id: examId,
        questionId: activeQuestion.id,
        payload: {
          prompt: activeQuestion.prompt,
          option_a: activeQuestion.option_a,
          option_b: activeQuestion.option_b,
          option_c: activeQuestion.option_c,
          option_d: activeQuestion.option_d,
          correct_option: activeQuestion.correct_option,
          explanation_text: activeQuestion.explanation_text.trim() || undefined,
          explanation_video_url:
            activeQuestion.explanation_video_url.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          draftQuery.refetch()
          setLastSavedAt(new Date().toISOString())
          setActionNotice("Soal aktif berhasil disimpan.")
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "Gagal menyimpan soal aktif."))
        },
      },
    )
  }

  const handleRemoveQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      setActionError("Draft harus memiliki minimal satu soal.")
      setActionNotice(null)
      return
    }

    setActionError(null)
    setActionNotice(null)

    deleteQuestionMutation.mutate(
      {
        id: examId,
        questionId,
      },
      {
        onSuccess: () => {
          draftQuery.refetch()
          setActiveQuestionId((currentActiveQuestionId) => {
            if (currentActiveQuestionId !== questionId) {
              return currentActiveQuestionId
            }

            return questions.find((question) => question.id !== questionId)?.id
          })
          setActionNotice("Soal berhasil dihapus.")
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "Gagal menghapus soal."))
        },
      },
    )
  }

  const handleSubmitReview = () => {
    setActionError(null)
    setActionNotice(null)

    submitReviewMutation.mutate(
      {
        id: examId,
      },
      {
        onSuccess: () => {
          draftQuery.refetch()
          setLastSavedAt(new Date().toISOString())
          setActionNotice("Draft berhasil disubmit ke review queue admin.")
        },
        onError: (error) => {
          setActionError(getErrorMessage(error, "Gagal submit draft ke review queue."))
        },
      },
    )
  }

  if (!hasCreatorAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Exam Editor Terkunci"
          description="Akses editor hanya untuk role CREATOR atau ADMIN"
        >
          <p className="text-sm text-slate-600">
            Kamu belum memiliki akses creator. Ajukan creator access terlebih dulu.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/panel"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
            <Link
              href="/creator"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Creator
            </Link>
          </div>
        </PanelCard>
      </main>
    )
  }

  if (draftQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Exam Draft Editor"
          description={`Draft ID: ${examId}`}
        >
          <p className="text-sm text-slate-600">Memuat draft exam...</p>
        </PanelCard>
      </main>
    )
  }

  if (draftQuery.error || !draft) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Exam Draft Editor"
          description={`Draft ID: ${examId}`}
        >
          <p className="text-sm text-danger-700">
            {getErrorMessage(draftQuery.error, "Gagal memuat detail draft exam.")}
          </p>
          <div className="mt-4">
            <Link
              href="/creator/exams"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Dashboard Exam
            </Link>
          </div>
        </PanelCard>
      </main>
    )
  }

  const reviewStatus = draft.active_version.status
  const isDraftSubmitted = reviewStatus === "IN_REVIEW"

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Exam Draft Editor"
        description={`Draft ID: ${examId}`}
        action={
          <div className="flex gap-2">
            <Button
              intent="secondary"
              onClick={handleSaveDraft}
              loading={updateDraftMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              intent="secondary"
              onClick={handleSaveActiveQuestion}
              loading={updateQuestionMutation.isPending}
              disabled={!activeQuestion}
            >
              Save Active Question
            </Button>
            <Button
              intent="primary"
              onClick={handleSubmitReview}
              loading={submitReviewMutation.isPending}
              disabled={isDraftSubmitted}
            >
              {isDraftSubmitted ? "Already In Review" : "Submit Review"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <p>
            Last saved: <span className="font-medium">{formatDateTime(lastSavedAt)}</span>
          </p>
          <p>
            Review state:{" "}
            <span className="font-medium">
              <StatusBadge variant={reviewStatusVariantMap[reviewStatus]}>
                {getExamAuthoringReviewStatusLabel(reviewStatus)}
              </StatusBadge>
            </span>
          </p>
          <p>
            Last submitted:{" "}
            <span className="font-medium">
              {formatDateTime(draft.active_version.submitted_at)}
            </span>
          </p>
          <p>
            Version:{" "}
            <span className="font-medium">{draft.active_version.version_label}</span>
          </p>
        </div>

        {draft.active_version.review_note ? (
          <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-warning-700">
              Feedback Reviewer
            </p>
            <p className="mt-1 text-sm text-warning-800">
              {draft.active_version.review_note}
            </p>
          </div>
        ) : null}

        {actionError ? (
          <p className="mt-3 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {actionError}
          </p>
        ) : null}
        {actionNotice ? (
          <p className="mt-3 rounded-xl border border-success-300 bg-success-50 px-4 py-3 text-sm text-success-700">
            {actionNotice}
          </p>
        ) : null}
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Exam Metadata"
        description="Lengkapi metadata sebelum submit review"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Exam Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Contoh: Tryout CPNS Numerik"
          />
          <Input
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Contoh: CPNS"
          />
          <div className="space-y-1.5">
            <label htmlFor="metadata-level" className="text-sm text-main-500">
              Level
            </label>
            <select
              id="metadata-level"
              className="h-12 w-full rounded-large border border-main-100 bg-white px-3 text-sm text-main-500"
              value={level}
              onChange={(event) =>
                setLevel(
                  event.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
                )
              }
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            placeholder="90"
          />
        </div>

        <div className="mt-3 grid gap-3">
          <Textarea
            label="Short Description"
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            placeholder="Ringkasan singkat untuk kartu katalog"
            rows={2}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Penjelasan lengkap exam"
            rows={4}
          />
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Multiple Choice Question Editor"
        description="Kelola soal pilihan ganda untuk versi draft ini"
      >
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <Button
              intent="primary"
              className="w-full"
              onClick={handleAddQuestion}
              loading={insertQuestionMutation.isPending}
            >
              Add Question
            </Button>

            <div className="space-y-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  type="button"
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    activeQuestionId === question.id
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                  onClick={() => setActiveQuestionId(question.id)}
                >
                  <p className="font-medium">Question {index + 1}</p>
                  <p className="truncate text-xs text-gray-500">
                    {question.prompt || "Belum ada pertanyaan"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            {activeQuestion ? (
              <div className="space-y-3">
                <Input
                  label="Question Prompt"
                  value={activeQuestion.prompt}
                  onChange={(event) =>
                    updateActiveQuestion((question) => ({
                      ...question,
                      prompt: event.target.value,
                    }))
                  }
                  placeholder="Tulis pertanyaan"
                />

                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    label="Option A"
                    value={activeQuestion.option_a}
                    onChange={(event) =>
                      updateActiveQuestion((question) => ({
                        ...question,
                        option_a: event.target.value,
                      }))
                    }
                    placeholder="Jawaban A"
                  />
                  <Input
                    label="Option B"
                    value={activeQuestion.option_b}
                    onChange={(event) =>
                      updateActiveQuestion((question) => ({
                        ...question,
                        option_b: event.target.value,
                      }))
                    }
                    placeholder="Jawaban B"
                  />
                  <Input
                    label="Option C"
                    value={activeQuestion.option_c}
                    onChange={(event) =>
                      updateActiveQuestion((question) => ({
                        ...question,
                        option_c: event.target.value,
                      }))
                    }
                    placeholder="Jawaban C"
                  />
                  <Input
                    label="Option D"
                    value={activeQuestion.option_d}
                    onChange={(event) =>
                      updateActiveQuestion((question) => ({
                        ...question,
                        option_d: event.target.value,
                      }))
                    }
                    placeholder="Jawaban D"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="correct-option" className="text-sm text-main-500">
                    Correct Option
                  </label>
                  <select
                    id="correct-option"
                    className="h-12 w-full rounded-large border border-main-100 bg-white px-3 text-sm text-main-500"
                    value={activeQuestion.correct_option}
                    onChange={(event) =>
                      updateActiveQuestion((question) => ({
                        ...question,
                        correct_option: event.target.value as ExamAuthoringQuestionCorrectOption,
                      }))
                    }
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <Textarea
                  label="Explanation"
                  value={activeQuestion.explanation_text}
                  onChange={(event) =>
                    updateActiveQuestion((question) => ({
                      ...question,
                      explanation_text: event.target.value,
                    }))
                  }
                  placeholder="Tulis pembahasan jawaban"
                  rows={4}
                />

                <Input
                  label="Explanation Video URL (optional)"
                  value={activeQuestion.explanation_video_url}
                  onChange={(event) =>
                    updateActiveQuestion((question) => ({
                      ...question,
                      explanation_video_url: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                />

                <Button
                  intent="danger"
                  textOnly
                  type="button"
                  onClick={() => handleRemoveQuestion(activeQuestion.id)}
                  loading={deleteQuestionMutation.isPending}
                  disabled={questions.length <= 1}
                >
                  Remove Active Question
                </Button>
              </div>
            ) : (
              <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Belum ada soal. Klik tombol Add Question untuk mulai menulis soal.
              </p>
            )}
          </div>
        </div>
      </PanelCard>
    </main>
  )
}
