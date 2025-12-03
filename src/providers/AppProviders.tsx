import { ReactNode } from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import { AppointmentsProvider } from '../contexts/AppointmentsContext'
import { PetsManagementProvider } from '../contexts/PetsManagementContext'
import { ToastContainer } from '../components/ui/Toast'

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ToastProvider>
				<PetsManagementProvider>
					<AppointmentsProvider>
						{children}
						<ToastContainer />
					</AppointmentsProvider>
				</PetsManagementProvider>
			</ToastProvider>
		</AuthProvider>
	)
}


