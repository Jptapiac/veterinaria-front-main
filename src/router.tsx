import { Route, Routes, Navigate } from 'react-router-dom'
import { AppointmentsPage } from './screens/appointments/AppointmentsPage'
import { LoginPage } from './screens/auth/LoginPage'
import { RegisterPage } from './screens/auth/RegisterPage'
import { LandingPage } from './screens/public/LandingPage'
import { ClientDashboard } from './screens/client/ClientDashboard'
import { ClientsPage } from './screens/client/ClientsPage'
import { CallsPage } from './screens/client/CallsPage'
import { VetDashboard } from './screens/vet/VetDashboard'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { UsersPage } from './screens/admin/UsersPage'

export function AppRouter() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />

			<Route
				path="/cliente"
				element={
					<ProtectedRoute roles={['cliente']}>
						<ClientDashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/clients"
				element={
					<ProtectedRoute roles={["recepcionista", "admin"]}>
						<ClientsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/calls"
				element={
					<ProtectedRoute roles={["recepcionista", "admin"]}>
						<CallsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/recepcion"
				element={
					<ProtectedRoute roles={['recepcionista', 'admin']}>
						<AppointmentsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/vet"
				element={
					<ProtectedRoute roles={['veterinario', 'admin']}>
						<VetDashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/admin"
				element={
					<ProtectedRoute roles={['admin']}>
						<UsersPage />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}


