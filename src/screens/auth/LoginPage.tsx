import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../contexts/ToastContext'

export function LoginPage() {
	const { login, user } = useAuth()
	const { show } = useToast()
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
	const [generalError, setGeneralError] = useState<string | null>(null)

	function validate(): boolean {
		const e: typeof errors = {}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un correo válido'
		if (password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	function validateOne(field: keyof typeof errors) {
		const e: typeof errors = { ...errors }
		if (field === 'email') e.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : 'Ingresa un correo válido'
		if (field === 'password') e.password = password.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : undefined
		setErrors(e)
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!validate()) return
		try {
			setLoading(true)
			setGeneralError(null)
			await login(email, password)
			show({ title: 'Bienvenido', variant: 'success' })
			navigate('/', { replace: true })
		} catch (err: any) {
			let msg = 'Credenciales inválidas'
			if (typeof err?.message === 'string') {
				try {
					const parsed = JSON.parse(err.message)
					msg = parsed?.error ?? msg
				} catch {
					msg = err.message || msg
				}
			}
			setGeneralError(msg)
			show({ title: 'No se pudo iniciar sesión', description: msg, variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<div className="relative mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl place-items-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-soft">
					<div className="rounded-t-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5 text-white">
						<div className="text-sm opacity-90">Bienvenido</div>
						<h1 className="text-xl font-semibold">Inicia sesión</h1>
					</div>
					<div className="px-6 py-6">
						<form className="space-y-4" onSubmit={submit} noValidate>
							{generalError ? (
								<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
									{generalError}
								</div>
							) : null}
							<Input type="email" label="Correo electrónico" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateOne('email')} error={errors.email} hint="Ingresa un correo válido" title="Ingresa un correo válido" />
							<Input type="password" label="Contraseña" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validateOne('password')} error={errors.password} hint="Mínimo 6 caracteres" title="Mínimo 6 caracteres" />
							<Button type="submit" isLoading={loading} className="w-full">
								Ingresar
							</Button>
						</form>
						<p className="mt-4 text-center text-sm text-gray-600">
							¿No tienes cuenta?{' '}
							<Link to="/register" className="text-primary-600 hover:underline">
								Regístrate
							</Link>
						</p>
						<div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
							<div className="font-semibold mb-2">Cuentas demo</div>
							<div className="grid grid-cols-2 gap-2">
								<div className="rounded-lg border border-gray-200 p-2">Cliente: cliente@pochita.com / 123456</div>
								<div className="rounded-lg border border-gray-200 p-2">Recepción: recepcion@pochita.com / 123456</div>
								<div className="rounded-lg border border-gray-200 p-2">Veterinario: vet@pochita.com / 123456</div>
								<div className="rounded-lg border border-gray-200 p-2">Admin: admin@pochita.com / 123456</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}


