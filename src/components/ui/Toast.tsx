import { useToast } from '../../contexts/ToastContext'

export function ToastContainer() {
	const { toasts, dismiss } = useToast()
	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={`rounded-lg border bg-white px-4 py-3 shadow-soft ${
						t.variant === 'error' ? 'border-red-200' : t.variant === 'success' ? 'border-green-200' : 'border-gray-200'
					}`}
				>
					<div className="flex items-start gap-3">
						<div className="mt-0.5 text-xl">{t.variant === 'error' ? '⛔' : t.variant === 'success' ? '✅' : 'ℹ️'}</div>
						<div className="text-sm">
							<div className="font-semibold">{t.title}</div>
							{t.description ? <div className="text-gray-600">{t.description}</div> : null}
						</div>
						<button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => dismiss(t.id)}>
							✕
						</button>
					</div>
				</div>
			))}
		</div>
	)
}


