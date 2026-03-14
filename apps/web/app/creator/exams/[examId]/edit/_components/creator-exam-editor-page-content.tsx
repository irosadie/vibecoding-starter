"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { Textarea } from "$/components/textarea"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useMemo, useState } from "react"

type CreatorExamEditorPageContentProps = {
  examId: string
}

type QuestionOption = {
  key: "A" | "B" | "C" | "D"
  text: string
}

type ExamQuestionDraft = {
  id: string
  prompt: string
  options: QuestionOption[]
  correct_option: "A" | "B" | "C" | "D"
  explanation: string
}

const initialQuestions: ExamQuestionDraft[] = [
  {
    id: "q-1",
    prompt: "Nilai median dari data 2, 3, 5, 8, 13 adalah...",
    options: [
      { key: "A", text: "3" },
      { key: "B", text: "5" },
      { key: "C", text: "6" },
      { key: "D", text: "8" },
    ],
    correct_option: "B",
    explanation: "Data sudah terurut. Nilai tengah berada pada angka 5.",
  },
]

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CreatorExamEditorPageContent({
  examId,
}: CreatorExamEditorPageContentProps) {
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"

  const [title, setTitle] = useState("Draft Ujian Baru")
  const [category, setCategory] = useState("General")
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
    "BEGINNER",
  )
  const [durationMinutes, setDurationMinutes] = useState("90")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<ExamQuestionDraft[]>(initialQuestions)
  const [activeQuestionId, setActiveQuestionId] = useState(initialQuestions[0]?.id)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isSubmittedToReview, setIsSubmittedToReview] = useState(false)

  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeQuestionId) || null,
    [questions, activeQuestionId],
  )

  const handleSaveDraft = () => {
    setLastSavedAt(new Date().toISOString())
  }

  const handleSubmitReview = () => {
    setIsSubmittedToReview(true)
    setLastSavedAt(new Date().toISOString())
  }

  const handleAddQuestion = () => {
    const newQuestion: ExamQuestionDraft = {
      id: `q-${Date.now()}`,
      prompt: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ],
      correct_option: "A",
      explanation: "",
    }

    setQuestions((current) => [...current, newQuestion])
    setActiveQuestionId(newQuestion.id)
  }

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((current) => {
      const nextQuestions = current.filter((question) => question.id !== questionId)

      if (nextQuestions.length === 0) {
        setActiveQuestionId(undefined)
      } else if (activeQuestionId === questionId) {
        setActiveQuestionId(nextQuestions[0]?.id)
      }

      return nextQuestions
    })
  }

  const updateActiveQuestion = (
    updater: (question: ExamQuestionDraft) => ExamQuestionDraft,
  ) => {
    if (!activeQuestionId) {
      return
    }

    setQuestions((current) =>
      current.map((question) =>
        question.id === activeQuestionId ? updater(question) : question,
      ),
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Exam Draft Editor"
        description={`Draft ID: ${examId}`}
        action={
          <div className="flex gap-2">
            <Button intent="secondary" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button intent="primary" onClick={handleSubmitReview}>
              Submit Review
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
              {isSubmittedToReview ? "SUBMITTED" : "NOT_SUBMITTED"}
            </span>
          </p>
        </div>
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
            <Button intent="primary" className="w-full" onClick={handleAddQuestion}>
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
                  {activeQuestion.options.map((option) => (
                    <Input
                      key={option.key}
                      label={`Option ${option.key}`}
                      value={option.text}
                      onChange={(event) =>
                        updateActiveQuestion((question) => ({
                          ...question,
                          options: question.options.map((item) =>
                            item.key === option.key
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder={`Jawaban ${option.key}`}
                    />
                  ))}
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
                        correct_option: event.target.value as "A" | "B" | "C" | "D",
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
                  value={activeQuestion.explanation}
                  onChange={(event) =>
                    updateActiveQuestion((question) => ({
                      ...question,
                      explanation: event.target.value,
                    }))
                  }
                  placeholder="Tulis pembahasan jawaban"
                  rows={4}
                />

                <Button
                  intent="danger"
                  textOnly
                  type="button"
                  onClick={() => handleRemoveQuestion(activeQuestion.id)}
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
