"use client"

import { Button } from "$/components/button"
import { Input } from "$/components/input"
import { PanelCard } from "$/components/panel-card"
import { authConfig, getRoleRedirectPath } from "$/configs/auth"
import { useAuthLogin } from "$/hooks/transactions/use-auth"
import { type LoginProps, loginSchema } from "@vibecoding-starter/schemas"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, useEffect, useMemo, useState } from "react"

const sanitizeCallbackUrl = (value: string | null) => {
  if (value?.startsWith("/")) {
    return value
  }

  return authConfig.defaultRedirectPath
}

type LoginErrors = Partial<Record<keyof LoginProps, string>>

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const loginMutation = useAuthLogin()
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({})
  const [form, setForm] = useState<LoginProps>({
    email: "",
    password: "",
  })
  const rawCallbackUrl = searchParams.get("callbackUrl")

  const callbackUrl = useMemo(
    () => sanitizeCallbackUrl(rawCallbackUrl),
    [rawCallbackUrl],
  )

  useEffect(() => {
    if (status === "authenticated") {
      const fallbackPath = getRoleRedirectPath(session?.user?.role)
      const redirectPath = rawCallbackUrl ? callbackUrl : fallbackPath

      router.replace(redirectPath)
    }
  }, [callbackUrl, rawCallbackUrl, router, session?.user?.role, status])

  const handleChange = (field: keyof LoginProps, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
    setFormError("")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedForm = loginSchema.safeParse(form)

    if (!parsedForm.success) {
      const nextErrors: LoginErrors = {}

      for (const issue of parsedForm.error.issues) {
        const field = issue.path[0]

        if (field === "email" || field === "password") {
          nextErrors[field] = issue.message
        }
      }

      setFieldErrors(nextErrors)
      return
    }

    loginMutation.mutate(
      {
        ...parsedForm.data,
        callbackUrl,
      },
      {
        onSuccess: (result) => {
          router.replace(result.redirectTo)
          router.refresh()
        },
        onError: (error) => {
          setFormError(error.message)
        },
      },
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <PanelCard
        className="w-full rounded-3xl"
        title="Sign In"
        description="Starter credentials flow via NextAuth and proxy BFF"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={fieldErrors.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            autoComplete="current-password"
            label="Password"
            name="password"
            type="password"
            value={form.password}
            error={fieldErrors.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Enter your password"
            required
          />

          {formError ? (
            <p className="text-sm text-danger-500">{formError}</p>
          ) : null}

          <Button
            className="w-full justify-center"
            type="submit"
            loading={loginMutation.isPending}
          >
            Sign In
          </Button>

          <p className="text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              href={authConfig.registerPath}
              className="font-semibold text-brand-dark underline-offset-4 hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </form>
      </PanelCard>
    </main>
  )
}
