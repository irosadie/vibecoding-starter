# Guide: Web Page (`apps/web/app/`)

## Kontrak Folder

✅ Boleh:
- `page.tsx` = thin Suspense wrapper (Server Component)
- `_components/` = komponen private ke route tersebut (tidak dipakai route lain)
- `*-page-content.tsx` = Client Component utama (state, hooks, layout)
- Komponen dalam `_components/` seperti: `*-toolbar.tsx`, `*-table-card.tsx`, `*-form-dialog.tsx`, `*-drawer.tsx`
- Export `generateMetadata`, `generateStaticParams`
- Gunakan `Suspense`, `loading.tsx`, `error.tsx`
- Route group `(group)/` untuk layout tanpa URL segment

❌ Dilarang:
- Panggil `axios` atau `fetch` langsung
- Import dari `services/` langsung
- Business logic atau state management di `page.tsx`
- Share `_components/` antar route — jika reusable, pindah ke `$/components/`

---

## Struktur File per Route

```
app/
└── (dashboard)/
    └── users/
        ├── page.tsx                        → Server Component (thin Suspense wrapper)
        ├── loading.tsx                     → Skeleton placeholder (optional)
        ├── error.tsx                       → Error boundary (optional)
        └── _components/
            ├── users-page-content.tsx      → Client Component utama
            ├── users-toolbar.tsx           → Search bar + filter + tombol add
            ├── users-table-card.tsx        → Tabel dalam PanelCard
            ├── users-form-dialog.tsx       → Dialog create/edit
            └── users-page-loading.tsx      → Skeleton loading (optional)
```

> Komponen yang **hanya** dipakai di route ini masuk `_components/`. Jika dipakai lebih dari satu route, pindah ke `$/components/`.

### `page.tsx` — Thin Wrapper dengan Suspense

```tsx
import { Suspense } from 'react'
import { UsersPageContent } from './_components/users-page-content'
import { UsersPageLoading } from './_components/users-page-loading'

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageLoading />}>
      <UsersPageContent />
    </Suspense>
  )
}
```

### `loading.tsx` — Route-level Loading

```tsx
import { UsersPageLoading } from './_components/users-page-loading'

export default function Loading() {
  return <UsersPageLoading />
}
```

---

## Utamakan Reusable Components

**Selalu** gunakan komponen dari `$/components/` — jangan tulis HTML primitif jika sudah ada komponennya.

| Kebutuhan          | Komponen                                          |
|--------------------|---------------------------------------------------|
| Tombol             | `Button`                                          |
| Input teks         | `Input`                                           |
| Textarea           | `Textarea`                                        |
| Dropdown select    | `Select`                                          |
| Radio buttons      | `RadioGroup`                                      |
| Checkbox           | `Checkbox`                                        |
| Tabel + pagination | `Table`                                           |
| Card container     | `PanelCard`                                       |
| Modal              | `Dialog`, `DialogContent`, `DialogHeader`, dll.   |
| Side panel/drawer  | `Sheet`, `SheetContent`, `SheetHeader`, dll.      |
| Action menu baris  | `ActionsDropdown`                                 |
| Status label       | `StatusBadge`                                     |
| Badge              | `Badge`                                           |
| Loading            | `LoadingSpinner`                                  |

---

## Query Params — `useSearchParams` vs `useQueryParam`

**`useSearchParams`** (dari `next/navigation`) → hanya untuk **membaca** nilai dari URL.
**`useQueryParam`** (custom hook `$/hooks/utility/use-query-param`) → untuk **mengubah** URL params.

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useQueryParam } from '$/hooks/utility/use-query-param'

export function UsersPageContent() {
  const searchParams = useSearchParams()

  // Baca dari URL
  const currentPage = Number(searchParams.get('page') || '1')
  const currentSearch = searchParams.get('q') || ''

  // Tulis ke URL
  const { setQueryParams } = useQueryParam()

  function handlePageChange(newPage: number) {
    setQueryParams({ page: newPage })
  }

  // undefined → hapus param dari URL
  function handleClearSearch() {
    setQueryParams({ q: undefined, page: 1 })
  }
}
```

### Debounced Search Pattern

```tsx
import { useState, useEffect, useMemo } from 'react'
import { debounce } from '$/utils/debounce'  // bukan useDebounce hook

const [tempQuery, setTempQuery] = useState(currentSearch)

// Sync input saat URL berubah (misal: back button)
useEffect(() => {
  setTempQuery(currentSearch)
}, [currentSearch])

const debouncedSearch = useMemo(
  () =>
    debounce((value: string) => {
      setQueryParams({ q: value.trim() || undefined, page: 1 })
    }, 250),
  [setQueryParams],
)

