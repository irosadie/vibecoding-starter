import { authConfig, getRoleRedirectPath } from "$/configs/auth"
import { serverAuthConfig } from "$/configs/auth-server"
import type { AccountRole } from "@vibecoding-starter/types/auth-response"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

type SessionToken = {
  role?: AccountRole
}

type ProtectedRouteRule = {
  path: string
  allowedRoles: AccountRole[]
}

const PROTECTED_ROUTES: ProtectedRouteRule[] = [
  {
    path: authConfig.roleRedirectPath.USER,
    allowedRoles: ["USER", "ADMIN"],
  },
  {
    path: authConfig.roleRedirectPath.CREATOR,
    allowedRoles: ["CREATOR", "ADMIN"],
  },
  {
    path: authConfig.roleRedirectPath.ADMIN,
    allowedRoles: ["ADMIN"],
  },
]

const AUTH_PAGES: ReadonlySet<string> = new Set([
  authConfig.loginPath,
  authConfig.registerPath,
])

const getProtectedRouteRule = (pathname: string) =>
  PROTECTED_ROUTES.find((route) => pathname.startsWith(route.path))

const buildAuthRedirect = (request: NextRequest, callbackUrl: string) => {
  const loginUrl = new URL(authConfig.loginPath, request.url)

  loginUrl.searchParams.set("callbackUrl", callbackUrl)

  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = (await getToken({
    req: request,
    secret: serverAuthConfig.secret,
    secureCookie: serverAuthConfig.secureCookies,
  })) as SessionToken | null
  const protectedRouteRule = getProtectedRouteRule(pathname)
  const isAuthPage = AUTH_PAGES.has(pathname)
  const callbackUrl =
    pathname.startsWith("/") && !AUTH_PAGES.has(pathname)
      ? pathname
      : authConfig.defaultRedirectPath

  if (protectedRouteRule && !token) {
    return buildAuthRedirect(request, callbackUrl)
  }

  if (protectedRouteRule && token) {
    const userRole = token.role ?? "USER"
    const canAccessRoute = protectedRouteRule.allowedRoles.includes(userRole)

    if (!canAccessRoute) {
      const redirectPath = getRoleRedirectPath(userRole)

      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  if (isAuthPage && token) {
    const redirectPath = getRoleRedirectPath(token.role)

    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/creator/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
}
