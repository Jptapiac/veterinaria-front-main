import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import {
	type Appointment,
	type User as Client,
	type FollowUp,
	type ID,
	type Pet,
	type ProcedureType,
	type Product,
	type Reservation,
	type Treatment,
	type Vet
} from '../types'
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage'

const LATENCY_MS = 500

type DB = {
	clients: Client[]
	pets: Pet[]
	vets: Vet[]
	appointments: Appointment[]
	calls: CallRecord[]
	treatments: Treatment[]
	followUps: FollowUp[]
	products: Product[]
	reservations: Reservation[]
}

const LS_KEY = 'pochita_db_v1'

function seed(): DB {
	const now = dayjs()
	const clients: Client[] = [
		{ id: uuid(), name: 'Juan Pérez', phone: '999-111-222', email: 'juan.perez@example.com', password: '', role: 'cliente' },
		{ id: uuid(), name: 'María López', phone: '999-333-444', email: 'maria.lopez@example.com', password: '', role: 'cliente' }
	]
	const pets: Pet[] = [
		{ id: uuid(), name: 'Firulais', species: 'Perro', breed: 'Mestizo', age: 4, userId: clients[0]!.id },
		{ id: uuid(), name: 'Mishi', species: 'Gato', breed: 'Siames', age: 2, userId: clients[1]!.id }
	]
	const vets: Vet[] = [
		{ id: uuid(), name: 'Dra. Salazar', specialty: 'General', reasons: ['Control general', 'Vacunacion', 'Desparasitacion'], species: ['Perro', 'Gato'], startHour: 13, endHour: 18 },
		{ id: uuid(), name: 'Dr. Rojas', specialty: 'Cirugía', reasons: ['Cirugia menor', 'Consulta por sintomas', 'Otro'], species: ['Perro', 'Reptil'], startHour: 9, endHour: 13 }
	]
	const appointments: Appointment[] = [
		{
			id: uuid(),
			userId: clients[0]!.id,
			petId: pets[0]!.id,
			vetId: vets[0]!.id,
			reason: 'Vacunación anual',
			dateTime: now.add(1, 'day').hour(10).minute(0).second(0).millisecond(0).toISOString(),
			status: 'PROGRAMADA'
		}
	]
	const calls: CallRecord[] = []
	const products: Product[] = [
		{ id: uuid(), name: 'Alimento Premium 5kg', price: 120.0, stock: 8 },
		{ id: uuid(), name: 'Antipulgas', price: 35.5, stock: 0 },
		{ id: uuid(), name: 'Vitaminas', price: 22.9, stock: 14 }
	]
	return { clients, pets, vets, appointments, calls, treatments: [], followUps: [], products, reservations: [] }
}

function getDb(): DB {
	return getLocalStorageItem<DB>(LS_KEY, seed())
}

function saveDb(db: DB) {
	setLocalStorageItem(LS_KEY, db)
}

function simulate<T>(result: T, ms = LATENCY_MS): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(result), ms))
}

// Clients & Pets
export async function listClients() {
	return simulate(getDb().clients)
}
export async function upsertClient(input: Omit<Client, 'id'> & Partial<Pick<Client, 'id'>>) {
	const db = getDb()
	if (input.id) {
		db.clients = db.clients.map((c) => (c.id === input.id ? { ...c, ...input } : c))
	} else {
		db.clients.push({ id: uuid(), name: input.name, phone: input.phone, email: (input as any).email ?? '', password: (input as any).password ?? '', role: (input as any).role ?? 'cliente' } as Client)
	}
	saveDb(db)
	return simulate(db.clients)
}
export async function listPets() {
	return simulate(getDb().pets)
}
export async function upsertPet(input: Omit<Pet, 'id' | 'userId'> & Partial<Pick<Pet, 'id' | 'userId'>>) {
	const db = getDb()
	if (input.id) {
		db.pets = db.pets.map((p) => (p.id === input.id ? { ...p, ...input } : p))
		const updated = db.pets.find((p) => p.id === input.id)
		saveDb(db)
		return simulate(updated as Pet)
	} else {
		const newPet: Pet = { id: uuid(), userId: input.userId || '', ...input } as Pet
		db.pets.push(newPet)
		saveDb(db)
		return simulate(newPet)
	}
}

// Vets & Appointments
export async function listVets() {
	return simulate(getDb().vets)
}

export async function upsertVet(input: Partial<Vet> & { id?: string }) {
	const db = getDb()
	if (input.id) {
		db.vets = db.vets.map((v) => (v.id === input.id ? { ...v, ...input } : v))
		const updated = db.vets.find((v) => v.id === input.id)
		saveDb(db)
		return simulate(updated as Vet)
	} else {
		const newVet: Vet = { id: uuid(), name: (input.name as string) || 'Nuevo Veterinario', specialty: input.specialty, reasons: input.reasons || [], species: input.species || [] }
		db.vets.push(newVet)
		saveDb(db)
		return simulate(newVet)
	}
}

// Auth
export async function login(email: string, password: string) {
	const db = getDb()
	const client = db.clients.find((c) => c.email === email && c.password === password)
	if (!client) throw new Error('Credenciales inválidas')
	return simulate({ token: `fake-jwt-${client.id}`, user: client })
}

export async function register(input: { name: string; email: string; password: string; phone: string }) {
	const db = getDb()
	if (db.clients.find((c) => c.email === input.email)) throw new Error('Email ya registrado')
	const newClient: Client = { id: uuid(), ...input, role: 'cliente' }
	db.clients.push(newClient)
	saveDb(db)
	return simulate({ token: `fake-jwt-${newClient.id}`, user: newClient })
}

