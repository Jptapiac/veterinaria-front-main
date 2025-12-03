import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

type Props = {
	title?: string
	open: boolean
	onClose: () => void
	children: ReactNode
	footer?: ReactNode
	maxWidth?: 'sm' | 'md' | 'lg'
}

export function Modal({ title, open, onClose, children, footer, maxWidth = 'md' }: Props) {
	if (!open) return null
	const max = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }[maxWidth]
	return createPortal(
		<div className="fixed inset-0 z-50 grid place-items-center p-4">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className={`relative w-full ${max} rounded-2xl bg-white shadow-soft`}>
				<div className="flex items-center justify-between border-b px-5 py-3">
					<h3 className="font-semibold">{title}</h3>
					<Button variant="ghost" onClick={onClose}>
						✕
					</Button>
				</div>
				<div className="px-5 py-4">{children}</div>
				{footer ? <div className="border-t px-5 py-3">{footer}</div> : null}
			</div>
		</div>,
		document.body
	)
}


