# Guide: Web Config (`apps/web/configs/`)

## Kontrak Folder

✅ Boleh:
- Konfigurasi app-wide: env variables, auth config, feature flags
- Export typed config objects dari env
- Public-safe auth config
- Server-only auth config

❌ Dilarang:
- Business logic
- API calls
- Berisi UI component

---

## Konvensi

### Env Config

```typescript
// configs/env.ts
import { authConfig } from "./auth"

export const env = {
  appBaseUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000",
  apiBaseUrl: authConfig.proxyApiBasePath,
  authBaseUrl: authConfig.authApiBasePath,
  defaultAuthRedirectPath: authConfig.defaultRedirectPath,
} as const
```

### Public Auth Config

```typescript
// configs/auth.ts
export const authConfig = {
  loginPath: "/login",
  defaultRedirectPath: "/panel",
  authApiBasePath: "/api/auth",
  proxyApiBasePath:
    process.env.NEXT_PUBLIC_API_PROXY_BASE_URL ?? "/api/proxy",
  backendLoginPath: process.env.AUTH_LOGIN_PATH ?? "/auth/login",
  backendRefreshPath: process.env.AUTH_REFRESH_PATH ?? "/auth/refresh",
  backendLogoutPath: process.env.AUTH_LOGOUT_PATH ?? "/auth/logout",
  sessionMaxAgeSeconds: 6 * 60 * 60,
} as const
```

### Server Auth Config

```typescript
// configs/auth-server.ts
const isProduction = process.env.NODE_ENV === "production"

export const serverAuthConfig = {
  appBaseUrl:
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  backendApiBaseUrl:
    process.env.API_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001",
  secret: process.env.NEXTAUTH_SECRET || "development-only-change-me",
  secureCookies: isProduction,
} as const
```

### NextAuth Config

```typescript
// auth.ts
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [...],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.sub },
    }),
  },
}
```

---

## Aturan Tambahan

- Tidak boleh akses `process.env` langsung di komponen — gunakan config object ini
- `configs/auth-server.ts` hanya boleh dipakai server-side
- Route handler auth tetap tipis di `app/api/(auth)/auth/[...nextauth]/route.ts`; source of truth auth ada di `auth.ts`
- File diakhiri newline
