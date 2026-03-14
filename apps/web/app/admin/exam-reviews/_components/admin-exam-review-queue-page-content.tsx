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
import { Textarea } from "$/components/textarea"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type ReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED"

type ReviewQueueItem = {
  id: string
  exam_title: string
  creator_name: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  version_label: string
  submitted_at: string
  question_count: number
  status: ReviewStatus
  review_note: string | null
}

const initialQueue: ReviewQueueItem[] = [
  {
    id: "review-001",
    exam_title: "Tryout CPNS Paket Numerik",
    creator_name: "Arga Saputra",
    category: "CPNS",
    level: "INTERMEDIATE",
    version_label: "v1.0",
    submitted_at: "2026-03-14T07:20:00.000Z",
    question_count: 60,
    status: "PENDING_REVIEW",
    review_note: null,
  },
  {
    id: "review-002",
    exam_title: "UTBK Logic Drill",
    creator_name: "Nadia Putri",
    category: "UTBK",
    level: "ADVANCED",
    version_label: "v0.9",
    submitted_at: "2026-03-13T15:00:00.000Z",
    question_count: 40,
    status: "PENDING_REVIEW",
    review_note: null,
  },
  {
    id: "review-003",
    exam_title: "Grammar Foundations",
    creator_name: "Dewi Laras",
    category: "Language",
    level: "BEGINNER",
    version_label: "v1.1",
    submitted_at: "2026-03-12T11:10:00.000Z",
    question_count: 35,
    status: "REJECTED",
    review_note: "Perlu tambahkan pembahasan untuk 10 soal terakhir.",
  },
]

const statusVariantMap: Record<
  ReviewStatus,
  "success" | "warning" | "danger"
> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
}

