import { SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
	label?: string
	hint?: string
	error?: string
}

export function Select({ className, label, hint, error, id, children, ...rest }: Props) {
	const inputId = id || rest.name
	return (
		<div className="space-y-1.5">
			{label ? (
				<label htmlFor={inputId} className="label">
					{label}
				</label>
			) : null}
			<select
				id={inputId}
				className={clsx(
					'w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2',
					error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500',
					className
				)}
				{...rest}
			>
				{children}
			</select>
			{error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
		</div>
	)
}


