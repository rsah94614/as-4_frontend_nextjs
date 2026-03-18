import { Suspense } from 'react'
import ResetPasswordClient from '../../../components/features/auth/reset-password/ResetPasswordClient'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading reset password...</p>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}