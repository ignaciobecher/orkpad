# FRONTEND_PATTERNS.md — Extraído de Orkpad Frontend
## Guía para create-saas-ar (Next.js 15 + TypeScript + Tailwind CSS 4 + shadcn/ui)

---

## 1. Patrones de Autenticación

### 1.1 Cómo funciona en Orkpad

- **JWT via cookies HTTP-only** — `withCredentials: true` en Axios. El token JWT no se toca desde JS, lo gestiona el backend con cookies `Set-Cookie`.
- **Pinia store `auth`** con estado: `user | null`, `loading`, `initialized`, `error`, `pendingEmailVerification`.
- **Singleton `fetchMe()`**: la primera llamada a `/auth/me` se almacena en una promesa global para evitar múltiples requests concurrentes. Se limpia al terminar.
- **Guard de router**: `beforeEach` llama `authGuard` que chequea `meta.requiresAuth` / `meta.guestOnly`. Si `requiresAuth` y no está `initialized`, llama `fetchMe()` y redirige a `/login` si falla. Si `guestOnly` y ya está autenticado, redirige a `/app/dashboard`.
- **Refresh automático**: el interceptor de respuesta de Axios intercepta 401, hace `POST /auth/refresh` con `withCredentials: true`, encola requests fallidos y los reintenta.

### 1.2 Adaptación a Next.js 15

```
App Router:
├── (auth)/           ← rutas públicas (login, register, forgot-password)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx    ← layout público (sin sidebar, sin navbar de app)
├── (app)/            ← rutas protegidas
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx    ← layout con sidebar + navbar + verificación de auth
└── middleware.ts     ← protege /(app) redirigiendo a /login si no hay sesión
```

**middleware.ts** (va en raíz del proyecto, no en `src/`):

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/app']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const sessionToken = request.cookies.get('session')?.value // o el nombre de cookie que use tu backend

  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si está en /login o /register y ya tiene sesión, redirigir a /dashboard
  const isGuestOnly = ['/login', '/register', '/forgot-password'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  if (isGuestOnly && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|public).*)'],
}
```

---

## 2. Patrones de API Calls

### 2.1 Estructura de carpetas

```
src/lib/api/
├── http-client.ts          ← Axios instance centralizada + interceptors
├── auth/
│   ├── auth.api.ts         ← endpoints de auth
│   └── auth.types.ts       ← tipos User, LoginDto, RegisterDto, etc.
├── workspace/
│   ├── workspace.api.ts
│   └── workspace.types.ts
└── [entidad]/
    ├── [entidad].api.ts    ← objeto con métodos: getAll, getById, create, update, remove
    └── [entidad].types.ts  ← interfaces: Entidad, CreateDto, UpdateDto, QueryDto, PaginatedResponse
```

### 2.2 HTTP Client (adaptado de `src/api/axios.config.ts`)

**Archivo: `src/lib/api/http-client.ts`**

```ts
import axios, { type AxiosError } from 'axios'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ← cookies HTTP-only para JWT
})

// ─── Token refresh queue ───────────────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

// ─── Request interceptor: limpia params vacíos ────────────────

apiClient.interceptors.request.use((config) => {
  if (config.params) {
    Object.keys(config.params).forEach((key) => {
      if (
        config.params[key] === '' ||
        config.params[key] === null ||
        config.params[key] === undefined
      ) {
        delete config.params[key]
      }
    })
  }
  return config
})

// ─── Response interceptor: refresh automático en 401 ──────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // No reintentar si ya es una ruta de auth
    const url = originalRequest.url || ''
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/me')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(() => {
        originalRequest._retry = true
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      processQueue(null)
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
```

### 2.3 Módulo de API de ejemplo

**Archivo: `src/lib/api/auth/auth.api.ts`**

```ts
import apiClient from '../http-client'
import type {
  LoginDto,
  RegisterDto,
  RegisterResponse,
  User,
} from './auth.types'

const BASE = '/auth'

