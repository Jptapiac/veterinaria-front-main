import { Link } from 'react-router-dom'
import { useAppointments } from '../contexts/AppointmentsContext'
import { useInventory } from '../contexts/InventoryContext'
import { usePets } from '../contexts/PetsContext'
import dayjs from 'dayjs'

export function DashboardPage() {
	const { appointments } = useAppointments()
	const { products } = useInventory()
	const { pets } = usePets()

	const next = appointments.find((a) => dayjs(a.dateISO).isAfter(dayjs()))

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<CardStat title="Citas próximas" value={appointments.filter((a) => dayjs(a.dateISO).isAfter(dayjs())).length} />
				<CardStat title="Mascotas" value={pets.length} />
				<CardStat title="Productos" value={products.length} />
				<CardStat title="Stock bajo" value={products.filter((p) => p.stock <= 2).length} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="card p-5">
					<h2 className="text-lg font-semibold mb-3">Siguiente cita</h2>
					{next ? (
						<div className="text-sm text-gray-700">
							<div className="mb-1">Fecha: {dayjs(next.dateISO).format('DD/MM/YYYY HH:mm')}</div>
							<div className="mb-3">Estado: {next.status}</div>
							<Link to="/citas" className="btn btn-primary">
								Ver agenda
							</Link>
						</div>
					) : (
						<p className="text-sm text-gray-600">No hay citas próximas.</p>
					)}
				</div>
				<div className="card p-5">
					<h2 className="text-lg font-semibold mb-3">Gestión rápida</h2>
					<div className="flex flex-wrap gap-2">
						<Link to="/citas" className="btn btn-outline">
							Agendar cita
						</Link>
						<Link to="/mascotas" className="btn btn-outline">
							Registrar mascota
						</Link>
						<Link to="/inventario" className="btn btn-outline">
							Venta/Reserva
						</Link>
					</div>
				</div>
				<div className="card p-5">
					<h2 className="text-lg font-semibold mb-3">Alertas</h2>
					<ul className="text-sm text-gray-700 list-disc pl-4 space-y-1">
						{products
							.filter((p) => p.stock === 0)
							.slice(0, 4)
							.map((p) => (
								<li key={p.id}>
									<span className="font-medium">{p.name}</span> sin stock
								</li>
							))}
						{products.filter((p) => p.stock === 0).length === 0 ? <li>Sin alertas</li> : null}
					</ul>
				</div>
			</div>
		</div>
	)
}

function CardStat({ title, value }: { title: string; value: number }) {
	return (
		<div className="card p-5">
			<div className="text-sm text-gray-600">{title}</div>
			<div className="mt-1 text-2xl font-semibold">{value}</div>
		</div>
	)
}


