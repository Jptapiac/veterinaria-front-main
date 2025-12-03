import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'outline' | 'ghost' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	isLoading?: boolean
}

export function Button({ className, children, variant = 'primary', size = 'md', isLoading, ...rest }: ButtonProps) {
	const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
	const variants = {
		primary: 'bg-primary-600 text-white hover:bg-primary-700',
		outline: 'border border-gray-300 bg-white hover:bg-gray-50',
		ghost: 'hover:bg-gray-100',
		danger: 'bg-red-600 text-white hover:bg-red-700'
	}
	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-3 text-base'
	}
	return (
		<button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
			{isLoading ? '...' : children}
		</button>
	)
}


