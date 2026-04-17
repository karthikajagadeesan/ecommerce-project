export type Subdomain = 'superadmin' | 'user'

export interface Anchor {
  id: string
  title: string
}

export interface AuthActionResult {
  error?: string
  success?: boolean
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface SignupFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
}
