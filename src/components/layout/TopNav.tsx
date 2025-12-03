import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

function Links() {
	const { user } = useAuth()
	if (!user) {
		return null
	}
	if (user.role === 'cliente') {
		return (
			<>
				<NavLink to="/cliente" className={({ isActive }) => navCls(isActive)}>
					Mis citas
				</NavLink>
			</>
		)
	}
	if (user.role === 'recepcionista') {
		return (
			<>
				<NavLink to="/recepcion" className={({ isActive }) => navCls(isActive)}>
					Agenda
				</NavLink>
			</>
		)
	}
	if (user.role === 'veterinario') {
		return (
			<>
				<NavLink to="/vet" className={({ isActive }) => navCls(isActive)}>
					Mis atenciones
				</NavLink>
			</>
		)
	}
	// admin: Agenda y Usuarios
	return (
		<>
			<NavLink to="/recepcion" className={({ isActive }) => navCls(isActive)}>Agenda</NavLink>
			<NavLink to="/admin" className={({ isActive }) => navCls(isActive)}>Usuarios</NavLink>
		</>
	)
}

function navCls(isActive: boolean) {
	return `px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`
}

export function TopNav() {
	const { pathname } = useLocation()
	const { show } = useToast()
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
			<div className="container mx-auto max-w-6xl flex h-16 items-center px-4 sm:px-6">
				<Link to="/" className="mr-6 flex items-center gap-2">
					<div className="h-8 w-8 rounded-lg bg-primary-600 text-white grid place-items-center font-bold">P</div>
					<span className="font-semibold text-gray-900">Pochita S.A.</span>
				</Link>
				<nav className="flex items-center gap-2 text-sm">
					<Links />
				</nav>
				<div className="ml-auto">
					{user ? (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-700">{user.name} ({user.role})</span>
							<button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>
								Salir
							</button>
						</div>
					) : null}
				</div>
			</div>
		</header>
	)
}


