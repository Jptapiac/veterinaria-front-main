import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from './ToastContext'
import { api, type Pet } from '../services/backendApi'
import { useAuth } from './AuthContext'
import * as fakeApi from '../services/fakeApi'

type PetsManagementContextValue = {
	pets: Pet[]
	refresh: () => Promise<void>
	createPet: (input: Omit<Pet, 'id' | 'userId'>, userId?: string) => Promise<Pet>
	updatePet: (id: string, input: Partial<Omit<Pet, 'id' | 'userId'>>) => Promise<void>
}

const PetsManagementContext = createContext<PetsManagementContextValue | null>(null)

export function PetsManagementProvider({ children }: { children: ReactNode }) {
	const [pets, setPets] = useState<Pet[]>([])
	const { show } = useToast()
	const { user } = useAuth()

	async function refresh() {
		if (!user) {
			setPets([])
			return
		}
		try {
			const ps = await api.pets()
			setPets(ps)
		} catch (err: any) {
			// Silent fallback to fakeApi
			try {
				const ps = await fakeApi.listPets()
				setPets(ps as Pet[])
			} catch (fakeErr) {
				setPets([])
			}
		}
	}

	useEffect(() => {
		refresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	const value = useMemo<PetsManagementContextValue>(
		() => ({
			pets,
			refresh,
			async createPet(input, userId) {
				try {
					const pet = await api.createPet(input)
					await refresh()
					show({ title: 'Mascota creada', variant: 'success' })
					return pet
				} catch (e: any) {
					console.error('Error creating pet via api, trying fakeApi:', e)
					try {
						// fallback to fakeApi with explicit userId
						const finalUserId = userId || user?.id || ''
						const ps = await fakeApi.upsertPet({ ...input, userId: finalUserId })
						await refresh()
						show({ title: 'Mascota creada (modo demo)', variant: 'success' })
						return ps
					} catch (e2) {
						const msg = typeof e?.message === 'string' ? e.message : 'No se pudo crear la mascota'
						show({ title: 'Error', description: msg, variant: 'error' })
						throw e
					}
				}
			},
			async updatePet(id, input) {
				try {
					await api.updatePet(id, input)
					await refresh()
					show({ title: 'Mascota actualizada', variant: 'success' })
				} catch (e: any) {
					console.error('Error updating pet via api, trying fakeApi:', e)
					try {
						// fallback to fakeApi
						const pet = pets.find((p) => p.id === id)
						const finalUserId = pet?.userId || user?.id || ''
						// Filter out undefined values from input
						const cleanInput = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined))
						await fakeApi.upsertPet({ id, userId: finalUserId, ...cleanInput } as any)
						await refresh()
						show({ title: 'Mascota actualizada (modo demo)', variant: 'success' })
					} catch (e2) {
						const msg = typeof e?.message === 'string' ? e.message : 'No se pudo actualizar'
						show({ title: 'Error', description: msg, variant: 'error' })
						throw e
					}
				}
			}
		}),
		[pets, user?.id]
	)

	return <PetsManagementContext.Provider value={value}>{children}</PetsManagementContext.Provider>
}

export function usePetsManagement() {
	const ctx = useContext(PetsManagementContext)
	if (!ctx) throw new Error('usePetsManagement must be used within PetsManagementProvider')
	return ctx
}
