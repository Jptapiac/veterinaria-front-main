import { ReactNode } from 'react'
import { clsx } from 'clsx'

type Props = {
	children: ReactNode
	variant?: 'gray' | 'green' | 'red' | 'blue' | 'yellow'
}

export function Badge({ children, variant = 'gray' }: Props) {
	const variants = {
		gray: 'bg-gray-100 text-gray-800',
		green: 'bg-green-100 text-green-800',
		red: 'bg-red-100 text-red-800',
		blue: 'bg-blue-100 text-blue-800',
		yellow: 'bg-yellow-100 text-yellow-800'
	}
	return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant])}>{children}</span>
}


