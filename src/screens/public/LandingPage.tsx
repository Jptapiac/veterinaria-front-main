import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from '../../lib/dayjs'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useAppointments } from '../../contexts/AppointmentsContext'
import { listVets, upsertVet, getAvailableSlots } from '../../services/fakeApi'
import type { Vet } from '../../types'
import { api } from '../../services/backendApi'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { usePetsManagement } from '../../contexts/PetsManagementContext'
import { Modal } from '../../components/ui/Modal'
export function LandingPage() {
	const { user } = useAuth()
	const { show } = useToast()
	const { vets, create, refresh } = useAppointments()
	const { pets, createPet: createNewPet } = usePetsManagement()
	const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
	const [form, setForm] = useState({
		clientName: '',
		clientPhone: '',
			petId: '',
		petName: '',
		petSpecies: 'Perro',
		vetId: '',
		date: dayjs().format('YYYY-MM-DD'),
		slot: '',
		reason: ''
	})

	const [slots, setSlots] = useState<string[]>([])
	// NOTE: kept `slots` for backward-compatibility with other code; primary per-vet data is in `vetSlots`
	const [vetSlots, setVetSlots] = useState<Record<string, string[]>>({})
	const [errors, setErrors] = useState<{ petId?: string; vetId?: string; date?: string; slot?: string; reason?: string; clientName?: string }>({})
	const [createNewPetMode, setCreateNewPetMode] = useState(false)
	const [editVetsOpen, setEditVetsOpen] = useState(false)
	const [adminVets, setAdminVets] = useState<Vet[]>([])
	const [savingVetId, setSavingVetId] = useState<string | null>(null)
	const [vetErrors, setVetErrors] = useState<Record<string, string>>({})

	// simple blacklist for obvious insults — extend as needed
	const BAD_WORDS = ['puta', 'hijo de puta', 'mierda', 'culiao', 'idiota', 'imbecil']

	useEffect(() => {
		if (user?.role === 'cliente') {
			setForm((f) => ({ ...f, clientName: user.name, clientPhone: user.phone ?? f.clientPhone }))
		}
	}, [user])

	// show only user's pets when logged as client
	const visiblePets = user ? pets.filter((p) => p.userId === user.id) : pets

	useEffect(() => {
		if (user?.role === 'cliente' && form.petId) {
			setForm((f) => ({ ...f, clientName: user.name }))
		}
	}, [form.petId, user])

	useEffect(() => {
		async function loadAllVetSlots() {
			if (!form.date) return
			const date = dayjs(form.date).format('YYYY-MM-DD')
			const map: Record<string, string[]> = {}
			for (const v of vets) {
				// Prefer the demo/local fakeApi generator which respects per-vet hours (startHour/endHour).
				// This avoids backend mismatches and guarantees per-vet availability shown to users.
				try {
					const fakeSlots = getAvailableSlots(v.id, date)
					const filtered = fakeSlots.filter((slot) => dayjs(slot).hour() >= 9)
					console.log(`[LandingPage] Vet ${v.id}: got ${fakeSlots.length} fake slots, after filter: ${filtered.length}`, filtered.map((s) => s.substring(11, 16)))
					map[v.id] = filtered
				} catch (e) {
					// If fakeApi fails for some reason, try the backend as a fallback.
					try {
						const s = await api.slots(v.id, date)
						map[v.id] = (s || []).filter((slot) => dayjs(slot).hour() >= 9)
					} catch (e2) {
						console.error(`Both fakeApi and backend failed for vet ${v.id}:`, e, e2)
						map[v.id] = []
					}
				}
			}
			setVetSlots(map)
			// if selected vet no longer has slots, clear selection
			if (form.vetId) {
				const selectedSlots = map[form.vetId] ?? []
				if (selectedSlots.length === 0) setForm((f) => ({ ...f, slot: '' }))
			}
		}
		loadAllVetSlots()
	}, [vets, form.date])

	async function submit() {
		try {
			if (!user) {
				show({ title: 'Debes iniciar sesión para reservar', variant: 'error' })
				return
			}
			const e: typeof errors = {}
			if (!form.petId) e.petId = 'Selecciona o crea una mascota'
			if (!form.vetId) e.vetId = 'Selecciona un veterinario'
			if (!form.date) e.date = 'Selecciona una fecha'
			if (!form.slot) e.slot = 'Selecciona un horario disponible'
			if (form.slot) {
				// More robust: parse the selected slot as a full datetime and compare to now.
				// This handles timezone offsets correctly and avoids brittle substring comparisons.
				const slotDate = dayjs(form.slot)
				if (!slotDate.isValid()) {
					e.slot = 'Horario inválido'
				} else if (dayjs(form.date).isSame(dayjs(), 'day')) {
					if (slotDate.isBefore(dayjs())) {
						e.slot = 'No puedes agendar en el pasado'
					}
				}
			}
			if (!form.reason || form.reason.trim().length < 3) e.reason = 'Indica el motivo (mínimo 3 caracteres)'
			setErrors(e)
			if (Object.keys(e).length > 0) return
			await create({ petId: form.petId, vetId: form.vetId, reason: form.reason, dateISO: form.slot })
			show({ title: 'Cita solicitada', variant: 'success' })
			setForm((f) => ({ ...f, slot: '', petId: '', reason: '' }))
		} catch (e: any) {
			const msg = typeof e?.message === 'string' ? e.message : 'No se pudo crear la cita'
			show({ title: 'Error al reservar', description: msg, variant: 'error' })
		}
	}

	// Inline auth forms inside landing
	const [loginEmail, setLoginEmail] = useState('')
	const [loginPassword, setLoginPassword] = useState('')
	const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({})
	const [loginGeneralError, setLoginGeneralError] = useState<string | null>(null)
	const [regName, setRegName] = useState('')
	const [regPhone, setRegPhone] = useState('')
	const [regPetName, setRegPetName] = useState('')
	const [regPetAge, setRegPetAge] = useState('')
	const [regPetBreed, setRegPetBreed] = useState('')
	const [regPetWeight, setRegPetWeight] = useState('')
	const [regPetSpecies, setRegPetSpecies] = useState('Perro')
	const [regEmail, setRegEmail] = useState('')
	const [regPassword, setRegPassword] = useState('')
	const [regConfirm, setRegConfirm] = useState('')
	const [authLoading, setAuthLoading] = useState(false)
	const [authErrors, setAuthErrors] = useState<{ name?: string; phone?: string; email?: string; password?: string; confirm?: string }>({})
	const [petErrors, setPetErrors] = useState<{ name?: string; age?: string; breed?: string; weight?: string }>({})
	const { login, registerClient } = useAuth()

	function validateLogin(): boolean {
		const e: typeof loginErrors = {}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) e.email = 'Ingresa un correo válido'
		if (loginPassword.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
		setLoginErrors(e)
		return Object.keys(e).length === 0
	}

	async function submitLogin(e: React.FormEvent) {
		e.preventDefault()
		if (!validateLogin()) return
		setAuthLoading(true)
		setLoginGeneralError(null)
		try {
			const ok = await login(loginEmail, loginPassword)
			if (!ok) throw new Error('Credenciales inválidas')
			show({ title: 'Bienvenido', variant: 'success' })
			setAuthMode(null)
		} catch (err: any) {
			let msg = 'Credenciales inválidas'
			if (typeof err?.message === 'string') {
				try {
					const parsed = JSON.parse(err.message)
					msg = parsed?.error ?? msg
				} catch {
					msg = err.message || msg
				}
			}
			setLoginGeneralError(msg)
			show({ title: 'No se pudo iniciar sesión', description: msg, variant: 'error' })
		} finally {
			setAuthLoading(false)
		}
	}

	function validateRegister(): boolean {
		const userErr: typeof authErrors = {}
		const pErr: typeof petErrors = {}
		const cleanedName = regName.replace(/[0-9]/g, '').trim()
		if (cleanedName.length < 2) userErr.name = 'Ingresa tu nombre completo'
		if (BAD_WORDS.find((w) => cleanedName.toLowerCase().includes(w))) userErr.name = 'Nombre no permitido'
		if (!/^[0-9]{9}$/.test(regPhone)) userErr.phone = 'Ingresa un teléfono válido (9 dígitos)'
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) userErr.email = 'Ingresa un correo válido'
		if (regPassword.length < 6) userErr.password = 'La contraseña debe tener al menos 6 caracteres'
		if (regConfirm !== regPassword) userErr.confirm = 'Las contraseñas no coinciden'

		// pet validations
		if (regPetName.trim().length < 1) pErr.name = 'Ingresa el nombre de la mascota'
		if (!/^[0-9]{1,3}$/.test(regPetAge)) pErr.age = 'Ingresa una edad válida'
		if (regPetBreed.trim().length < 2) pErr.breed = 'Ingresa la raza de la mascota'
		if (!/^[0-9]+(\.[0-9]+)?$/.test(regPetWeight)) pErr.weight = 'Ingresa el peso de la mascota'

		setAuthErrors(userErr)
		setPetErrors(pErr)
		return Object.keys(userErr).length === 0 && Object.keys(pErr).length === 0
	}
 
	async function submitRegister(e: React.FormEvent) {
		e.preventDefault()
		if (!validateRegister()) return
		setAuthLoading(true)
		try {
			const result = await registerClient({ name: regName, email: regEmail, password: regPassword, phone: regPhone })
			if (!result.ok) throw new Error('No se pudo registrar')
			// Create pet immediately with the newly registered user's ID
			if (result.userId) {
				try {
					await createNewPet({ name: regPetName, species: regPetSpecies, breed: regPetBreed, age: Number(regPetAge), weight: Number(regPetWeight) }, result.userId)
				} catch {
					show({ title: 'Registro', description: 'Usuario registrado, pero no se pudo crear la mascota automáticamente', variant: 'info' })
				}
			}
			show({ title: 'Registro exitoso', variant: 'success' })
			setAuthMode(null)
		} catch (err: any) {
			const msg = typeof err?.message === 'string' ? err.message : 'No se pudo registrar'
			show({ title: 'Error en registro', description: msg, variant: 'error' })
		} finally {
			setAuthLoading(false)
		}
	}

	return (
		<div className="relative min-h-screen">
			<video className="fixed inset-0 h-screen w-screen object-cover" autoPlay muted loop playsInline>
				<source src="/video-fondo.mp4" type="video/mp4" />
			</video>
			<div className="fixed inset-0 bg-black/50" />
			<div className="fixed inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

			<section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-2">
				<div className="flex flex-col justify-center text-white">
					<h1 className="text-3xl font-bold sm:text-4xl">Veterinaria Pochita S.A.</h1>
					<p className="mt-3 max-w-prose text-white/90">
						Cuidamos a tu mascota con amor y profesionalismo. Agenda tu hora con nuestros especialistas.
					</p>
					<div className="mt-8 grid grid-cols-3 gap-4 text-sm">
						<div className="rounded-xl bg-white/10 p-4 backdrop-blur">
							<div className="text-2xl">🩺</div>
							<div className="mt-1 font-medium">Atención Experta</div>
						</div>
						<div className="rounded-xl bg-white/10 p-4 backdrop-blur">
							<div className="text-2xl">⏱️</div>
							<div className="mt-1 font-medium">Agenda Flexible</div>
						</div>
						<div className="rounded-xl bg-white/10 p-4 backdrop-blur">
							<div className="text-2xl">❤️</div>
							<div className="mt-1 font-medium">Cuidado Amoroso</div>
						</div>
						</div>

						{/* Modal: Edit veterinarians (admin) */}
						<Modal title="Editar Veterinarios" open={editVetsOpen} onClose={() => setEditVetsOpen(false)} maxWidth="lg" footer={
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setEditVetsOpen(false)}>Cerrar</Button>
							</div>
						}>
							<div className="space-y-4">
								{adminVets.map((v) => (
									<div key={v.id} className="border p-3 rounded">
										<div className="flex items-center justify-between">
											<div className="font-medium">{v.name}</div>
											<div>
												<Button variant="outline" size="sm" onClick={() => {
													setAdminVets((prev) => prev.map((pv) => (pv.id === v.id ? { ...pv, reasons: v.reasons ?? [] } : pv)))
												}}>Editar</Button>
											</div>
										</div>
										<div className="mt-2 grid grid-cols-1 gap-2">
											<label className="text-xs">Especialidad</label>
											<input className="input" value={v.specialty ?? ''} onChange={(e) => setAdminVets((prev) => prev.map((pv) => (pv.id === v.id ? { ...pv, specialty: e.target.value } : pv)))} />
											<label className="text-xs">Especies (separadas por coma)</label>
											<input className="input" value={(v.species || []).join(', ')} onChange={(e) => setAdminVets((prev) => prev.map((pv) => (pv.id === v.id ? { ...pv, species: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : pv)))} />
											<label className="text-xs">Motivos (separados por coma)</label>
											<input className="input" value={(v.reasons || []).join(', ')} onChange={(e) => setAdminVets((prev) => prev.map((pv) => (pv.id === v.id ? { ...pv, reasons: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : pv)))} />
											{vetErrors[v.id] ? <p className="text-xs text-red-600">{vetErrors[v.id]}</p> : null}
											<div className="mt-2 flex justify-end">
												<Button isLoading={savingVetId === v.id} onClick={async () => {
													// validation
													const name = (v.name || '').trim()
													const reasons = v.reasons || []
													if (!name) {
														setVetErrors((prev) => ({ ...prev, [v.id]: 'El nombre es obligatorio' }))
														show({ title: 'Error', description: 'El nombre del veterinario es obligatorio', variant: 'error' })
														return
													}
													if (!reasons.length) {
														setVetErrors((prev) => ({ ...prev, [v.id]: 'Agrega al menos un motivo' }))
														show({ title: 'Error', description: 'Agrega al menos un motivo para este veterinario', variant: 'error' })
														return
													}
													// clear previous error
													setVetErrors((prev) => {
														const c = { ...prev }
														delete c[v.id]
														return c
													})
													try {
														setSavingVetId(v.id)
														const updated = await upsertVet(v as any)
														// refresh appointments context vets list
														await refresh()
														setAdminVets((prev) => prev.map((pv) => (pv.id === updated.id ? updated as Vet : pv)))
														show({ title: 'Guardado', description: `${v.name} actualizado`, variant: 'success' })
													} catch (err) {
														show({ title: 'Error', description: 'No se pudo guardar el veterinario', variant: 'error' })
													} finally {
														setSavingVetId(null)
													}
												}}>Guardar</Button>
											</div>
										</div>
									</div>
								))}
							</div>
						</Modal>
			</div>

			<div id="reserva" className="flex items-start justify-end">
					{user && user.role === 'cliente' ? (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold text-gray-900">Reserva tu hora</h2>
							<p className="text-sm text-gray-600">Elige mascota, veterinario, fecha y horario disponible.</p>
							<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Input placeholder="Tu nombre" value={form.clientName} onChange={(e) => {
			// remove numbers and collapse multiple spaces
			const raw = e.target.value.replace(/[0-9]/g, '')
			const cleaned = raw.replace(/\s{2,}/g, ' ')
			setForm((f) => ({ ...f, clientName: cleaned }))
			// blacklist check
			const lower = cleaned.toLowerCase()
			const bad = BAD_WORDS.find((w) => lower.includes(w))
			setErrors((prev) => ({ ...prev, clientName: bad ? 'Nombre no permitido' : undefined }))
		}} readOnly={user?.role === 'cliente'} error={errors.clientName} />
								<div className="sm:col-span-2">
									<Select 
										label="Mascota" 
										value={form.petId} 
										onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
										error={errors.petId}
									>
										<option value="">Selecciona mascota</option>
										{visiblePets.map((p) => (
											<option key={p.id} value={p.id}>{p.name} ({p.species})</option>
										))}
									</Select>
								</div>
								<Input placeholder="Tu teléfono" label="Teléfono" value={form.clientPhone} maxLength={9} onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value.replace(/\D/g, '').slice(0, 9) }))} />
								<Input type="date" min={dayjs().format('YYYY-MM-DD')} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} label="Fecha" error={errors.date} />
								{/* Single select showing veterinarians + specialty + available slots for selected date */}
								<Select
									label="Disponibilidad veterinarios"
									value={form.vetId && form.slot ? `${form.vetId}||${form.slot}` : ''}
									onChange={(e) => {
										const v = e.target.value
										if (!v) return setForm((f) => ({ ...f, vetId: '', slot: '' }))
										const [vid, s] = v.split('||')
										setForm((f) => ({ ...f, vetId: vid as string, slot: s || '' }))
									}}
									error={errors.vetId || errors.slot}
								>
									<option value="">Selecciona veterinario y horario</option>
									{vets.map((v) => {
										const available = vetSlots[v.id] || []
										const speciesList = ((v as any).species as string[] | undefined) || []
										const speciesText = speciesList.length ? `(${speciesList.join(', ')})` : ''
										if (available.length === 0) {
											return (
												<option key={`${v.id}-none`} value={`${v.id}||`}>
													{`${v.name} — ${((v as any).specialty as string) ?? 'General'} ${speciesText} — Sin horarios`}
												</option>
											)
										}
										return available.map((s) => (
											<option key={`${v.id}-${s}`} value={`${v.id}||${s}`}>
												{`${v.name} — ${((v as any).specialty as string) ?? 'General'} ${speciesText} — ${dayjs(s).local().format('HH:mm')}`}
											</option>
										))
									})}
								</Select>
								<div className="sm:col-span-2">
									<Select
										label="Motivo"
										value={form.reason}
										onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
										error={errors.reason}
									>
										<option value="">Selecciona un motivo</option>
										{
											// prefer motives declared by the selected vet, otherwise show a sensible fallback
											(() => {
												const selectedVet = vets.find((x) => x.id === form.vetId)
												const vetReasons = (selectedVet as any)?.reasons as string[] | undefined
												const fallback = ['Control general', 'Vacunacion', 'Desparasitacion', 'Cirugia menor', 'Consulta por sintomas', 'Otro']
												const list = vetReasons && vetReasons.length > 0 ? vetReasons : fallback
												return list.map((r) => (
													<option key={r} value={r}>{r}</option>
												))
											})()
										}
									</Select>
									</div>
								</div>
								<div className="mt-5 flex items-center justify-end">
								<Button onClick={submit} className="w-full sm:w-auto">Reservar</Button>
							</div>
						</div>
							) : user && user.role === 'recepcionista' ? (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold text-gray-900">Panel Recepcionista</h2>
							<p className="text-sm text-gray-600">Gestiona citas y cliente</p>
							<div className="mt-4 space-y-3">
								<Link to="/recepcion" className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer block">
									<div className="font-medium text-gray-900">📅 Agenda de Citas</div>
									<p className="text-sm text-gray-600">Ver y gestionar citas programadas</p>
								</Link>
								<Link to="/clients" className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer block">
									<div className="font-medium text-gray-900">👥 Clientes</div>
									<p className="text-sm text-gray-600">Gestionar información de clientes</p>
								</Link>
								<Link to="/calls" className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer block">
									<div className="font-medium text-gray-900">📞 Llamadas</div>
									<p className="text-sm text-gray-600">Registrar llamadas y consultas</p>
								</Link>
							</div>
						</div>
					) : user && user.role === 'admin' ? (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold text-gray-900">Panel Administrador</h2>
							<p className="text-sm text-gray-600">Controla todo el sistema</p>
							<div className="mt-4 space-y-3">
								<div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-medium text-gray-900">👥 Usuarios</div>
											<p className="text-sm text-gray-600">Gestionar usuarios y roles</p>
										</div>
									</div>
								</div>
								<div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-medium text-gray-900">🏥 Veterinarios</div>
											<p className="text-sm text-gray-600">Gestionar equipo veterinario</p>
										</div>
										<button className="btn btn-sm btn-outline" onClick={async () => {
											// load vets from fakeApi for admin editing
											const vs = await listVets()
											setAdminVets(vs)
											setEditVetsOpen(true)
										}}>
											Editar veterinarios
										</button>
									</div>
								</div>
								<div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
									<div className="font-medium text-gray-900">📊 Reportes</div>
									<p className="text-sm text-gray-600">Ver estadísticas y reportes</p>
								</div>
							</div>
						</div>
					) : authMode === 'login' ? (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold text-gray-900">Inicia sesión</h2>
							<p className="text-sm text-gray-600">Accede para reservar tu hora</p>
							<form className="mt-4 space-y-4" onSubmit={submitLogin} noValidate>
								{loginGeneralError ? (
									<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
										{loginGeneralError}
									</div>
								) : null}
								<Input
									type="email"
									label="Correo electrónico"
									placeholder="tu@correo.com"
									value={loginEmail}
									onChange={(e) => setLoginEmail(e.target.value)}
									onBlur={() => setLoginErrors((prev) => ({ ...prev, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) ? undefined : 'Ingresa un correo válido' }))}
									error={loginErrors.email}
									hint="Ingresa un correo válido"
									title="Ingresa un correo válido"
								/>
								<Input
									type="password"
									label="Contraseña"
									placeholder="••••••"
									value={loginPassword}
									onChange={(e) => setLoginPassword(e.target.value)}
									onBlur={() => setLoginErrors((prev) => ({ ...prev, password: loginPassword.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : undefined }))}
									error={loginErrors.password}
									hint="Mínimo 6 caracteres"
									title="Mínimo 6 caracteres"
								/>
								<div className="flex items-center justify-between">
									<Button type="button" variant="outline" onClick={() => setAuthMode(null)}>Volver</Button>
									<Button type="submit" isLoading={authLoading}>Ingresar</Button>
								</div>
							</form>
							<p className="mt-3 text-xs text-gray-600">
								¿Aún no tienes cuenta? <button className="text-primary-600 hover:underline" onClick={() => setAuthMode('register')}>Regístrate</button>
							</p>
						</div>
					) : authMode === 'register' ? (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold text-gray-900">Crear cuenta</h2>
							<p className="text-sm text-gray-600">Regístrate para reservar</p>
							<form className="mt-4 space-y-4" onSubmit={submitRegister} autoComplete="off" noValidate>
								<Input label="Nombre completo" placeholder="Ej. Juan Pérez" value={regName} onChange={(e) => {
			const raw = e.target.value.replace(/[0-9]/g, '')
			const cleaned = raw.replace(/\s{2,}/g, ' ')
			setRegName(cleaned)
			const bad = BAD_WORDS.find((w) => cleaned.toLowerCase().includes(w))
			setAuthErrors((prev) => ({ ...prev, name: bad ? 'Nombre no permitido' : undefined }))
		}} error={authErrors.name} autoComplete="off" />
								<Input label="Teléfono" placeholder="Ej. 999111222" value={regPhone} maxLength={9} onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0,9))} error={authErrors.phone} autoComplete="off" />
								<Input type="email" label="Correo" placeholder="tu@correo.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} error={authErrors.email} autoComplete="off" />
								<Input type="password" label="Contraseña" placeholder="••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} error={authErrors.password} autoComplete="new-password" />
								<Input type="password" label="Confirmar contraseña" placeholder="••••••" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} error={authErrors.confirm} autoComplete="new-password" />
								<div className="pt-2 border-t">
									<div className="text-sm font-medium text-gray-700">Datos de la mascota</div>
									<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
										<Select label="Especie" value={regPetSpecies} onChange={(e) => setRegPetSpecies(e.target.value)}>
											<option value="Perro">Perro</option>
											<option value="Gato">Gato</option>
											<option value="Ave">Ave</option>
											<option value="Otro">Otro</option>
										</Select>
										<Input label="Nombre mascota" placeholder="Ej. Firulais" value={regPetName} onChange={(e) => setRegPetName(e.target.value)} error={petErrors.name} />
										<Input label="Edad (años)" placeholder="Ej. 3" value={regPetAge} onChange={(e) => setRegPetAge(e.target.value.replace(/[^0-9]/g, '').slice(0,3))} error={petErrors.age} />
										<Input label="Raza" placeholder="Ej. Labrador" value={regPetBreed} onChange={(e) => setRegPetBreed(e.target.value)} error={petErrors.breed} />
										<Input label="Peso (kg)" placeholder="Ej. 5.2" value={regPetWeight} onChange={(e) => setRegPetWeight(e.target.value.replace(/[^0-9.]/g, ''))} error={petErrors.weight} />
									</div>
								</div>
								<div className="flex items-center justify-between">
									<Button type="button" variant="outline" onClick={() => setAuthMode(null)}>Volver</Button>
									<Button type="submit" isLoading={authLoading}>Registrarme</Button>
								</div>
							</form>
							<p className="mt-3 text-xs text-gray-600">
								¿Ya tienes cuenta? <button className="text-primary-600 hover:underline" onClick={() => setAuthMode('login')}>Inicia sesión</button>
							</p>
						</div>
					) : (
						<div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/20 p-6 text-white shadow-2xl backdrop-blur">
							<h2 className="text-lg font-semibold">Reserva tu hora</h2>
							<p className="text-sm text-white/90">Para reservar debes iniciar sesión o registrarte.</p>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<button onClick={() => setAuthMode('login')} className="btn btn-outline bg-white/10 text-white hover:bg-white/20">Iniciar sesión</button>
								<button onClick={() => setAuthMode('register')} className="btn btn-primary">Registrarme</button>
							</div>
							<div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/80">
								<div className="rounded-lg border border-white/20 p-3">
									<div className="font-medium">Veterinarios</div>
									<div>Elige entre nuestros especialistas</div>
								</div>
								<div className="rounded-lg border border-white/20 p-3">
									<div className="font-medium">Horarios</div>
									<div>Selecciona la fecha y hora disponible</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	)
}


