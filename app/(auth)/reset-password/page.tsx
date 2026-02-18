import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading reset password…</p>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}