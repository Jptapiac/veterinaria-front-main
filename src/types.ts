export type ID = string

export type Role = 'cliente' | 'recepcionista' | 'veterinario' | 'admin'

export type User = {
	id: ID
	name: string
	email: string
	password: string
	role: Role
	clientId?: ID
	phone?: string
}

export type Pet = {
	id: ID
	userId: ID
	name: string
	species: string
	breed?: string
	age?: number
	weight?: number
	color?: string
	microchip?: string
}

export type Vet = {
	id: ID
	name: string
	specialty?: string
	reasons?: string[]
	species?: string[]
	startHour?: number // e.g., 9 for 09:00
	endHour?: number // e.g., 13 for 13:00
}

export type AppointmentStatus = 'PROGRAMADA' | 'CONFIRMADA' | 'CANCELADA'

export type Appointment = {
	id: ID
	userId: ID
	petId: ID
	vetId: ID
	reason: string
	dateTime: string
	status: AppointmentStatus
	pet?: Pet
	user?: { id: string; name: string; email: string; phone?: string }
	vet?: Vet
}

export type PatientHistory = {
	id: ID
	petId: ID
	vetId: ID
	notes?: string
	allergies?: string
	medications?: string
	vaccines?: string
	lastVisit?: string
}

export type WaitlistItem = {
	id: ID
	clientId: ID
	petName: string
	petSpecies?: string
	preferredVetId?: ID
	notes?: string
	createdAt: string
}

export type ProcedureType = 'Vacunación' | 'Desparasitación' | 'Cirugía menor'

export type Treatment = {
	id: ID
	appointmentId: ID
	procedure: ProcedureType
	approvedByOwner: boolean
	additionalCost?: number
	notes: string
	createdAt: string
}

export type FollowUp = {
	id: ID
	treatmentId: ID
	dateISO: string
	notes?: string
	completed: boolean
}

export type Product = {
	id: ID
	name: string
	price: number
	stock: number
}

export type Reservation = {
	id: ID
	productId: ID
	clientName: string
	phone: string
	status: 'pendiente' | 'notificado' | 'aceptado' | 'liberado' | 'rechazado'
	createdAt: string
}


