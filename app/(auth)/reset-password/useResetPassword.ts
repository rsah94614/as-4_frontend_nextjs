import { useEffect, useState } from 'react'
import { resetPassword } from '@/services/auth-service'

type Errors = {
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export function useResetPassword(
  token: string | null,
  onSuccess: () => void
) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid reset link. Please request a new one.' })
    }
  }, [token])

  const validatePassword = (pwd: string) => {
    if (!pwd) return 'Password is required'
    if (pwd.length < 8) return 'At least 8 characters required'
    if (!/[A-Z]/.test(pwd)) return 'Must include uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'Must include lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'Must include a number'
    return null
  }

  const submit = async () => {
    const pwdError = validatePassword(newPassword)
    const confirmError =
      confirmPassword !== newPassword ? 'Passwords do not match' : null

    if (pwdError || confirmError) {
      setErrors({
        newPassword: pwdError || undefined,
        confirmPassword: confirmError || undefined,
      })
      return
    }

    if (!token) {
      setErrors({ general: 'Invalid reset token.' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await resetPassword(token, newPassword)

      if (!result.success) {
        throw new Error(result.error || 'Reset failed')
      }

      setSuccess(true)
      onSuccess()
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return {
    state: {
      newPassword,
      confirmPassword,
      loading,
      success,
      errors,
      touched,
    },
    handlers: {
      setNewPassword,
      setConfirmPassword,
      setTouched,
      submit,
    },
  }
}