import dayjs from '../../lib/dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useAppointments } from '../../contexts/AppointmentsContext'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'


export function ClientDashboard() {
	const { user } = useAuth()
	const { appointments, vets, cancel } = useAppointments()
	const myApts = useMemo(() => appointments.filter((a) => a.userId === user?.id), [appointments, user?.id])

	// Clients cannot reschedule in this view; only cancellation is allowed.

	const rows = myApts.map((a: any) => ({
		...a,
		when: dayjs(a.dateTime).utc().format('DD/MM/YYYY HH:mm'),
		vetName: vets.find((v) => v.id === a.vetId)?.name ?? '—',
		statusLabel: String(a.status).toLowerCase()
	}))
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Mis citas</h1>
			<div className="card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr>
								<th className="px-4 py-2 text-left">Fecha</th>
								<th className="px-4 py-2 text-left">Veterinario</th>
								<th className="px-4 py-2 text-left">Estado</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{rows.map((a) => (
								<tr key={a.id} className="border-t">
									<td className="px-4 py-2 whitespace-nowrap">{a.when}</td>
									<td className="px-4 py-2">{a.vetName}</td>
									<td className="px-4 py-2 capitalize">{a.statusLabel}</td>
									<td className="px-4 py-2">
										<div className="flex gap-2">
											<Button variant="outline" onClick={() => cancel(a.id, 'client')}>
												Cancelar
											</Button>
										</div>
									</td>
								</tr>
							))}
							{myApts.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-sm text-gray-600" colSpan={4}>
										No tienes citas registradas. <Link to="/" className="text-primary-600">Reserva aquí</Link>.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</div>


		</div>
	)
}


