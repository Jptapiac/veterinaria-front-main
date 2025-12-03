import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User as Client, Pet } from '../types'
import { listClients, listPets, upsertClient, upsertPet } from '../services/fakeApi'
import { useToast } from './ToastContext'

type PetsContextValue = {
	clients: Client[]
	pets: Pet[]
	refresh: () => Promise<void>
	saveClient: (c: Omit<Client, 'id'> & Partial<Pick<Client, 'id'>>) => Promise<void>
	savePet: (p: Omit<Pet, 'id'> & Partial<Pick<Pet, 'id'>>) => Promise<void>
}

const PetsContext = createContext<PetsContextValue | null>(null)

export function PetsProvider({ children }: { children: ReactNode }) {
	const [clients, setClients] = useState<Client[]>([])
	const [pets, setPets] = useState<Pet[]>([])
	const { show } = useToast()

	async function refresh() {
		const [cs, ps] = await Promise.all([listClients(), listPets()])
		setClients(cs)
		setPets(ps)
	}
	useEffect(() => {
		refresh()
	}, [])

	const value = useMemo<PetsContextValue>(
		() => ({
			clients,
			pets,
			refresh,
			async saveClient(input) {
				await upsertClient(input)
				await refresh()
				show({ title: 'Cliente guardado', variant: 'success' })
			},
			async savePet(input) {
				await upsertPet(input)
				await refresh()
				show({ title: 'Mascota guardada', variant: 'success' })
			}
		}),
		[clients, pets]
	)
	return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>
}

export function usePets() {
	const ctx = useContext(PetsContext)
	if (!ctx) throw new Error('usePets must be used within PetsProvider')
	return ctx
}


