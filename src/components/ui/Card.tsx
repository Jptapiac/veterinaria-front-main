import { ReactNode } from 'react'
import { clsx } from 'clsx'

type Props = {
	className?: string
	children: ReactNode
}

export function Card({ className, children }: Props) {
	return <div className={clsx('card', className)}>{children}</div>
}


