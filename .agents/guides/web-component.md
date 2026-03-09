# Guide: Web Component (`apps/web/components/`)

## Kontrak Folder

✅ Boleh:
- Terima props, render JSX
- `useState`, `useEffect` untuk local UI state
- Import dari `utils/`, `types/`, `constants/`

❌ Dilarang:
- Panggil `axios` atau `fetch` langsung
- Import data-fetching hooks dari `hooks/`
- Hardcode API URL atau query key
- Business logic

---

## Struktur Folder

Semua komponen flat di `components/` — tidak ada subfolder.

```
components/
├── button.tsx             → wrapper dengan prop `intent`, `loading`, `rounded`, `leftIcon`
├── input.tsx              → wrapper dengan prop `label`, `error`, `leftIcon`, `intent`, `rounded`
├── dialog.tsx             → Dialog, DialogContent, DialogHeader, DialogTitle, dll.
├── sheet.tsx              → Sheet, SheetContent, SheetHeader, SheetTitle, dll.
├── select.tsx             → custom select dengan prop `options`, `getOptionLabel`, `getOptionValue`
├── radio-group.tsx        → wrapper dengan prop `data`, `getDataLabel`, `getDataValue`
├── textarea.tsx           → wrapper dengan prop `label`, `rounded`, `intent`
├── table.tsx              → custom: data + columns + pagination built-in
├── actions-dropdown.tsx   → dropdown menu untuk action baris tabel
├── panel-card.tsx         → card wrapper untuk konten halaman panel
├── status-badge.tsx       → badge aktif/nonaktif dari boolean
└── loading-spinner.tsx    → standalone loading indicator
```

---

## Tipe Komponen

### 1. Wrapper (primitif + project props)

```tsx
// components/button.tsx
'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: 'primary' | 'warning' | 'danger' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  rounded?: 'default' | 'large' | 'full'
  loading?: boolean
  textOnly?: boolean
  leftIcon?: React.ReactNode
}

export function Button({ intent = 'primary', loading, leftIcon, children, disabled, ...props }: ButtonProps) {
  return (
    <button disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : leftIcon}
      {children}
    </button>
  )
}
```

```tsx
// components/input.tsx
'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  intent?: 'default' | 'clean'
  rounded?: 'default' | 'large'
}

export function Input({ label, error, leftIcon, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
        <input className={leftIcon ? 'pl-10' : ''} {...props} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

### 2. Composite (gabungan beberapa elemen)

```tsx
// components/actions-dropdown.tsx
'use client'

interface Action {
  label: string
  onClick: () => void
  destructive?: boolean
}

export function ActionsDropdown({ actions }: { actions: Action[] }) {
  // dropdown menu dengan daftar actions
}
```

```tsx
// components/status-badge.tsx
interface StatusBadgeProps {
  status: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusBadge({ status, activeLabel = 'Active', inactiveLabel = 'Inactive' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
    }`}>
      {status ? activeLabel : inactiveLabel}
    </span>
  )
}
```

---

## Kapan Taruh di Mana

| Kondisi | Lokasi |
|---|---|
| Komponen hanya dipakai 1 route | `app/**/_components/` |
| Komponen dipakai >1 route | `components/` |

---

## Aturan Tambahan

- Satu file = satu komponen utama
- Export named — bukan default export
- Selalu forward HTML props asli (`...props`) di wrapper
- File diakhiri newline (EOF)
