import type { AccountRole } from "@vibecoding-starter/types/auth-response"

export const authConfig = {
  loginPath: "/login",
  registerPath: "/register",
  defaultRedirectPath: "/panel",
  authApiBasePath: "/api/auth",
  proxyApiBasePath: process.env.NEXT_PUBLIC_API_PROXY_BASE_URL ?? "/api/proxy",
  backendRegisterPath: process.env.AUTH_REGISTER_PATH ?? "/auth/register",
  backendLoginPath: process.env.AUTH_LOGIN_PATH ?? "/auth/login",
  backendRefreshPath: process.env.AUTH_REFRESH_PATH ?? "/auth/refresh",
  backendLogoutPath: process.env.AUTH_LOGOUT_PATH ?? "/auth/logout",
  backendMePath: process.env.AUTH_ME_PATH ?? "/auth/me",
  sessionMaxAgeSeconds: 6 * 60 * 60,
  roleRedirectPath: {
    USER: "/panel",
    CREATOR: "/creator",
    ADMIN: "/admin",
  },
} as const

export const getRoleRedirectPath = (
  role?: AccountRole | null,
  fallbackPath = authConfig.defaultRedirectPath,
) => {
  if (role && role in authConfig.roleRedirectPath) {
    return authConfig.roleRedirectPath[role]
  }

  return fallbackPath
}
