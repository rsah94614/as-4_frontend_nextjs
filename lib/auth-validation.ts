export const MAX_EMAIL_LENGTH = 72
export const MAX_PASSWORD_LENGTH = 16

export const EMAIL_LENGTH_ERROR = `Email address must be ${MAX_EMAIL_LENGTH} characters or fewer`
export const PASSWORD_LENGTH_ERROR = `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`

export const trimToMaxLength = (value: string, maxLength: number) =>
  value.slice(0, maxLength)

export const validateAuthEmail = (email: string): string | null => {
  if (!email) {
    return 'Email address is required'
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return EMAIL_LENGTH_ERROR
  }

  const strictSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!strictSyntax.test(email)) {
    return 'Please enter a valid email address'
  }

  return null
}

export const validateAuthPassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'At least 8 characters required'
  if (password.length > MAX_PASSWORD_LENGTH) {
    return PASSWORD_LENGTH_ERROR
  }
  if (!/[A-Z]/.test(password)) return 'Must include uppercase letter'
  if (!/[a-z]/.test(password)) return 'Must include lowercase letter'
  if (!/[0-9]/.test(password)) return 'Must include a number'
  return null
}
