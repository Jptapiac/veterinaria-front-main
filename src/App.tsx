import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './router'
import { TopNav } from './components/layout/TopNav'

export default function App() {
	return (
		<AppProviders>
			<div className="min-h-dvh flex flex-col">
				<TopNav />
				<main className="container mx-auto max-w-6xl w-full px-4 sm:px-6 py-6">
					<AppRouter />
				</main>
			</div>
		</AppProviders>
	)
}


