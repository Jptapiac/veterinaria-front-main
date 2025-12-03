import { ReactNode, createContext, useContext, useMemo, useState } from 'react'

type Toast = {
	id: string
	title: string
	description?: string
	variant?: 'info' | 'success' | 'error'
}

type ToastContextValue = {
	toasts: Toast[]
	show: (t: Omit<Toast, 'id'>) => void
	dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])
	const value = useMemo<ToastContextValue>(
		() => ({
			toasts,
			show: (t) => {
				const id =
					typeof crypto !== 'undefined' && 'randomUUID' in crypto
						? crypto.randomUUID()
						: Math.random().toString(36).slice(2)
				const toast = { id, ...t }
				setToasts((prev) => [...prev, toast])
				setTimeout(() => {
					setToasts((prev) => prev.filter((x) => x.id !== toast.id))
				}, 3500)
			},
			dismiss: (id) => setToasts((prev) => prev.filter((t) => t.id !== id))
		}),
		[toasts]
	)
	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) throw new Error('useToast must be used within ToastProvider')
	return ctx
}


