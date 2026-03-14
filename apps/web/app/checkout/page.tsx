import { Suspense } from "react"
import CheckoutPageContent from "./_components/checkout-page-content"

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 text-sm text-slate-500">
          Loading checkout...
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  )
}