export function getAvailableSlots(vetId: ID, dateISO: string): string[] {
	// Generate slots respecting each vet's working hours
	const db = getDb()
	const vet = db.vets.find((v) => v.id === vetId)
	const startHour = vet?.startHour ?? 9 // default 09:00
	const endHour = vet?.endHour ?? 18 // default 18:00

	const date = dayjs(dateISO).hour(startHour).minute(0).second(0).millisecond(0)
	const slots: string[] = []
	for (let h = startHour; h < endHour; h++) {
		const slot = date.hour(h).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
		slots.push(slot)
	}
	console.log(`[fakeApi] Vet ${vetId} hours ${startHour}-${endHour}: generated ${slots.length} slots for ${dateISO}:`, slots.map((s) => s.substring(11, 16)))

	const booked = new Set(
		db.appointments.filter((a) => a.vetId === vetId && dayjs(a.dateTime).isSame(dateISO, 'day')).map((a) => dayjs(a.dateTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
	)
	const result = slots.filter((s) => !booked.has(s))
	console.log(`[fakeApi] After filtering booked for vet ${vetId}:`, result.map((s) => s.substring(11, 16)))
	return result
}
export async function listAppointments() {
	return simulate(getDb().appointments.sort((a, b) => dayjs(a.dateTime).valueOf() - dayjs(b.dateTime).valueOf()))
}
export async function createAppointment(input: Omit<Appointment, 'id' | 'status' | 'createdAt'>) {
	const db = getDb()
	const newApt: Appointment = {
		...input,
		id: uuid(),
		status: 'PROGRAMADA'
	}
	db.appointments.push(newApt)
	saveDb(db)
	return simulate(newApt)
}
export async function updateAppointment(id: ID, patch: Partial<Appointment>) {
	const db = getDb()
	db.appointments = db.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a))
	saveDb(db)
	return simulate(db.appointments.find((a) => a.id === id)!)
}
export async function cancelAppointment(id: ID) {
	return updateAppointment(id, { status: 'CANCELADA' })
}
export async function confirmAppointment(id: ID) {
	return updateAppointment(id, { status: 'CONFIRMADA' })
}

// Treatments & Follow-ups
export async function createTreatment(input: {
	appointmentId: ID
	procedure: ProcedureType
	approvedByOwner: boolean
	additionalCost?: number
	notes: string
}) {
	const db = getDb()
	const treatment: Treatment = {
		id: uuid(),
		appointmentId: input.appointmentId,
		procedure: input.procedure,
		approvedByOwner: input.approvedByOwner,
		additionalCost: input.additionalCost,
		notes: input.notes,
		createdAt: new Date().toISOString()
	}
	db.treatments.push(treatment)
	saveDb(db)
	return simulate(treatment)
}

export async function listTreatmentsByAppointment(appointmentId: ID) {
	return simulate(getDb().treatments.filter((t) => t.appointmentId === appointmentId))
}

type CallRecord = { id: ID; name?: string; phone?: string; notes?: string; at: string }

export async function listCalls() {
	return simulate(getDb().calls)
}

export async function createCall(input: { name?: string; phone?: string; notes?: string }) {
	const db = getDb()
	const rec: CallRecord = { id: uuid(), name: input.name, phone: input.phone, notes: input.notes, at: dayjs().toISOString() }
	db.calls.unshift(rec)
	saveDb(db)
	return simulate(rec)
}

export async function deleteCall(id: ID) {
	const db = getDb()
	db.calls = db.calls.filter((c) => c.id !== id)
	saveDb(db)
	return simulate(true)
}

export async function createFollowUps(treatmentId: ID, datesISO: string[]) {
	const db = getDb()
	const items: FollowUp[] = datesISO.map((d) => ({ id: uuid(), treatmentId, dateISO: d, notes: '', completed: false }))
	db.followUps.push(...items)
	saveDb(db)
	return simulate(items)
}
export async function listFollowUps(treatmentId: ID) {
	return simulate(getDb().followUps.filter((f) => f.treatmentId === treatmentId))
}
export async function completeFollowUp(id: ID) {
	const db = getDb()
	db.followUps = db.followUps.map((f) => (f.id === id ? { ...f, completed: true } : f))
	saveDb(db)
	return simulate(db.followUps.find((f) => f.id === id)!)
}

// Products & Reservations
export async function listProducts() {
	return simulate(getDb().products)
}
export async function updateProductStock(productId: ID, delta: number) {
	const db = getDb()
	db.products = db.products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
	saveDb(db)
	return simulate(db.products.find((p) => p.id === productId)!)
}
export async function checkout(cart: { productId: ID; quantity: number }[]) {
	const db = getDb()
	for (const item of cart) {
		db.products = db.products.map((p) =>
			p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p
		)
	}
	saveDb(db)
	return simulate(true)
}
export async function createReservation(input: Omit<Reservation, 'id' | 'status' | 'createdAt'>) {
	const db = getDb()
	const reservation: Reservation = {
		...input,
		id: uuid(),
		status: 'pendiente',
		createdAt: new Date().toISOString()
	}
	db.reservations.push(reservation)
	saveDb(db)
	return simulate(reservation)
}
export async function listReservationsByProduct(productId: ID) {
	const db = getDb()
	return simulate(db.reservations.filter((r) => r.productId === productId))
}
export async function updateReservationStatus(reservationId: ID, status: Reservation['status']) {
	const db = getDb()
	db.reservations = db.reservations.map((r) => (r.id === reservationId ? { ...r, status } : r))
	saveDb(db)
	return simulate(db.reservations.find((r) => r.id === reservationId)!)
}


