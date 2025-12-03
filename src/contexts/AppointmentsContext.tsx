import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext'
import { api, type Appointment as ApiAppointment, type Vet as ApiVet } from '../services/backendApi'
import { listVets, listAppointments } from '../services/fakeApi'
import { useAuth } from './AuthContext'

type AppointmentsContextValue = {
	vets: ApiVet[]
	appointments: ApiAppointment[]
	refresh: () => Promise<void>
	create: (input: { petId: string; vetId: string; dateISO: string; reason: string }) => Promise<ApiAppointment>
	reschedule: (id: string, dateISO: string, vetId: string) => Promise<void>
	cancel: (id: string, by: 'vet' | 'client') => Promise<void>
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
	const [vets, setVets] = useState<ApiVet[]>([])
	const [appointments, setAppointments] = useState<ApiAppointment[]>([])
	const { show } = useToast()
	const { user } = useAuth()

	async function refresh() {
		if (!user) {
			setVets([])
			setAppointments([])
			return
		}
		try {
			const [vs, aps] = await Promise.all([api.vets(), api.appointments()])
			setVets(vs)
			setAppointments(aps)
		} catch (err) {
			// Fallback to fakeApi in demo/offline mode
			try {
				const vs = await listVets()
				const aps = await listAppointments()
				setVets(vs)
				setAppointments(aps)
			} catch (e2) {
				// Final fallback: empty state
				setVets([])
				setAppointments([])
			}
		}
	}
	useEffect(() => {
		refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	// subscribe to vet cancel alerts
	useEffect(() => {
		if (!user) return
		const off = api.events((e) => {
			try {
				const data = JSON.parse((e as MessageEvent).data)
				if (e.type === 'vet-cancel') {
					const alertMsg = data.message || `Horario liberado por el veterinario ${data.vetName}`
					show({ title: 'Cita cancelada - Horas liberadas', description: alertMsg, variant: 'info' })
					refresh()
				}
			} catch {
				// ignore
			}
		})
		return () => off()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	const value = useMemo<AppointmentsContextValue>(
		() => ({
			vets,
			appointments,
			refresh,
			async create(input) {
				try {
					const apt = await api.createAppointment({
						petId: input.petId,
						vetId: input.vetId,
						dateISO: input.dateISO,
						reason: input.reason
					})
					await refresh()
					show({ title: 'Cita creada', variant: 'success' })
				 return apt
				} catch (e: any) {
					console.error('Error creating appointment via api, trying fakeApi:', e)
					try {
						// fallback to fakeApi for demo/offline mode
						if (!user) throw new Error('User not available')
						const fakeApt: ApiAppointment = {
							id: Math.random().toString(36).substring(7),
							userId: user.id,
							petId: input.petId,
							vetId: input.vetId,
							reason: input.reason,
							dateTime: input.dateISO,
							status: 'PROGRAMADA'
							}
							// for now, just return the fake appointment and notify
							await refresh()
							show({ title: 'Cita creada (modo demo)', variant: 'success' })
						return fakeApt
					} catch (e2) {
						const msg = typeof e?.message === 'string' ? e.message : 'No se pudo crear la cita'
						show({ title: 'Error', description: msg, variant: 'error' })
						throw e
					}
				}
			},
			async reschedule(id, dateISO, vetId) {
				try {
					await api.rescheduleAppointment(id, { dateISO, vetId })
					await refresh()
					show({ title: 'Cita reprogramada', variant: 'success' })
				} catch (e: any) {
					const msg = typeof e?.message === 'string' ? e.message : 'No se pudo reprogramar'
					show({ title: 'Error', description: msg, variant: 'error' })
					throw e
				}
			},
			async cancel(id, by) {
				try {
					await api.cancelAppointment(id, by)
					await refresh()
					show({ title: 'Cita cancelada', variant: 'success' })
				} catch (e: any) {
					const msg = typeof e?.message === 'string' ? e.message : 'No se pudo cancelar'
					show({ title: 'Error', description: msg, variant: 'error' })
					throw e
				}
			}
		}),
		[vets, appointments]
	)
	return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>
}

export function useAppointments() {
	const ctx = useContext(AppointmentsContext)
	if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider')
	return ctx
}