export const authApi = {
  login: (dto: LoginDto) => apiClient.post(`${BASE}/login`, dto),
  register: (dto: RegisterDto) =>
    apiClient.post<RegisterResponse>(`${BASE}/register`, dto),
  logout: () => apiClient.post(`${BASE}/logout`),
  me: () => apiClient.get<User>(`${BASE}/me`),
  resendVerification: (email: string) =>
    apiClient.post(`${BASE}/resend-verification`, { email }),
  forgotPassword: (email: string) =>
    apiClient.post(`${BASE}/forgot-password`, { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post(`${BASE}/reset-password`, { token, password }),
  changePassword: (dto: {
    currentPassword: string
    newPassword: string
  }) => apiClient.post(`${BASE}/change-password`, dto),
  updateProfile: (dto: { name?: string; phone?: string }) =>
    apiClient.patch(`${BASE}/profile`, dto),
}
```

**Patrón general para cualquier entidad:**

```ts
// src/lib/api/[entidad]/[entidad].api.ts
import apiClient from '../http-client'
import type { Entity, CreateDto, UpdateDto, QueryDto, PaginatedResponse } from './entity.types'

const BASE = '/entity'

export const entityApi = {
  getAll: (params?: QueryDto) =>
    apiClient.get<PaginatedResponse<Entity>>(BASE, { params }),
  getById: (id: string) =>
    apiClient.get<Entity>(`${BASE}/${id}`),
  create: (dto: CreateDto) =>
    apiClient.post<Entity>(BASE, dto),
  update: (id: string, dto: UpdateDto) =>
    apiClient.patch<Entity>(`${BASE}/${id}`, dto),
  remove: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
}
```

---

## 3. Tipos TypeScript

### 3.1 Tipos extraídos de Orkpad (adaptados)

**Archivo: `src/lib/api/auth/auth.types.ts`**

```ts
export interface User {
  _id: string
  email: string
  name: string
  workspaceId: string
  emailVerified: boolean
  phone?: string
  twoFactorEnabled: boolean
}

export interface LoginDto {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  termsAccepted: boolean
}

export interface RegisterResponse {
  requiresEmailVerification: boolean
}
```

**Archivo: `src/lib/api/workspace/workspace.types.ts`**

```ts
export interface Workspace {
  _id: string
  name: string
  slug: string
  ownerId: string
  status: 'active' | 'suspended'
  bio?: string
  headline?: string
  avatarUrl?: string
  bannerUrl?: string
  publicProfile: boolean
  socialLinks: SocialLinks
  skills: string[]
  availableForWork: boolean
  availabilityNote?: string
  createdAt: string
  updatedAt: string
}

export interface SocialLinks {
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export interface UpdateWorkspaceDto {
  name?: string
  slug?: string
  bio?: string
  headline?: string
  avatarUrl?: string
  bannerUrl?: string
  publicProfile?: boolean
  socialLinks?: SocialLinks
  skills?: string[]
  availableForWork?: boolean
  availabilityNote?: string
}
```

### 3.2 Tipo compartido: respuesta paginada

**Archivo: `src/lib/api/types.ts`**

```ts
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
```

---

## 4. Estado Global (Auth State)

### 4.1 Cómo funciona en Orkpad

Pinia store `auth` con:
- Estado: `user`, `loading`, `initialized`, `error`
- Getter: `isAuthenticated`
- Acciones: `login`, `register`, `logout`, `fetchMe`
- Patrón singleton para `fetchMe`: una promesa global evita múltiples llamadas concurrentes.

### 4.2 Adaptación a Next.js: React Context + Hook

**Archivo: `src/lib/auth/auth-context.tsx`**

```tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { authApi } from '@/lib/api/auth/auth.api'
import type { User, LoginDto, RegisterDto } from '@/lib/api/auth/auth.types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
  pendingEmailVerification: boolean
  pendingEmail: string
}

interface AuthActions {
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | null>(null)

// Singleton promise para evitar múltiples /auth/me concurrentes
let fetchMePromise: Promise<void> | null = null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    initialized: false,
    error: null,
    pendingEmailVerification: false,
    pendingEmail: '',
  })

  const fetchMe = useCallback(async () => {
    if (fetchMePromise) return fetchMePromise

    fetchMePromise = (async () => {
      try {
        const { data } = await authApi.me()
        setState((s) => ({ ...s, user: data, initialized: true }))
      } catch {
        setState((s) => ({ ...s, user: null, initialized: true }))
      } finally {
        fetchMePromise = null
      }
    })()

    return fetchMePromise
  }, [])

  const login = useCallback(
    async (dto: LoginDto) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        await authApi.login(dto)
        await fetchMe()
      } catch (err: any) {
        const status = err.response?.status
        const code = err.response?.data?.code
        if (code === 'EMAIL_NOT_VERIFIED') {
          setState((s) => ({ ...s, error: null }))
        } else if (status === 401) {
          setState((s) => ({ ...s, error: 'Email o contraseña incorrectos.' }))
        } else if (status === 403) {
          setState((s) => ({ ...s, error: 'Acceso denegado.' }))
        } else if (status === 429) {
          setState((s) => ({
            ...s,
            error: 'Demasiados intentos. Esperá unos minutos.',
          }))
        } else {
          setState((s) => ({
            ...s,
            error: 'Error al iniciar sesión. Intentá de nuevo.',
          }))
        }
        throw err
      } finally {
        setState((s) => ({ ...s, loading: false }))
      }
    },
    [fetchMe],
  )

  const register = useCallback(
    async (dto: RegisterDto) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const { data } = await authApi.register(dto)
        if (data.requiresEmailVerification) {
          setState((s) => ({
            ...s,
            pendingEmailVerification: true,
            pendingEmail: dto.email,
          }))
        } else {
          await fetchMe()
        }
      } catch (err: any) {
        const status = err.response?.status
        if (status === 409) {
          setState((s) => ({
            ...s,
            error: 'Este email ya está registrado.',
          }))
        } else if (status === 400) {
          setState((s) => ({
            ...s,
            error: 'Datos inválidos. Revisá el formulario.',
          }))
        } else {
          setState((s) => ({
            ...s,
            error: 'Error al registrar. Intentá de nuevo.',
          }))
        }
        throw err
      } finally {
        setState((s) => ({ ...s, loading: false }))
      }
    },
    [fetchMe],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setState((s) => ({
        ...s,
        user: null,
        initialized: true,
      }))
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
```

### 4.3 Hook `useIsAuthenticated` para layouts

```ts
// src/lib/auth/use-is-authenticated.ts
'use client'

