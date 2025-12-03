import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAppointments } from '../../contexts/AppointmentsContext'
import { usePets } from '../../contexts/PetsContext'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { createFollowUps, createTreatment, listFollowUps, listTreatmentsByAppointment } from '../../services/fakeApi'
import type { ProcedureType } from '../../types'

export function VisitPage() {
	const { appointmentId } = useParams()
	const { appointments, vets } = useAppointments()
	const { pets, clients } = usePets()
	const apt = useMemo(() => appointments.find((a) => a.id === appointmentId), [appointments, appointmentId])
	const [procedure, setProcedure] = useState<ProcedureType>('Vacunación')
	const [cost, setCost] = useState(0)
	const [approved, setApproved] = useState(false)
	const [notes, setNotes] = useState('')
	const [treatments, setTreatments] = useState<any[]>([])
	const [followUps, setFollowUps] = useState<any[]>([])

	useEffect(() => {
		async function load() {
			if (!apt) return
			setTreatments(await listTreatmentsByAppointment(apt.id))
		}
		load()
	}, [apt])

	async function saveTreatment() {
		if (!apt) return
		const t = await createTreatment({
			appointmentId: apt.id,
			procedure,
			approvedByOwner: approved,
			additionalCost: cost || undefined,
			notes
		})
		setTreatments((prev) => [...prev, t])
		// if surgery, schedule 3 follow-ups
		if (procedure === 'Cirugía menor') {
			const dates = [1, 7, 14].map((d) => dayjs(apt.dateISO).add(d, 'day').hour(10).minute(0).second(0).toISOString())
			const f = await createFollowUps(t.id, dates)
			setFollowUps(f)
		}
		setProcedure('Vacunación')
		setCost(0)
		setApproved(false)
		setNotes('')
	}

	useEffect(() => {
		async function loadF() {
			if (treatments.length > 0) {
				const last = treatments[treatments.length - 1]
				setFollowUps(await listFollowUps(last.id))
			}
		}
		loadF()
	}, [treatments])

	if (!apt) return <p className="text-sm text-gray-600">Cita no encontrada.</p>
	const pet = pets.find((p) => p.id === apt.petId)
	const client = clients.find((c) => c.id === apt.clientId)
	const vet = vets.find((v) => v.id === apt.vetId)

	return (
		<div className="space-y-6">
			<div className="card p-5">
				<h1 className="text-lg font-semibold mb-2">Atención de la cita</h1>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
					<div>
						<div className="text-gray-500">Fecha</div>
						<div className="font-medium">{dayjs(apt.dateISO).format('DD/MM/YYYY HH:mm')}</div>
					</div>
					<div>
						<div className="text-gray-500">Mascota</div>
						<div className="font-medium">{pet?.name}</div>
					</div>
					<div>
						<div className="text-gray-500">Dueño</div>
						<div className="font-medium">
							{client?.name} ({client?.phone})
						</div>
					</div>
					<div>
						<div className="text-gray-500">Veterinario</div>
						<div className="font-medium">{vet?.name}</div>
					</div>
					<div className="sm:col-span-2">
						<div className="text-gray-500">Motivo</div>
						<div className="font-medium">{apt.reason}</div>
					</div>
				</div>
			</div>

			<div className="card p-5">
				<h2 className="text-lg font-semibold mb-3">Procedimiento</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Select label="Procedimiento" value={procedure} onChange={(e) => setProcedure(e.target.value as ProcedureType)}>
						<option>Vacunación</option>
						<option>Desparasitación</option>
						<option>Cirugía menor</option>
					</Select>
					<Input
						label="Costo adicional (S/.)"
						type="number"
						value={cost}
						onChange={(e) => setCost(parseFloat(e.target.value))}
					/>
					<div className="space-y-2">
						<label className="label">Aprobado por el dueño</label>
						<button
							type="button"
							className={`px-4 py-2 rounded-lg text-sm border ${approved ? 'bg-green-100 border-green-300' : 'bg-white'}`}
							onClick={() => setApproved((v) => !v)}
						>
							{approved ? 'Aprobado ✅' : 'Pendiente de aprobación'}
						</button>
					</div>
				</div>
				<div className="mt-4">
					<Input
						label="Indicaciones del tratamiento"
						placeholder="Escribe las indicaciones para la ficha e instructivo al dueño..."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>
				<div className="mt-4 flex justify-end">
					<Button onClick={saveTreatment}>Registrar procedimiento</Button>
				</div>
			</div>

			{treatments.length > 0 ? (
				<div className="card p-5">
					<h2 className="text-lg font-semibold mb-3">Tratamientos registrados</h2>
					<ul className="text-sm space-y-2">
						{treatments.map((t) => (
							<li key={t.id} className="border rounded-lg p-3">
								<div className="font-medium">{t.procedure}</div>
								<div className="text-gray-600">{t.notes}</div>
							</li>
						))}
					</ul>
				</div>
			) : null}

			{followUps.length > 0 ? (
				<div className="card p-5">
					<h2 className="text-lg font-semibold mb-3">Calendario de revisiones</h2>
					<ul className="text-sm space-y-2">
						{followUps.map((f) => (
							<li key={f.id} className="border rounded-lg p-3 flex items-center justify-between">
								<div>{dayjs(f.dateISO).format('DD/MM/YYYY HH:mm')}</div>
								<div className="text-gray-600">{f.completed ? 'Completada' : 'Pendiente'}</div>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	)
}


