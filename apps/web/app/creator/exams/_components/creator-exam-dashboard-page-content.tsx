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
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type ExamDraftStatus = "DRAFT" | "IN_REVIEW" | "NEEDS_REVISION" | "PUBLISHED"

type ExamDraftItem = {
  id: string
  title: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  question_count: number
  updated_at: string
  status: ExamDraftStatus
  version_label: string
}

const initialDrafts: ExamDraftItem[] = [
  {
    id: "draft-cpns-001",
    title: "Tryout CPNS Paket 1",
    category: "CPNS",
    level: "INTERMEDIATE",
    question_count: 45,
    updated_at: "2026-03-14T08:30:00.000Z",
    status: "DRAFT",
    version_label: "v0.7",
  },
  {
    id: "draft-utbk-002",
    title: "UTBK Penalaran Kuantitatif",
    category: "UTBK",
    level: "ADVANCED",
    question_count: 60,
    updated_at: "2026-03-13T14:15:00.000Z",
    status: "IN_REVIEW",
    version_label: "v1.0",
  },
  {
    id: "draft-eng-003",
    title: "Academic English Fundamentals",
    category: "Language",
    level: "BEGINNER",
    question_count: 30,
    updated_at: "2026-03-12T10:05:00.000Z",
    status: "NEEDS_REVISION",
    version_label: "v0.9",
  },
]

const statusVariantMap: Record<
  ExamDraftStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  NEEDS_REVISION: "danger",
  PUBLISHED: "success",
}

const statusLabelMap: Record<ExamDraftStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  NEEDS_REVISION: "Needs Revision",
  PUBLISHED: "Published",
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function CreatorExamDashboardPageContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasCreatorAccess = role === "CREATOR" || role === "ADMIN"

  const [drafts, setDrafts] = useState<ExamDraftItem[]>(initialDrafts)
  const [search, setSearch] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createError, setCreateError] = useState("")
  const [newDraftTitle, setNewDraftTitle] = useState("")
  const [newDraftCategory, setNewDraftCategory] = useState("General")
  const [newDraftLevel, setNewDraftLevel] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  >("BEGINNER")

  const filteredDrafts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    if (!normalizedQuery) {
      return drafts
    }

    return drafts.filter((draft) => {
      const searchableText = `${draft.title} ${draft.category} ${draft.status}`

      return searchableText.toLowerCase().includes(normalizedQuery)
    })
  }, [drafts, search])

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
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId
          ? {
              ...draft,
              status: "IN_REVIEW",
              updated_at: new Date().toISOString(),
            }
          : draft,
      ),
    )
  }

  const handleCreateDraft = () => {
    const normalizedTitle = newDraftTitle.trim()

    if (!normalizedTitle) {
      setCreateError("Judul draft wajib diisi")
      return
    }

    const draftId = `draft-${Date.now()}`

    setDrafts((current) => [
      {
        id: draftId,
        title: normalizedTitle,
        category: newDraftCategory,
        level: newDraftLevel,
        question_count: 0,
        updated_at: new Date().toISOString(),
        status: "DRAFT",
        version_label: "v0.1",
      },
      ...current,
    ])

    setIsCreateDialogOpen(false)
    setCreateError("")
    setNewDraftTitle("")
    setNewDraftCategory("General")
    setNewDraftLevel("BEGINNER")
    router.push(`/creator/exams/${draftId}/edit`)
  }

  const columns: ColumnDef<ExamDraftItem>[] = [
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
        const status = info.getValue() as ExamDraftStatus

        return (
          <StatusBadge variant={statusVariantMap[status]}>
            {statusLabelMap[status]}
          </StatusBadge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: (info) => {
        const row = info.row.original

        return (
          <ActionsDropdown
            actions={[
              {
                label: "Edit",
                onClick: () => router.push(`/creator/exams/${row.id}/edit`),
              },
              {
                label: "Submit Review",
                onClick: () => handleSubmitReview(row.id),
                warning: true,
              },
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

        <Table
          data={filteredDrafts}
          columns={columns}
          isShowPagination={false}
          wrapperClassName="overflow-x-auto"
          thClassName="whitespace-nowrap"
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
                setCreateError("")
              }}
              placeholder="Contoh: Tryout CPNS Penalaran"
            />

            <Input
              label="Category"
              value={newDraftCategory}
              onChange={(event) => setNewDraftCategory(event.target.value)}
              placeholder="Contoh: CPNS"
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
            <Button intent="primary" type="button" onClick={handleCreateDraft}>
              Create & Open Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