// Cleanup debounce saat unmount
useEffect(() => {
  return () => debouncedSearch.cancel()
}, [debouncedSearch])

const handleOnSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setTempQuery(value)       // update input langsung (immediate feedback)
  debouncedSearch(value)    // update URL setelah delay
}
```

**Aturan:**
- `tempQuery` = local state untuk input (immediate UI feedback)
- `currentSearch` = nilai dari URL (digunakan untuk API call)
- `debounce` dari `$/utils/debounce` + `useMemo` — **bukan** `useDebounce` hook

---

## Table + `useDataTable`

`useDataTable` = react-query hook yang fetch data terpaginasi. **Bukan** TanStack Table wrapper — tidak ada `useReactTable` di sini.

### 1. Definisikan Columns

```tsx
import { Table, type ColumnDef } from '$/components/table'
import { ActionsDropdown } from '$/components/actions-dropdown'
import { StatusBadge } from '$/components/status-badge'
import type { UserResponseProps } from '@vibecoding-starter/types/user-response'

const columns: ColumnDef<UserResponseProps>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => (
      <span className="text-sm font-medium text-gray-900">
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue() as boolean} />,
  },
  {
    id: 'actions',
    header: '',
    cell: (info) => (
      <ActionsDropdown
        actions={[
          {
            label: 'Edit',
            onClick: () => handleOpenDialog(true, info.row.original),
          },
          {
            label: 'Delete',
            onClick: () => handleOnDelete(info.row.original.id),
            destructive: true,
          },
        ]}
      />
    ),
  },
]
```

### 2. Panggil Hook + Render Table

```tsx
const { data, isLoading, refetch, pagination, limit } = useUsersDataTable({
  filter: { search: currentSearch || undefined },
  page: currentPage,
  isAutoFetch: true,
})

