'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useResetPassword } from './useResetPassword'
import ResetPasswordForm from './ResetPasswordForm'
import ResetPasswordSuccess from './ResetPasswordSuccess'

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const { state, handlers } = useResetPassword(token, () => {
    setTimeout(() => router.push('/login'), 3000)
  })

  if (state.success) {
    return <ResetPasswordSuccess />
  }

  return (
    <ResetPasswordForm
      token={token}
      state={state}
      handlers={handlers}
    />
  )
}