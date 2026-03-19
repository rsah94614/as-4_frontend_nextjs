import { useEffect, useState } from 'react'
import { resetPassword } from '@/services/auth-service'
import { extractErrorMessage } from '@/lib/error-utils'
import {
  PASSWORD_LENGTH_ERROR,
  MAX_PASSWORD_LENGTH,
  trimToMaxLength,
  validateAuthPassword,
} from '@/lib/auth-validation'

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

  const handleNewPasswordChange = (value: string) => {
    const trimmedValue = trimToMaxLength(value, MAX_PASSWORD_LENGTH)
    setNewPassword(trimmedValue)

    setErrors(prev => ({
      ...prev,
      newPassword:
        value.length > MAX_PASSWORD_LENGTH
          ? PASSWORD_LENGTH_ERROR
          : touched.newPassword
            ? validateAuthPassword(trimmedValue) || undefined
            : undefined,
      confirmPassword:
        confirmPassword.length > 0 && confirmPassword !== trimmedValue
          ? 'Passwords do not match'
          : undefined,
      general: undefined,
    }))
  }

  const handleConfirmPasswordChange = (value: string) => {
    const trimmedValue = trimToMaxLength(value, MAX_PASSWORD_LENGTH)
    setConfirmPassword(trimmedValue)

    setErrors(prev => ({
      ...prev,
      confirmPassword:
        value.length > MAX_PASSWORD_LENGTH
          ? PASSWORD_LENGTH_ERROR
          : touched.confirmPassword
            ? (
              trimmedValue !== newPassword ? 'Passwords do not match' : undefined
            )
            : undefined,
      general: undefined,
    }))
  }

  const submit = async () => {
    const pwdError = validateAuthPassword(newPassword)
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
      setErrors({ general: extractErrorMessage(err, 'Something went wrong') })
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
      setNewPassword: handleNewPasswordChange,
      setConfirmPassword: handleConfirmPasswordChange,
      setTouched,
      submit,
    },
  }
}
