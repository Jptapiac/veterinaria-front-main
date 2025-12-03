import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { useAppointments } from '../../contexts/AppointmentsContext'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'

export function VetDashboard() {
	const { appointments, cancel } = useAppointments()
	const { user } = useAuth()
	const todays = appointments.filter((a: any) => a.vetId && dayjs(a.dateTime).isSame(dayjs(), 'day'))
	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Citas de hoy</h1>
			<div className="card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr>
								<th className="px-4 py-2 text-left">Hora</th>
								<th className="px-4 py-2 text-left">Estado</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{todays
								.map((a) => (
									<tr key={a.id} className="border-t">
										<td className="px-4 py-2">{dayjs((a as any).dateTime).format('HH:mm')}</td>
										<td className="px-4 py-2 capitalize">{(a as any).status.toLowerCase()}</td>
										<td className="px-4 py-2">
											<div className="flex gap-2">
												<Link to={`/visita/${a.id}`} className="btn btn-primary">Atender</Link>
												<Button variant="outline" onClick={() => cancel(a.id as any, 'vet')}>Cancelar (Vet)</Button>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}


