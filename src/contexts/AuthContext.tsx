import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Role, User } from '../types'
import { api, type ApiUser } from '../services/backendApi'
import * as fakeApi from '../services/fakeApi'

type AuthContextValue = {
	user: User | null
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
	registerClient: (input: { name: string; email: string; password: string; phone: string }) => Promise<{ ok: boolean; userId?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const LS_SESSION = 'pochita_session_v1'

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => {
		try {
			const raw = localStorage.getItem(LS_SESSION)
			return raw ? (JSON.parse(raw) as User) : null
		} catch {
			return null
		}
	})

	useEffect(() => {
		if (user) localStorage.setItem(LS_SESSION, JSON.stringify(user))
		else localStorage.removeItem(LS_SESSION)
	}, [user])

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			async login(email, password) {
				try {
					const { token, user } = await api.login({ email, password })
					localStorage.setItem('auth_token', token)
					setUser(mapApiUser(user))
					return true
				} catch (err) {
					console.error('Login failed, trying fakeApi:', err)
					const { token, user } = await fakeApi.login(email, password)
					localStorage.setItem('auth_token', token)
					setUser(mapApiUser(user as unknown as ApiUser))
					return true
				}
			},
			logout() {
				localStorage.removeItem('auth_token')
				setUser(null)
			},
			async registerClient({ name, email, password, phone }) {
				try {
					const { token, user } = await api.register({ name, email, password, phone })
					localStorage.setItem('auth_token', token)
					const mappedUser = mapApiUser(user)
					setUser(mappedUser)
					return { ok: true, userId: mappedUser.id }
				} catch (err) {
					console.error('Register failed, trying fakeApi:', err)
					const { token, user } = await fakeApi.register({ name, email, password, phone })
					localStorage.setItem('auth_token', token)
					const mappedUser = mapApiUser(user as unknown as ApiUser)
					setUser(mappedUser)
					return { ok: true, userId: mappedUser.id }
				}
			}
		}),
		[user]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

function mapApiUser(u: ApiUser): User {
	const roleMap: Record<ApiUser['role'], Role> = {
		CLIENTE: 'cliente',
		RECEPCIONISTA: 'recepcionista',
		VETERINARIO: 'veterinario',
		ADMIN: 'admin'
	}
	return { id: u.id, name: u.name, email: u.email, password: '', role: roleMap[u.role], phone: u.phone, clientId: u.id }
}

