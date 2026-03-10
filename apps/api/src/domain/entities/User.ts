export type UserRole = "USER" | "CREATOR" | "ADMIN"

export type UserStatus = "ACTIVE" | "SUSPENDED"

export type User = {
  id: string
  email: string
  passwordHash: string
  name: string
  role: UserRole
  status: UserStatus
  photo: string | null
  createdAt: Date
  updatedAt: Date
}