import { useEffect } from 'react'
import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'

export function useIsAuthenticated(options?: { redirectTo?: string }) {
  const { user, initialized, fetchMe } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) {
      fetchMe()
    }
  }, [initialized, fetchMe])

  useEffect(() => {
    if (initialized && !user && options?.redirectTo) {
      router.push(options.redirectTo)
    }
  }, [initialized, user, options?.redirectTo, router])

  return { user, isLoading: !initialized }
}
```

### 4.4 Layout protegido (envuelve todas las páginas de la app)

```tsx
// src/app/(app)/layout.tsx
import { AuthProvider } from '@/lib/auth/auth-context'
import { AppShell } from './_components/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
```

---

## 5. Estructura de Carpetas Recomendada

```
create-saas-ar-frontend/
├── .claude/
│   └── CLAUDE.md
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/                 ← rutas públicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx          ← layout público (sin sidebar)
│   │   │   └── _components/        ← componentes privados de auth
│   │   ├── (app)/                  ← rutas protegidas
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx          ← <AuthProvider> + sidebar/nav
│   │   │   └── _components/        ← componentes privados del app shell
│   │   ├── layout.tsx              ← layout raíz (html, body, fonts)
│   │   ├── page.tsx                ← landing page
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                     ← componentes shadcn/ui
│   ├── hooks/                      ← hooks reutilizables
│   │   ├── use-toast.ts
│   │   └── use-form.ts             ← hook genérico de formulario
│   ├── lib/
│   │   ├── api/
│   │   │   ├── http-client.ts      ← Axios instance + interceptors
│   │   │   ├── types.ts            ← PaginatedResponse<T>
│   │   │   ├── auth/
│   │   │   │   ├── auth.api.ts
│   │   │   │   └── auth.types.ts
│   │   │   └── workspace/
│   │   │       ├── workspace.api.ts
│   │   │       └── workspace.types.ts
│   │   ├── auth/
│   │   │   ├── auth-context.tsx     ← AuthProvider + useAuth
│   │   │   └── use-is-authenticated.ts
│   │   └── utils/                   ← funciones puras (dates, currency, etc.)
│   └── server/                      ← Server Actions si se usan
├── middleware.ts                    ← protección de rutas
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── components.json                  ← config de shadcn/ui
```

**Reglas de nomenclatura:**
- **Archivos**: `kebab-case.ts` para módulos, `kebab-case.tsx` para componentes
- **Carpetas**: `kebab-case` o `(grupo)` para route groups de Next.js
- **Componentes**: `PascalCase` para nombres de función y archivo cuando es un componente standalone
- **Interfaces/DTOs**: `PascalCase` con sufijo `Dto` para inputs (`LoginDto`, `CreateProjectDto`)
- **APIs**: `camelCase` exportando objeto con métodos (`authApi`, `projectsApi`)
- **Hooks**: prefijo `use` (`useAuth`, `useForm`)

---

## 6. Formularios

### 6.1 Cómo funciona en Orkpad

- **Sin librería de formularios** — `v-model` directo sobre `data()` (Vue Options API)
- **Validación manual** en el handler de submit
- **Mensajes de error** desde el store (tras respuesta HTTP con error)
- **Botón submit** con prop `loading` del store para estado de carga

### 6.2 Adaptación a Next.js

Patrón recomendado con React Hook Form + Zod (complementa bien con shadcn/ui):

```tsx
// src/app/(auth)/login/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      router.push('/dashboard')
    } catch {
      // error se muestra desde useAuth().error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Inputs de shadcn/ui con {...register('email')} */}
      {/* Mostrar errors.email?.message y error del store */}
      {/* Botón submit con loading={loading} */}
    </form>
  )
}
```

**Alternativa sin librería** (como hace Orkpad):

```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (!form.email || !form.password) {
      setLocalError('Completá todos los campos')
      return
    }
    try {
      await login(form)
    } catch {
      // error del store se muestra automáticamente
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {localError && <p className="text-red-500">{localError}</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Ingresar'}</button>
    </form>
  )
}
```

---

## 7. .claude/CLAUDE.md para create-saas-ar-frontend

Archivo a crear en `.claude/CLAUDE.md`:

```markdown
# CLAUDE.md — create-saas-ar Frontend

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript (strict) |
| UI | shadcn/ui + Tailwind CSS 4 |
| Estado | React Context (auth) + TanStack Query (datos de servidor) |
| HTTP | Axios 1 (con cookies HTTP-only para auth) |
| Validación | Zod + React Hook Form |
| Toasts | Sonner (shadcn/ui compatible) |

