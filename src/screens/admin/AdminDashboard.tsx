import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAuth } from '../../contexts/AuthContext'
import { useAppointments } from '../../contexts/AppointmentsContext'

export function AdminDashboard() {
	const { user } = useAuth()
	const { appointments } = useAppointments()

	const upcoming = appointments.filter((a: any) => dayjs(a.dateTime).isAfter(dayjs()))
	const today = appointments.filter((a: any) => dayjs(a.dateTime).isSame(dayjs(), 'day'))

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white">
				<div className="absolute inset-0 opacity-20"
					style={{ backgroundImage: 'radial-gradient(circle at 20% 10%, #fff, transparent 35%), radial-gradient(circle at 80% 50%, #fff, transparent 40%)' }} />
				<div className="relative p-6 sm:p-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<div className="text-xs uppercase tracking-wider opacity-90">Veterinaria Pochita S.A.</div>
							<h1 className="mt-1 text-2xl sm:text-3xl font-semibold">Panel de Administración</h1>
							<p className="mt-1 text-white/90">Gestiona las operaciones de la veterinaria desde aquí</p>
						</div>
						<div className="bg-white/15 backdrop-blur rounded-xl p-4 min-w-[260px]">
							<div className="text-sm opacity-90">Usuario</div>
							<div className="mt-1 font-medium">{user?.name}</div>
							<div className="text-sm opacity-90">{user?.email}</div>
							<div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs">
								Rol: <span className="font-medium capitalize">{user?.role}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* KPIs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<KpiCard label="Citas de hoy" value={today.length} icon="📅" />
				<KpiCard label="Citas próximas" value={upcoming.length} icon="⏱️" />
			</div>

			{/* Quick actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
				<NavTile
					to="/recepcion"
					title="Gestión de Citas"
					desc="Revisar, reprogramar y cancelar citas"
					icon="📆"
					color="from-blue-500 to-indigo-500"
				/>
			</div>
		</div>
	)
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon: string }) {
	return (
		<div className="card p-5">
			<div className="flex items-center gap-3">
				<div className="text-2xl">{icon}</div>
				<div>
					<div className="text-sm text-gray-600">{label}</div>
					<div className="text-2xl font-semibold">{value}</div>
				</div>
			</div>
		</div>
	)
}

function NavTile({
	to,
	title,
	desc,
	icon,
	color
}: {
	to: string
	title: string
	desc: string
	icon: string
	color: string
}) {
	return (
		<Link
			to={to}
			className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition-all hover:shadow-md"
		>
			<div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl`} />
			<div className="relative flex items-start gap-3">
				<div className="text-2xl">{icon}</div>
				<div>
					<div className="font-semibold">{title}</div>
					<p className="text-sm text-gray-600">{desc}</p>
				</div>
			</div>
		</Link>
	)
}