return (
  <PanelCard>
    <Table
      data={data || []}
      columns={columns}
      intent="clean"
      isLoading={isLoading}
      isShowPagination={true}
      wrapperClassName="overflow-x-auto"
      thClassName="whitespace-nowrap"
      pagination={{
        page: currentPage,
        limit: limit,
        totalData: pagination?.total || 0,
        onPageClick(newPage) {
          setQueryParams({ page: newPage })
        },
      }}
    />
  </PanelCard>
)
```

**Aturan:**
- Selalu wrap `Table` dalam `PanelCard`
- `isLoading` dari hook langsung di-pass ke prop `Table`
- Gunakan `currentSearch` (dari URL) sebagai filter API — bukan `tempQuery`

---

## Dialog (Modal)

Dialog bisa diextract ke `_components/*-form-dialog.tsx` atau tetap inline di page-content — sesuaikan dengan kompleksitas.

### State dan Handlers (di page-content)

```tsx
const [isDialogOpen, setIsDialogOpen] = useState(false)
const [editingId, setEditingId] = useState<string | null>(null)

function handleOpenDialog(editing = false, data?: EntityResponseProps) {
  if (editing && data) {
    setEditingId(data.id)
    reset({ name: data.name, isActive: data.isActive })
  } else {
    setEditingId(null)
    reset(initialFormData)
  }
  setIsDialogOpen(true)
}

function handleCloseDialog() {
  setIsDialogOpen(false)
  setEditingId(null)
  reset(initialFormData)
}
```

### Dialog dengan Form Scrollable (pattern standar)

```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '$/components/dialog'

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="w-[calc(100vw-2rem)] sm:min-w-[40%] sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
    {/* Header fixed — tidak ikut scroll */}
    <DialogHeader className="shrink-0 bg-white border-b border-gray-200 px-6 py-4 pr-12">
      <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogDescription>
        {editingId ? 'Update details below.' : 'Fill in the details below.'}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col min-h-0">
      {/* Area scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-0 pb-6 space-y-4">
        <Input
          label="Name"
          placeholder="Full name"
          required
          error={errors.name?.message}
          {...register('name')}
          rounded="large"
          intent="clean"
        />
        <Select
          label="Role"
          required
          options={roleOptions}
          value={roleOptions.find(o => o.value === formValues.role)}
          onChange={(option) => setValue('role', option?.value)}
          getOptionLabel={(o) => o.label}
          getOptionValue={(o) => o.value}
          error={errors.role?.message}
          rounded="large"
          intent="clean"
        />
        <RadioGroup
          label="Status"
          data={statusOptions}
          checkedValue={String(formValues.isActive ?? true)}
          onChange={(e) => setValue('isActive', e.target.value === 'true')}
          getDataLabel={(o) => o.label}
          getDataValue={(o) => o.value}
          position="horizontal"
          name="isActive"
        />
      </div>

      {/* Footer fixed di bawah */}
      <DialogFooter className="shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <Button type="button" intent="warning" rounded="large" textOnly onClick={handleCloseDialog} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" intent="primary" rounded="large" loading={isPending}>
          {editingId ? 'Update' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

**Aturan:**
- `shrink-0` di header dan footer agar tidak ikut scroll
- `flex-1 min-h-0 overflow-y-auto` di area konten form
- `pr-12` di header untuk beri ruang tombol close bawaan dialog
- `onOpenChange={setIsDialogOpen}` agar close saat klik backdrop

### Edit via URL Param

```tsx
const editId = searchParams.get('edit')

const { data: editData, isLoading: isEditLoading } = useUsersGetOne({ id: editId || '' })

useEffect(() => {
  if (editData) handleOpenDialog(true, editData)
}, [editData])

if (isEditLoading) return null
```

---

## Drawer (Side Panel)

Gunakan `Sheet` untuk panel dari samping — filter kompleks, detail view, atau form yang tidak butuh modal penuh.
Bisa diextract ke `_components/*-drawer.tsx` atau inline di page-content.

```tsx
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter,
} from '$/components/sheet'

const [isFilterOpen, setIsFilterOpen] = useState(false)
const [activeFilter, setActiveFilter] = useState({ status: '', role: '' })
```

### Render

```tsx
{/* Trigger */}
<Button intent="secondary" rounded="large" onClick={() => setIsFilterOpen(true)}>
  Filter
</Button>

<Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  <SheetContent side="right" className="w-[400px] flex flex-col gap-0 p-0">
    {/* Header fixed */}
    <SheetHeader className="shrink-0 border-b border-gray-200 px-6 py-4">
      <SheetTitle>Filter</SheetTitle>
    </SheetHeader>

    {/* Konten scrollable */}
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
      <Select
        label="Status"
        options={statusOptions}
        value={statusOptions.find(o => o.value === activeFilter.status)}
        onChange={(option) => setActiveFilter(prev => ({ ...prev, status: option?.value ?? '' }))}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        rounded="large"
        intent="clean"
      />
    </div>

    {/* Footer fixed */}
    <SheetFooter className="shrink-0 border-t border-gray-200 px-6 py-4">
      <Button
        intent="warning"
        rounded="large"
        textOnly
        onClick={() => {
          setActiveFilter({ status: '', role: '' })
          setQueryParams({ status: undefined, role: undefined, page: 1 })
          setIsFilterOpen(false)
        }}
      >
        Reset
      </Button>
      <Button
        intent="primary"
        rounded="large"
        onClick={() => {
          setQueryParams({
            status: activeFilter.status || undefined,
            role: activeFilter.role || undefined,
            page: 1,
          })
          setIsFilterOpen(false)
        }}
      >
        Apply
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**Aturan:**
- `side="right"` untuk filter/detail panel
- Struktur sama dengan Dialog: header + scrollable content + footer
- Trigger dengan tombol — **bukan** via URL param
- Apply filter → update URL params via `setQueryParams`, lalu tutup drawer

---

## SweetAlert2 Delete — `preConfirm` + Promise

```tsx
const handleOnDelete = (id: string) => {
  Swal.fire({
    text: 'Apakah yakin menghapus data ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e42c2c',
    cancelButtonColor: '#3278A0',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      Swal.showLoading()
      return new Promise((resolve, reject) => {
        deleteMutate(id, {
          onSuccess: () => resolve(null),
          onError: () => reject(),
        })
      })
    },
    didOpen: () => {
      const cancelButton = Swal.getCancelButton()
      cancelButton!.style.order = '-1'  // cancel di kiri
    },
  })
    .then((result) => {
      if (result.isConfirmed) {
        toast.success('Data deleted successfully!')
        setQueryParams({ page: 1 })
        refetch()
      }
    })
    .catch(() => {
      Swal.hideLoading()
      Swal.close()
      toast.error('Failed to delete data. Please try again.')
    })
}
```

**Aturan:**
- `deleteMutate` = `mutate` (bukan `mutateAsync`) dari `useFeatureDeleteOne()`
- `preConfirm` + `new Promise` — **jangan** `async/await` di level `Swal.fire()`
- `.then()/.catch()` chain di luar
- `toast.success()`/`toast.error()` dari `react-hot-toast` — Swal hanya untuk konfirmasi

---

## Aturan Tambahan

- `'use client'` hanya di Client Components (biasanya di `_components/`)
- `page.tsx` tidak perlu `'use client'`
- Satu `_components/` per route — tidak dipakai bersama route lain
- Nama komponen = PascalCase, nama file = kebab-case
- Semua file diakhiri newline (EOF)
