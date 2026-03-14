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
import { authConfig } from "$/configs/auth"
import { useAuthLogout } from "$/hooks/transactions/use-auth"
import {
	useCreatorApplicationDataTable,
	useCreatorApplicationDeleteOne,
	useCreatorApplicationUpdateOne,
} from "$/hooks/transactions/use-creator-application"
import {
	type CreatorApplicationStatus,
	getCreatorApplicationStatusLabel,
} from "@vibecoding-starter/schemas"
import type { CreatorApplicationWithApplicantResponseProps } from "@vibecoding-starter/types"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const statusVariantMap = {
	PENDING: "warning",
	APPROVED: "success",
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

const getErrorMessage = (error: unknown) => {
	if (error && typeof error === "object") {
		if ("message" in error && typeof error.message === "string") {
			return error.message
		}

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
	}

	return "Terjadi kesalahan saat memproses review creator application"
}

export default function AdminPageContent() {
	const router = useRouter()
	const { data: session } = useSession()
	const logoutMutation = useAuthLogout()
	const approveMutation = useCreatorApplicationUpdateOne()
	const rejectMutation = useCreatorApplicationDeleteOne()

	const [search, setSearch] = useState("")
	const [selectedApplicationId, setSelectedApplicationId] = useState("")
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
	const [rejectTargetId, setRejectTargetId] = useState("")
	const [rejectNote, setRejectNote] = useState("")
	const [reviewError, setReviewError] = useState<string | null>(null)

	const creatorApplicationsTable = useCreatorApplicationDataTable({
		isAutoFetch: true,
		page: 1,
		limit: 20,
		filter: {
			search: search.trim() || undefined,
		},
	})

	const applications = creatorApplicationsTable.data ?? []

	useEffect(() => {
		if (applications.length === 0) {
			setSelectedApplicationId("")

			return
		}

		const hasSelectedApplication = applications.some(
			(application) => application.id === selectedApplicationId,
		)

		if (!selectedApplicationId || !hasSelectedApplication) {
			setSelectedApplicationId(applications[0]?.id ?? "")
		}
	}, [applications, selectedApplicationId])

	const selectedApplication = useMemo(
		() =>
			applications.find(
				(application) => application.id === selectedApplicationId,
			) ?? null,
		[applications, selectedApplicationId],
	)

	const summaryStats = useMemo(() => {
		const pending = applications.filter(
			(application) => application.status === "PENDING",
		).length
		const approved = applications.filter(
			(application) => application.status === "APPROVED",
		).length
		const rejected = applications.filter(
			(application) => application.status === "REJECTED",
		).length

		return {
			total: applications.length,
			pending,
			approved,
			rejected,
		}
	}, [applications])

	const handleSignOut = () => {
		logoutMutation.mutate(undefined, {
			onSettled: () => {
				router.replace(authConfig.loginPath)
				router.refresh()
			},
		})
	}

	const handleSelectApplication = (applicationId: string) => {
		setSelectedApplicationId(applicationId)
	}

	const handleApproveApplication = (applicationId: string) => {
		setReviewError(null)
		approveMutation.mutate(
			{
				id: applicationId,
				payload: {
					reviewNote: "Approved by admin reviewer.",
				},
			},
			{
				onSuccess: () => {
					creatorApplicationsTable.refetch()
					setSelectedApplicationId(applicationId)
				},
				onError: (error) => {
					setReviewError(getErrorMessage(error))
				},
			},
		)
	}

	const handleOpenRejectDialog = (applicationId: string) => {
		setRejectTargetId(applicationId)
		setRejectNote("")
		setReviewError(null)
		setIsRejectDialogOpen(true)
		setSelectedApplicationId(applicationId)
	}

	const handleRejectApplication = () => {
		if (!rejectTargetId || !rejectNote.trim()) {
			return
		}

		setReviewError(null)
		rejectMutation.mutate(
			{
				id: rejectTargetId,
				payload: {
					reviewNote: rejectNote.trim(),
				},
			},
			{
				onSuccess: () => {
					creatorApplicationsTable.refetch()
					setIsRejectDialogOpen(false)
					setRejectTargetId("")
					setRejectNote("")
				},
				onError: (error) => {
					setReviewError(getErrorMessage(error))
				},
			},
		)
	}

	const columns: ColumnDef<CreatorApplicationWithApplicantResponseProps>[] = [
		{
			accessorKey: "applicant",
			header: "Applicant",
			cell: (info) => {
				const applicant =
					info.getValue() as CreatorApplicationWithApplicantResponseProps["applicant"]

				return (
					<div className="space-y-0.5">
						<p className="text-sm font-medium text-gray-900">
							{applicant.name}
						</p>
						<p className="text-xs text-gray-500">{applicant.email}</p>
					</div>
				)
			},
		},
		{
			accessorKey: "payoutBankName",
			header: "Payout",
			cell: (info) => {
				const row = info.row.original

				return (
					<div className="space-y-0.5 text-sm text-gray-700">
						<p>{row.payoutBankName}</p>
						<p className="text-xs text-gray-500">{row.payoutAccountNumber}</p>
					</div>
				)
			},
		},
		{
			accessorKey: "submittedAt",
			header: "Submitted At",
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
				const status = info.getValue() as CreatorApplicationStatus

				return (
					<StatusBadge variant={statusVariantMap[status]}>
						{getCreatorApplicationStatusLabel(status)}
					</StatusBadge>
				)
			},
		},
		{
			id: "actions",
			header: "",
			cell: (info) => {
				const row = info.row.original
				const actions =
					row.status === "PENDING"
						? [
							{
								label: "Approve",
								onClick: () => handleApproveApplication(row.id),
							},
							{
								label: "Reject",
								onClick: () => handleOpenRejectDialog(row.id),
								destructive: true,
							},
							{
								label: "Open Detail",
								onClick: () => handleSelectApplication(row.id),
							},
						]
						: [
							{
								label: "Open Detail",
								onClick: () => handleSelectApplication(row.id),
							},
						]

				return <ActionsDropdown actions={actions} />
			},
		},
	]

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
			<section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary-50 p-6 shadow-xs">
				<div className="absolute -right-16 -top-14 h-44 w-44 rounded-full bg-primary-200/35 blur-3xl" />
				<div className="relative">
					<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
								Admin Workspace
							</p>
							<h1 className="text-2xl font-semibold text-slate-900">
								Creator Application Review
							</h1>
							<p className="text-sm text-slate-600">
								{session?.user?.name || "Unknown User"} (
								{session?.user?.email || "No email"})
							</p>
							<div className="flex flex-wrap gap-2">
								<StatusBadge variant="primary">
									{session?.user?.role || "ADMIN"}
								</StatusBadge>
								<StatusBadge
									variant={
										session?.user?.status === "ACTIVE" ? "success" : "danger"
									}
								>
									{session?.user?.status || "UNKNOWN"}
								</StatusBadge>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								intent="secondary"
								onClick={handleSignOut}
								loading={logoutMutation.isPending}
							>
								Sign Out
							</Button>
						</div>
					</div>

					<div className="mt-4 grid gap-2 sm:grid-cols-3">
						<Link
							href="/admin/exam-reviews"
							className="rounded-xl border border-primary-300 bg-primary-50/60 px-3 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
						>
							Buka Exam Review Queue
						</Link>
						<Link
							href="/panel/creator-application/status"
							className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							Buka Status User
						</Link>
						<Link
							href="/panel"
							className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
						>
							Kembali ke Panel
						</Link>
					</div>

					<div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
							<p className="text-xs uppercase tracking-wide text-slate-500">
								Total queue
							</p>
							<p className="mt-1 text-lg font-semibold text-slate-900">
								{summaryStats.total}
							</p>
						</div>
						<div className="rounded-2xl border border-warning-200 bg-warning-50/70 p-4">
							<p className="text-xs uppercase tracking-wide text-warning-700">
								Pending
							</p>
							<p className="mt-1 text-lg font-semibold text-warning-800">
								{summaryStats.pending}
							</p>
						</div>
						<div className="rounded-2xl border border-success-200 bg-success-50/70 p-4">
							<p className="text-xs uppercase tracking-wide text-success-700">
								Approved
							</p>
							<p className="mt-1 text-lg font-semibold text-success-800">
								{summaryStats.approved}
							</p>
						</div>
						<div className="rounded-2xl border border-danger-200 bg-danger-50/70 p-4">
							<p className="text-xs uppercase tracking-wide text-danger-700">
								Rejected
							</p>
							<p className="mt-1 text-lg font-semibold text-danger-800">
								{summaryStats.rejected}
							</p>
						</div>
					</div>
				</div>
			</section>

			<PanelCard
				className="rounded-3xl"
				title="Daftar Pengajuan Creator"
				description="Pilih baris untuk melihat detail lengkap, lalu lakukan approve/reject"
			>
				<div className="mb-4">
					<Input
						label="Cari Pengajuan"
						placeholder="Cari nama atau email"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						rounded="large"
						intent="clean"
					/>
				</div>
				{creatorApplicationsTable.error ? (
					<p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
						Gagal memuat daftar pengajuan creator.
					</p>
				) : null}
				{reviewError ? (
					<p className="mb-4 rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700">
						{reviewError}
					</p>
				) : null}
				<Table
					data={applications}
					columns={columns}
					isShowPagination={false}
					isLoading={creatorApplicationsTable.isLoading}
					onRowClick={(row) => handleSelectApplication(row.original.id)}
					thClassName="whitespace-nowrap"
				/>
			</PanelCard>

			<div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
				<PanelCard
					className="rounded-3xl"
					title="Detail Pengajuan"
					description="Detail applicant, payout, dokumen, dan hasil review"
				>
					{selectedApplication ? (
						<div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
							<p>
								<span className="font-medium">Application ID:</span>{" "}
								{selectedApplication.id}
							</p>
							<p>
								<span className="font-medium">Status:</span>{" "}
								<StatusBadge
									variant={statusVariantMap[selectedApplication.status]}
									className="ml-1"
								>
									{getCreatorApplicationStatusLabel(selectedApplication.status)}
								</StatusBadge>
							</p>
							<p>
								<span className="font-medium">Applicant:</span>{" "}
								{selectedApplication.applicant.name}
							</p>
							<p>
								<span className="font-medium">Email:</span>{" "}
								{selectedApplication.applicant.email}
							</p>
							<p>
								<span className="font-medium">Payout account:</span>{" "}
								{selectedApplication.payoutAccountName}
							</p>
							<p>
								<span className="font-medium">Payout bank:</span>{" "}
								{selectedApplication.payoutBankName}
							</p>
							<p>
								<span className="font-medium">Payout account number:</span>{" "}
								{selectedApplication.payoutAccountNumber}
							</p>
							<p>
								<span className="font-medium">Submitted at:</span>{" "}
								{formatDateTime(selectedApplication.submittedAt)}
							</p>
							<p>
								<span className="font-medium">Reviewed at:</span>{" "}
								{formatDateTime(selectedApplication.reviewedAt)}
							</p>
							<p className="sm:col-span-2">
								<span className="font-medium">KTP file:</span>{" "}
								<a
									href={selectedApplication.ktpFileUrl}
									target="_blank"
									rel="noreferrer"
									className="text-primary-600 underline underline-offset-2"
								>
									{selectedApplication.ktpFileUrl}
								</a>
							</p>
							<p className="sm:col-span-2">
								<span className="font-medium">Review note:</span>{" "}
								{selectedApplication.reviewNote || "-"}
							</p>
						</div>
					) : (
						<p className="text-sm text-slate-600">
							Belum ada data yang dipilih.
						</p>
					)}
				</PanelCard>

				<PanelCard
					className="rounded-3xl"
					title="Quick Review Action"
					description="Gunakan aksi cepat untuk application yang sedang dipilih"
				>
					{!selectedApplication ? (
						<p className="text-sm text-slate-600">
							Pilih satu aplikasi dari tabel untuk memunculkan aksi review.
						</p>
					) : selectedApplication.status !== "PENDING" ? (
						<p className="text-sm text-slate-600">
							Application ini sudah direview. Gunakan table action untuk melihat
							detail.
						</p>
					) : (
						<div className="space-y-3">
							<p className="text-sm text-slate-700">
								Application dari{" "}
								<span className="font-medium">
									{selectedApplication.applicant.name}
								</span>{" "}
								sedang menunggu keputusan review.
							</p>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									intent="success"
									onClick={() =>
										handleApproveApplication(selectedApplication.id)
									}
									loading={approveMutation.isPending}
								>
									Approve
								</Button>
								<Button
									type="button"
									intent="danger"
									onClick={() => handleOpenRejectDialog(selectedApplication.id)}
									loading={rejectMutation.isPending}
								>
									Reject
								</Button>
							</div>
						</div>
					)}
				</PanelCard>
			</div>

			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Reject Creator Application</DialogTitle>
						<DialogDescription>
							Isi catatan review sebelum menolak pengajuan creator.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						label="Review Note"
						placeholder="Contoh: Foto KTP blur, mohon upload ulang."
						value={rejectNote}
						onChange={(event) => setRejectNote(event.target.value)}
						required
						rounded="large"
						intent="clean"
					/>
					<DialogFooter>
						<Button
							type="button"
							intent="secondary"
							onClick={() => setIsRejectDialogOpen(false)}
						>
							Batal
						</Button>
						<Button
							type="button"
							intent="danger"
							onClick={handleRejectApplication}
							loading={rejectMutation.isPending}
							disabled={!rejectNote.trim()}
						>
							Reject Application
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	)
}
