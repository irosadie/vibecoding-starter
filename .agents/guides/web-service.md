# Guide: Web Service (`apps/web/services/`)

## Kontrak Folder

Folder `services/` hanya berisi **axios instance** dengan konfigurasi dan interceptors.
Tidak ada service function per endpoint — hooks memanggil axios **langsung**.

✅ Boleh:
- Setup axios instance dengan base URL internal proxy dari `configs/env.ts`
- Response interceptor (unwrap data, handle 401)

❌ Dilarang:
- Service function per endpoint di sini — taruh di hook file
- Berisi JSX atau React hooks
- Hardcode base URL — gunakan env variable
- Handle error domain di sini
- Attach bearer token browser-side untuk request yang memang lewat internal proxy

---

## Konvensi

### Struktur

```
services/
└── axios/
    └── index.ts    → Axios instance + interceptors
```

### Axios Instance

```typescript
// services/axios/index.ts
import { authConfig } from "$/configs/auth"
import { env } from "$/configs/env"
import _axios from 'axios'

export const axios = _axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

// Response: unwrap data
axios.interceptors.response.use(
  (response) => {
    const { data: responseData, meta } = response.data

    // List response (array) → DataTableResponse shape
    if (Array.isArray(responseData)) {
      return {
        list: responseData,
        meta: {
          pagination: meta,
          cursor: null,
        },
      }
    }

    // Single response → return data langsung
    return responseData
  },
  (error) => {
    // 401 → redirect ke login
    if (error.response?.status === 401) {
      window.location.href = authConfig.loginPath
    }
    return Promise.reject(error?.response?.data || error)
  },
)
```

---

## Cara Pakai di Hook

Hooks import axios instance dari `$/services/axios` dan langsung memanggil endpoint:

```typescript
// hooks/transactions/use-payment-methods/use-data-table.ts
import { axios } from '$/services/axios'
import { apiRouters } from '$/constants'

const fetchDataTable = async (args) => {
  const [, { page, limit, filter }] = args.queryKey

  // Panggil axios langsung — tidak perlu service function
  const result = await axios<DataTableResponse<DataTypeProps>>({
    method: 'GET',
    url: apiRouters.paymentMethods.index,
    params: { ...filter, page, limit },
  })

  return result
}
```

---

## Aturan Tambahan

- Hanya satu axios instance (singleton)
- Import di hooks sebagai `import { axios } from '$/services/axios'`
- Browser frontend hit `/api/proxy/*`; token injection dan refresh terjadi server-side di route `app/api/proxy/[...path]/route.ts`
- File diakhiri newline