const statusLabelMap: Record<ReviewStatus, string> = {
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function AdminExamReviewQueuePageContent() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const hasAdminAccess = role === "ADMIN"

  const [queue, setQueue] = useState<ReviewQueueItem[]>(initialQueue)
  const [search, setSearch] = useState("")
  const [selectedReviewId, setSelectedReviewId] = useState(initialQueue[0]?.id || "")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState("")
  const [rejectNote, setRejectNote] = useState("")
  const [rejectError, setRejectError] = useState("")

  const filteredQueue = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase()

    if (!normalizedQuery) {
      return queue
    }

    return queue.filter((item) => {
      const searchableText = `${item.exam_title} ${item.creator_name} ${item.status}`

      return searchableText.toLowerCase().includes(normalizedQuery)
    })
  }, [queue, search])

  useEffect(() => {
    if (filteredQueue.length === 0) {
      setSelectedReviewId("")
      return
    }

    const hasSelected = filteredQueue.some((item) => item.id === selectedReviewId)

    if (!hasSelected) {
      setSelectedReviewId(filteredQueue[0]?.id || "")
    }
  }, [filteredQueue, selectedReviewId])

  const selectedItem = useMemo(
    () => filteredQueue.find((item) => item.id === selectedReviewId) || null,
    [filteredQueue, selectedReviewId],
  )

  const handleApprove = (reviewId: string) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === reviewId
          ? {
              ...item,
              status: "APPROVED",
              review_note: "Approved for publish.",
            }
          : item,
      ),
    )
  }

  const handleOpenRejectDialog = (reviewId: string) => {
    setRejectTargetId(reviewId)
    setRejectNote("")
    setRejectError("")
    setSelectedReviewId(reviewId)
    setIsRejectDialogOpen(true)
  }

  const handleConfirmReject = () => {
    const normalizedNote = rejectNote.trim()

    if (normalizedNote.length < 3) {
      setRejectError("Catatan reject minimal 3 karakter")
      return
    }

    setQueue((current) =>
      current.map((item) =>
        item.id === rejectTargetId
          ? {
              ...item,
              status: "REJECTED",
              review_note: normalizedNote,
            }
          : item,
      ),
    )

    setIsRejectDialogOpen(false)
    setRejectTargetId("")
    setRejectNote("")
    setRejectError("")
  }

  const columns: ColumnDef<ReviewQueueItem>[] = [
    {
      accessorKey: "exam_title",
      header: "Exam",
      cell: (info) => {
        const row = info.row.original

        return (
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900">{row.exam_title}</p>
            <p className="text-xs text-gray-500">{row.version_label}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "creator_name",
      header: "Creator",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted",
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
        const status = info.getValue() as ReviewStatus

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
        const isPending = row.status === "PENDING_REVIEW"

        return (
          <ActionsDropdown
            actions={[
              {
                label: "Open Detail",
                onClick: () => setSelectedReviewId(row.id),
              },
              {
                label: "Approve",
                onClick: () => handleApprove(row.id),
                warning: true,
                loading: false,
              },
              {
                label: "Reject",
                onClick: () => handleOpenRejectDialog(row.id),
                destructive: true,
                loading: false,
              },
            ].filter((action) =>
              isPending ? true : action.label === "Open Detail",
            )}
          />
        )
      },
    },
  ]

  if (!hasAdminAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <PanelCard
          className="rounded-3xl"
          title="Admin Review Queue Terkunci"
          description="Akses halaman ini hanya untuk role ADMIN"
        >
          <p className="text-sm text-slate-600">
            Role saat ini belum memiliki izin untuk approve/reject exam version.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Admin
            </Link>
            <Link
              href="/panel"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Kembali ke Panel
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
        title="Exam Review Queue"
        description="Review versi ujian dari creator lalu approve atau reject"
      >
        <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
          <p>
            Pending:{" "}
            <span className="font-medium text-gray-900">
              {queue.filter((item) => item.status === "PENDING_REVIEW").length}
            </span>
          </p>
          <p>
            Approved:{" "}
            <span className="font-medium text-gray-900">
              {queue.filter((item) => item.status === "APPROVED").length}
            </span>
          </p>
          <p>
            Rejected:{" "}
            <span className="font-medium text-gray-900">
              {queue.filter((item) => item.status === "REJECTED").length}
            </span>
          </p>
        </div>
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Submission List"
        description="Pilih satu submission untuk melihat detail review"
      >
        <div className="mb-4">
          <Input
            label="Search Submission"
            placeholder="Cari judul exam atau nama creator"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Table
          data={filteredQueue}
          columns={columns}
          isShowPagination={false}
          wrapperClassName="overflow-x-auto"
          thClassName="whitespace-nowrap"
          onRowClick={(row) => setSelectedReviewId(row.original.id)}
        />
      </PanelCard>

      <PanelCard
        className="rounded-3xl"
        title="Review Detail"
        description="Preview metadata versi ujian + feedback review"
      >
        {selectedItem ? (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Title:</span> {selectedItem.exam_title}
              </p>
              <p>
                <span className="font-medium">Creator:</span> {selectedItem.creator_name}
              </p>
              <p>
                <span className="font-medium">Category:</span> {selectedItem.category}
              </p>
              <p>
                <span className="font-medium">Level:</span> {selectedItem.level}
              </p>
              <p>
                <span className="font-medium">Version:</span> {selectedItem.version_label}
              </p>
              <p>
                <span className="font-medium">Question Count:</span>{" "}
                {selectedItem.question_count}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {formatDateTime(selectedItem.submitted_at)}
              </p>
              <div className="pt-2">
                <StatusBadge variant={statusVariantMap[selectedItem.status]}>
                  {statusLabelMap[selectedItem.status]}
                </StatusBadge>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Reviewer Note</p>
              <p className="text-sm text-gray-600">
                {selectedItem.review_note ||
                  "Belum ada review note. Lanjutkan approve/reject dari action table."}
              </p>

              {selectedItem.status === "PENDING_REVIEW" ? (
                <div className="flex gap-2 pt-2">
                  <Button
                    intent="primary"
                    type="button"
                    onClick={() => handleApprove(selectedItem.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    intent="danger"
                    type="button"
                    onClick={() => handleOpenRejectDialog(selectedItem.id)}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Tidak ada item yang dipilih.</p>
        )}
      </PanelCard>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Exam Version</DialogTitle>
            <DialogDescription>
              Berikan alasan reject agar creator bisa memperbaiki submission.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            label="Review Note"
            value={rejectNote}
            onChange={(event) => {
              setRejectNote(event.target.value)
              setRejectError("")
            }}
            rows={4}
            placeholder="Contoh: Tambahkan pembahasan untuk soal nomor 10-15"
          />

          {rejectError ? (
            <p className="text-sm text-danger-600">{rejectError}</p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              intent="warning"
              textOnly
              type="button"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button intent="danger" type="button" onClick={handleConfirmReject}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
