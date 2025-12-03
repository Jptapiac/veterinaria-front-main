import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../contexts/ToastContext'

export function RegisterPage() {
	const { registerClient } = useAuth()
	const { show } = useToast()
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; password?: string; confirmPassword?: string }>({})
	const [generalError, setGeneralError] = useState<string | null>(null)

	function validate(): boolean {
		const e: typeof errors = {}
		if (name.trim().length < 2) e.name = 'Ingresa tu nombre completo'
		if (!/^[0-9+()\-\s]{6,}$/.test(phone)) e.phone = 'Ingresa un teléfono válido'
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un correo válido'
		if (password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres'
		if (confirmPassword !== password) e.confirmPassword = 'Las contraseñas no coinciden'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	function validateOne(field: keyof typeof errors) {
		const e: typeof errors = { ...errors }
		if (field === 'name') e.name = name.trim().length < 2 ? 'Ingresa tu nombre completo' : undefined
		if (field === 'phone') e.phone = /^[0-9+()\-\s]{6,}$/.test(phone) ? undefined : 'Ingresa un teléfono válido'
		if (field === 'email') e.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : 'Ingresa un correo válido'
		if (field === 'password') e.password = password.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : undefined
		if (field === 'confirmPassword') e.confirmPassword = confirmPassword !== password ? 'Las contraseñas no coinciden' : undefined
		setErrors(e)
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		if (!validate()) return
		try {
			setLoading(true)
			setGeneralError(null)
			await registerClient({ name, email, password, phone })
			show({ title: 'Registro exitoso', variant: 'success' })
			navigate('/cliente', { replace: true })
		} catch (err: any) {
			let msg = 'No se pudo registrar'
			if (typeof err?.message === 'string') {
				try {
					const parsed = JSON.parse(err.message)
					msg = parsed?.error ?? msg
				} catch {
					msg = err.message
				}
			}
			setGeneralError(msg)
			show({ title: 'Error en registro', description: msg, variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<div className="relative mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl place-items-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-soft">
					<div className="rounded-t-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5 text-white">
						<div className="text-sm opacity-90">Únete a Pochita</div>
						<h1 className="text-xl font-semibold">Crear cuenta</h1>
					</div>
					<div className="px-6 py-6">
						<form className="space-y-4" onSubmit={submit} autoComplete="off" noValidate>
							{generalError ? (
								<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
									{generalError}
								</div>
							) : null}
							<Input label="Nombre completo" placeholder="Ej. Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => validateOne('name')} error={errors.name} autoComplete="off" hint="Tu nombre y apellido" title="Tu nombre y apellido" />
							<Input label="Teléfono" placeholder="Ej. 999-111-222" value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={() => validateOne('phone')} error={errors.phone} autoComplete="off" hint="Mínimo 6 dígitos; se permiten + ( ) -" title="Mínimo 6 dígitos; se permiten + ( ) -" />
							<Input type="email" label="Correo" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => validateOne('email')} error={errors.email} autoComplete="off" hint="Debe ser un correo válido" title="Debe ser un correo válido" />
							<Input type="password" label="Contraseña" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => validateOne('password')} error={errors.password} autoComplete="new-password" hint="Mínimo 6 caracteres" title="Mínimo 6 caracteres" />
							<Input type="password" label="Confirmar contraseña" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => validateOne('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" hint="Debe coincidir con la contraseña" title="Debe coincidir con la contraseña" />
							<Button type="submit" isLoading={loading} className="w-full">
								Registrarme
							</Button>
						</form>
						<p className="mt-4 text-center text-sm text-gray-600">
							¿Ya tienes cuenta?{' '}
							<Link to="/login" className="text-primary-600 hover:underline">
								Ingresa
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}


