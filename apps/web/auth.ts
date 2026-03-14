import { authConfig } from "$/configs/auth"
import { serverAuthConfig } from "$/configs/auth-server"
import { type LoginProps, loginSchema } from "@vibecoding-starter/schemas"
import type {
  AccountRole,
  AccountStatus,
  AuthLoginResponse,
} from "@vibecoding-starter/types"
import axios from "axios"
import type { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

type AuthEnvelope<T> = T | { data: T }

const ACCOUNT_ROLES: AccountRole[] = ["USER", "CREATOR", "ADMIN"]
const ACCOUNT_STATUSES: AccountStatus[] = ["ACTIVE", "SUSPENDED"]

const loginProxyUrl = `${serverAuthConfig.appBaseUrl}${authConfig.proxyApiBasePath}${authConfig.backendLoginPath}`
const loginBackendUrl = `${serverAuthConfig.backendApiBaseUrl}${authConfig.backendLoginPath}`
const loginUrls = [loginProxyUrl, loginBackendUrl]

type AuthErrorBody = {
  message?: string
  error?: {
    message?: string
  }
  errors?: Array<{
    message?: string
  }>
}

const unwrapData = <T>(payload: AuthEnvelope<T>): T => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    payload.data
  ) {
    return payload.data as T
  }

  return payload as T
}

const normalizeAccountRole = (role: unknown): AccountRole => {
  if (typeof role === "string" && ACCOUNT_ROLES.includes(role as AccountRole)) {
    return role as AccountRole
  }

  return "USER"
}

const normalizeAccountStatus = (status: unknown): AccountStatus => {
  if (
    typeof status === "string" &&
    ACCOUNT_STATUSES.includes(status as AccountStatus)
  ) {
    return status as AccountStatus
  }

  return "ACTIVE"
}

const getAuthErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as AuthErrorBody | undefined

    return (
      body?.message ||
      body?.error?.message ||
      body?.errors?.[0]?.message ||
      "Login failed"
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}

const shouldRetryWithFallback = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false
  }

  if (!error.response) {
    return true
  }

  return error.response.status >= 500 || error.response.status === 404
}

const loginByCredentials = async (
  credentials: LoginProps,
): Promise<AuthLoginResponse> => {
  let lastError: unknown

  for (const [index, loginUrl] of loginUrls.entries()) {
    try {
      const { data } = await axios.post<AuthEnvelope<AuthLoginResponse>>(
        loginUrl,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      return unwrapData<AuthLoginResponse>(data)
    } catch (error) {
      lastError = error

      if (!shouldRetryWithFallback(error) || index === loginUrls.length - 1) {
        break
      }
    }
  }

  throw new Error(getAuthErrorMessage(lastError))
}

export const authOptions: NextAuthOptions = {
  debug: !serverAuthConfig.secureCookies,
  providers: [
    CredentialsProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          throw new Error(
            parsedCredentials.error.issues[0]?.message ?? "Invalid credentials",
          )
        }

        try {
          const result = await loginByCredentials(parsedCredentials.data)

          if (!result.user || !result.tokens) {
            throw new Error("Invalid response from auth server")
          }

          const accessTokenExpires = Date.now() + result.tokens.expiresIn * 1000

          const authUser: User = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            photo: result.user.photo ?? undefined,
            role: normalizeAccountRole(result.user.role),
            status: normalizeAccountStatus(result.user.status),
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            accessTokenExpires,
            image: result.user.photo ?? undefined,
          }

          return authUser
        } catch (error: unknown) {
          throw new Error(getAuthErrorMessage(error))
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user && account) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.photo = user.photo
        token.role = user.role
        token.status = user.status
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = user.accessTokenExpires
      }

      if (trigger === "update" && session) {
        if (session.accessToken) {
          token.accessToken = session.accessToken
        }
        if (session.refreshToken) {
          token.refreshToken = session.refreshToken
        }
        if (session.accessTokenExpires) {
          token.accessTokenExpires = session.accessTokenExpires
        }
        if (session.error) {
          token.error = session.error
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessTokenExpires = token.accessTokenExpires
      session.error = token.error
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email ?? undefined,
        name: token.name ?? undefined,
        photo: token.photo ?? undefined,
        role: normalizeAccountRole(token.role),
        status: normalizeAccountStatus(token.status),
      }

      return session
    },
  },
  secret: serverAuthConfig.secret,
  session: {
    strategy: "jwt",
    maxAge: authConfig.sessionMaxAgeSeconds,
  },
  jwt: {
    secret: serverAuthConfig.secret,
  },
  pages: {
    signIn: authConfig.loginPath,
    error: authConfig.loginPath,
  },
}
