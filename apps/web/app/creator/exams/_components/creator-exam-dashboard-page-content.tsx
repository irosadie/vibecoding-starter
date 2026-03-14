"use client"

import { ActionsDropdown } from "$/components/actions-dropdown"
import { Button } from "$/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "$/components/dialog"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { StatusBadge } from "$/components/status-badge"
import { type ColumnDef, Table } from "$/components/table"
import {
  useExamAuthoringReviewDataTable,
  useExamAuthoringReviewInsertOne,
  useExamAuthoringReviewSubmitReview,
} from "$/hooks/transactions/use-exam-authoring-review"
import {
  type ExamAuthoringDraftStatus,
  getExamAuthoringDraftStatusLabel,
} from "@vibecoding-starter/schemas"
import type { CreatorExamDraftSummaryResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const statusVariantMap: Record<
  ExamAuthoringDraftStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  NEEDS_REVISION: "danger",
  PUBLISHED: "success",
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
  overrideByStatus?: Record<number, string>,
) => {
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

    if ("statusCode" in error && typeof error.statusCode === "number") {
      const mappedMessage = overrideByStatus?.[error.statusCode]
      if (mappedMessage) {
        return mappedMessage
      }
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
  }

  return fallback
}

export default function CreatorExamDashboardPageContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"

  const [search, setSearch] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [newDraftTitle, setNewDraftTitle] = useState("")
  const [newDraftCategory, setNewDraftCategory] = useState("General")
  const [newDraftLevel, setNewDraftLevel] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >("BEGINNER")
  const [newDraftDuration, setNewDraftDuration] = useState("90")

  const draftTable = useExamAuthoringReviewDataTable({
    isAutoFetch: hasCreatorAccess,
    page: 1,
    limit: 20,
    filter: {
      search: search.trim() || undefined,
    },
  })
  const insertDraftMutation = useExamAuthoringReviewInsertOne()
  const submitReviewMutation = useExamAuthoringReviewSubmitReview()

  const drafts = draftTable.data ?? []

  const draftSummary = useMemo(() => {
    return {
      total: drafts.length,
      draft: drafts.filter((item) => item.status === "DRAFT").length,
      inReview: drafts.filter((item) => item.status === "IN_REVIEW").length,
      needsRevision: drafts.filter((item) => item.status === "NEEDS_REVISION")
        .length,
    }
  }, [drafts])

  const handleSubmitReview = (draftId: string) => {
    setActionError(null)

    submitReviewMutation.mutate(
      {
        id: draftId,
      },
      {
        onSuccess: () => {
          draftTable.refetch()
        },
        onError: (error) => {
          setActionError(
            getErrorMessage(
              error,
              "Gagal submit draft ke review queue.",
              {
                422:
                  "Draft belum memenuhi syarat submit. Lengkapi minimal 1 soal dengan pembahasan aktif.",
              },
            ),
          )
        },
      },
    )
  }

  const handleCreateDraft = () => {
    const normalizedTitle = newDraftTitle.trim()
    const normalizedCategory = newDraftCategory.trim()
    const parsedDuration = Number(newDraftDuration)

    if (!normalizedTitle) {
      setCreateError("Judul draft wajib diisi")
      return
    }

    if (!normalizedCategory) {
      setCreateError("Kategori draft wajib diisi")
      return
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setCreateError("Durasi draft harus berupa angka lebih dari 0")
      return
    }

    setCreateError(null)
    setActionError(null)

    insertDraftMutation.mutate(
      {
        title: normalizedTitle,
        category: normalizedCategory,
        level: newDraftLevel,
        short_description: normalizedTitle,
        description: `Draft ${normalizedTitle}`,
        duration_minutes: parsedDuration,
      },
      {
        onSuccess: (result) => {
          setIsCreateDialogOpen(false)
          setNewDraftTitle("")
          setNewDraftCategory("General")
          setNewDraftLevel("BEGINNER")
          setNewDraftDuration("90")
          draftTable.refetch()
          router.push(`/creator/exams/${result.id}/edit`)
        },
        onError: (error) => {
          setCreateError(
            getErrorMessage(error, "Gagal membuat exam draft baru."),
          )
        },
      },
    )
  }

  const columns: ColumnDef<CreatorExamDraftSummaryResponseProps>[] = [
    {
      accessorKey: "title",
      header: "Exam Draft",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900">{row.title}</p>
            <p className="text-xs text-gray-500">{row.version_label}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "level",
      header: "Level",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "question_count",
      header: "Questions",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() as number}</span>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: (info) => (
        <span className="text-sm text-gray-700">
          {formatDateTime(info.getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as ExamAuthoringDraftStatus

        return (
          <StatusBadge variant={statusVariantMap[status]}>
            {getExamAuthoringDraftStatusLabel(status)}
          </StatusBadge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => {
        const row = info.row.original
        const isSubmittable =
          row.status === "DRAFT" || row.status === "NEEDS_REVISION"

        return (
          <ActionsDropdown
            actions={[
              {
                label: "Edit",
                onClick: () => router.push(`/creator/exams/${row.id}/edit`),
              },
              ...(isSubmittable
                ? [
                    {
                      label: "Submit Review",
                      onClick: () => handleSubmitReview(row.id),
                      warning: true,
                    },
                  ]
                : []),
            ]}
          />
        )
      },
    },
  ]

  if (!hasCreatorAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Creator Exam Dashboard Terkunci"
          description="Akses halaman ini hanya untuk role CREATOR atau ADMIN"
        >
          <p className="text-sm text-slate-600">
            Silakan kembali ke panel user atau ajukan creator access terlebih dulu.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/panel"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
            </Link>
            <Link
              href="/panel/creator-application/status"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cek Status Pengajuan
            </Link>
          </div>
        </PanelCard>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <PanelCard
        className="rounded-3xl"
        title="Creator Exam Authoring"
        description="Kelola draft ujian, edit metadata, lalu submit ke review admin"
        action={
          <Button intent="primary" onClick={() => setIsCreateDialogOpen(true)}>
            Create Draft
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500">Total</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {draftSummary.total}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500">Draft</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {draftSummary.draft}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500">In Review</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {draftSummary.inReview}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-gray-500">
              Needs Revision
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {draftSummary.needsRevision}
            </p>
          </div>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Draft List"
        description="Cari draft lalu lanjutkan edit atau submit review"
      >
        <div className="mb-4">
          <Input
            label="Search Draft"
            placeholder="Cari judul, kategori, atau status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {draftTable.error ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {getErrorMessage(draftTable.error, "Gagal memuat daftar draft exam.")}
          </p>
        ) : null}

        {actionError ? (
          <p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {actionError}
          </p>
        ) : null}

        <Table
          data={drafts}
          columns={columns}
          isShowPagination={false}
          wrapperClassName="overflow-x-auto"
          thClassName="whitespace-nowrap"
          isLoading={draftTable.isLoading}
        />
      </PanelCard>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Exam Draft</DialogTitle>
            <DialogDescription>
              Buat draft baru lalu lanjutkan di halaman editor metadata + soal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              label="Exam Title"
              value={newDraftTitle}
              onChange={(event) => {
                setNewDraftTitle(event.target.value)
                setCreateError(null)
              }}
              placeholder="Contoh: Tryout CPNS Penalaran"
            />

            <Input
              label="Category"
              value={newDraftCategory}
              onChange={(event) => setNewDraftCategory(event.target.value)}
              placeholder="Contoh: CPNS"
            />

            <Input
              label="Duration (minutes)"
              type="number"
              min={1}
              value={newDraftDuration}
              onChange={(event) => setNewDraftDuration(event.target.value)}
              placeholder="90"
            />

            <div className="space-y-1.5">
              <label htmlFor="draft-level" className="text-sm text-main-500">
                Level
              </label>
              <select
                id="draft-level"
                className="h-12 w-full rounded-large border border-main-100 bg-white px-3 text-sm text-main-500"
                value={newDraftLevel}
                onChange={(event) =>
                  setNewDraftLevel(
                    event.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
                  )
                }
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>

            {createError ? (
              <p className="text-sm text-danger-600">{createError}</p>
            ) : null}
          </div>

          <DialogFooter className="mt-2">
            <Button
              intent="warning"
              textOnly
              type="button"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              type="button"
              onClick={handleCreateDraft}
              loading={insertDraftMutation.isPending}
            >
              Create & Open Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