## Convenciones de carpetas

```
src/
├── app/                    ← App Router: layouts, pages, route groups
│   ├── (auth)/             ← rutas públicas (login, register)
│   └── (app)/              ← rutas protegidas (dashboard, settings, etc.)
├── components/ui/          ← componentes shadcn/ui (generados por CLI)
├── hooks/                  ← hooks genéricos reutilizables
├── lib/
│   ├── api/                ← capa HTTP: http-client.ts + módulos por entidad
│   │   ├── http-client.ts
│   │   ├── types.ts        ← PaginatedResponse<T>
│   │   └── [entidad]/
│   │       ├── [entidad].api.ts
│   │       └── [entidad].types.ts
│   ├── auth/               ← auth state (provider, hook)
│   └── utils/              ← funciones puras
```

## Cómo consumir la API del backend

- **HTTP Client centralizado**: `src/lib/api/http-client.ts` — instancia de Axios con `withCredentials: true`, interceptors para refresh de token y limpieza de params vacíos.
- **Módulos por entidad**: cada carpeta `src/lib/api/[entidad]/` exporta un objeto `[entidad]Api` con métodos (`getAll`, `getById`, `create`, `update`, `remove`).
- **Tipos separados**: los DTOs y respuestas van en `[entidad].types.ts` al lado del archivo `.api.ts`.
- **Refresh automático**: el interceptor de respuesta atrapa 401, hace `POST /auth/refresh`, encola requests y los reintenta. Usa un flag `isRefreshing` global para evitar múltiples refreshes concurrentes.
- **Toasts**: no se hacen en el interceptor (a diferencia de Orkpad). Los toasts se disparan desde los hooks o componentes que llaman a la API.

