import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'aniwacth_admin'

export async function isAdminAuthenticated() {
  const expected = process.env.ADMIN_ACCESS_TOKEN
  if (!expected) return false
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === expected
}

export function isAdminTokenValid(token: string) {
  const expected = process.env.ADMIN_ACCESS_TOKEN
  return Boolean(expected && token && token === expected)
}
