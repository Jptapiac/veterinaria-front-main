const inferProdApi = () => {
	if (typeof window !== 'undefined') {
		const host = window.location.hostname
		if (host.endsWith('vercel.app')) {
			return 'https://veterinaria-api-production.up.railway.app'
		}
	}
	// Demo mode: use unreachable port to force fakeApi fallback everywhere
	return 'http://localhost:9999'
}

const BASE_URL = import.meta.env.VITE_API_URL || inferProdApi()

function authHeaders() {
	const token = localStorage.getItem('auth_token')
	return token ? { Authorization: `Bearer ${token}` } : {}
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
	const merged: Record<string, string> = {
		'Content-Type': 'application/json',
		...(init?.headers ? (init.headers as Record<string, string>) : {}),
		...(authHeaders() as Record<string, string>)
	}
	try {
		const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: merged, signal: AbortSignal.timeout(2000) })
		if (!res.ok) {
			const txt = await res.text().catch(() => '')
			throw new Error(txt || `HTTP ${res.status}`)
		}
		return (await res.json()) as T
	} catch (e) {
		// Silently fail network errors; contexts will fallback to fakeApi
		throw new Error('Backend unavailable - using demo mode')
	}
}

export type ApiUser = { id: string; name: string; email: string; role: 'CLIENTE' | 'RECEPCIONISTA' | 'VETERINARIO' | 'ADMIN'; phone?: string }
export type Vet = { id: string; name: string; specialty?: string; reasons?: string[]; species?: string[] }
export type Pet = { id: string; userId: string; name: string; species: string; breed?: string; age?: number; weight?: number; color?: string; microchip?: string }
export type Appointment = {
	id: string
	userId: string
	petId: string
	vetId: string
	reason: string
	dateTime: string
	status: 'PROGRAMADA' | 'CONFIRMADA' | 'CANCELADA'
	vet?: Vet
	pet?: Pet
	user?: { id: string; name: string; email: string; phone?: string }
}

export const api = {
	async register(input: { name: string; email: string; password: string; phone?: string }) {
		return http<{ token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
	},
	async login(input: { email: string; password: string }) {
		return http<{ token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
	},
	async vets() {
		return http<Vet[]>('/vets')
	},
	async slots(vetId: string, date: string) {
		const q = new URLSearchParams({ vetId, date })
		return http<string[]>(`/slots?${q.toString()}`)
	},
	async pets() {
		return http<Pet[]>('/pets')
	},
	async createPet(input: { name: string; species: string; breed?: string; age?: number; weight?: number; color?: string; microchip?: string }) {
		return http<Pet>('/pets', { method: 'POST', body: JSON.stringify(input) })
	},
	async updatePet(id: string, input: Partial<Omit<Pet, 'id' | 'userId'>>) {
		return http<Pet>(`/pets/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
	},
	async appointments() {
		return http<Appointment[]>('/appointments')
	},
	async createAppointment(input: { petId: string; vetId: string; dateISO: string; reason: string }) {
		return http<Appointment>('/appointments', { method: 'POST', body: JSON.stringify(input) })
	},
	async rescheduleAppointment(id: string, input: { vetId: string; dateISO: string }) {
		return http<Appointment>(`/appointments/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify(input) })
	},
	async cancelAppointment(id: string, canceledBy: 'vet' | 'client') {
		return http<Appointment>(`/appointments/${id}?canceledBy=${canceledBy}`, { method: 'DELETE' })
	},
	async adminListUsers() {
		return http<Array<{ id: string; name: string; email: string; role: 'CLIENTE' | 'RECEPCIONISTA' | 'VETERINARIO' | 'ADMIN'; phone?: string; active: boolean }>>('/admin/users')
	},
	async adminCreateUser(input: { name: string; email: string; password: string; role: 'CLIENTE' | 'RECEPCIONISTA' | 'VETERINARIO' | 'ADMIN'; phone?: string }) {
		return http(`/admin/users`, { method: 'POST', body: JSON.stringify(input) })
	},
	async adminSetUserActive(id: string, active: boolean) {
		return http(`/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) })
	},
	async manageCreateAppointment(input: { userEmail: string; petId: string; vetId: string; dateISO: string; reason: string }) {
		return http('/manage/appointments', { method: 'POST', body: JSON.stringify(input) })
	},
	events(onEvent: (e: MessageEvent) => void) {
		const es = new EventSource(`${BASE_URL}/events`)
		es.addEventListener('vet-cancel', onEvent as any)
		return () => es.close()
	}
}


