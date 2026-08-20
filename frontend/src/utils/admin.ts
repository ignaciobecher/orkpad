export const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID || ''

export const isAdminUser = (userId?: string | null) => userId === ADMIN_USER_ID