## Cómo manejar auth en el cliente

- **JWT via cookies HTTP-only** — el frontend nunca accede al token. `withCredentials: true` en Axios envía/recibe cookies automáticamente.
- **AuthProvider** en `src/lib/auth/auth-context.tsx` — Context de React que expone `user`, `loading`, `initialized`, `error` y acciones (`login`, `register`, `logout`, `fetchMe`).
- **fetchMe singleton**: la primera llamada a `/auth/me` se cachea en una promesa global para evitar requests duplicados.
- **Protección de rutas**: `middleware.ts` en raíz chequea la cookie de sesión y redirige a `/login` si no existe. El layout `(app)/layout.tsx` wrappea con `<AuthProvider>`.
- **Hook `useIsAuthenticated`**: llama `fetchMe` si no está inicializado, redirige si no hay `user`.

## Flujo de auth

```
Usuario hace login → POST /auth/login (con withCredentials)
  ↓
Backend responde 200 + Set-Cookie (JWT en cookie HTTP-only)
  ↓
Cliente llama GET /auth/me → recibe User
  ↓
AuthProvider guarda user en estado → isAuthenticated = true
  ↓
useIsAuthenticated detecta user y deja renderizar la página
  ↓
En cualquier 401 → interceptor hace POST /auth/refresh → reintenta
  ↓
Si refresh falla → user = null → middleware redirige a /login
```

## Reglas de nomenclatura

- **Archivos**: `kebab-case.ts` / `kebab-case.tsx`
- **Componentes**: `PascalCase` (nombre de función y archivo)
- **Interfaces**: `PascalCase`, sin prefijo `I`. DTOs con sufijo `Dto`.
- **APIs**: `camelCase` exportando objeto (`authApi`, `projectsApi`)
- **Hooks**: `usePascalCase` (`useAuth`, `useForm`, `useIsAuthenticated`)
- **Route groups**: `(nombre)` con paréntesis

## Qué NO hacer

- **NO** guardar tokens en `localStorage` — usar cookies HTTP-only con `withCredentials`
- **NO** hacer llamadas API directamente desde componentes — usar hooks o TanStack Query
- **NO** crear stores globales con Zustand/Redux para auth — usar React Context (es suficiente para auth state)
- **NO** mezclar tipos en archivos `.api.ts` — siempre separar en `.types.ts`
- **NO** usar `fetch` directamente — usar `apiClient` (Axios) que ya tiene interceptors y manejo de cookies
- **NO** hacer páginas completas como Server Components si dependen de auth state — usar `'use client'` con hooks
- **NO** importar componentes de `@/components/ui` desde `@/lib` — `lib/` no debe depender de la UI
- **NO** usar `<script setup>` o Options API — esto es React, usar functional components con hooks
```

---

## 8. Resumen de Archivos a Crear

| Archivo | Origen en Orkpad | Notas |
|---|---|---|
| `src/lib/api/http-client.ts` | `src/api/axios.config.ts` | Sin URLs hardcodeadas, usa `NEXT_PUBLIC_API_URL` |
| `src/lib/api/auth/auth.api.ts` | `src/api/auth/auth.api.ts` | Simplificado, sin biometría ni OAuth de terceros |
| `src/lib/api/auth/auth.types.ts` | `src/api/auth/auth.types.ts` | Tipos User, LoginDto, RegisterDto |
| `src/lib/api/workspace/workspace.types.ts` | `src/api/workspaces/workspaces.types.ts` | Tipos Workspace, UpdateWorkspaceDto |
| `src/lib/api/types.ts` | `src/api/*/types.ts` (compilado) | `PaginatedResponse<T>` |
| `src/lib/auth/auth-context.tsx` | `src/stores/auth.store.ts` | React Context en vez de Pinia |
| `src/lib/auth/use-is-authenticated.ts` | `src/router/guards.ts` | Hook en vez de navigation guard |
| `middleware.ts` | `src/router/guards.ts` (parte de redirect) | Protección de rutas a nivel HTTP |
| `.claude/CLAUDE.md` | Nuevo | Documentación de arquitectura |
