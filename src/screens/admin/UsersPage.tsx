import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../contexts/ToastContext'
import { api } from '../../services/backendApi'
import { Modal } from '../../components/ui/Modal'

type UserRow = { id: string; name: string; email: string; role: 'CLIENTE' | 'RECEPCIONISTA' | 'VETERINARIO' | 'ADMIN'; phone?: string; createdAt?: string; active?: boolean }

export function UsersPage() {
	const { show } = useToast()
	const [list, setList] = useState<UserRow[]>([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENTE' as UserRow['role'] })
	const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; role?: string }>({})
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [confirmUser, setConfirmUser] = useState<UserRow | null>(null)
	const [confirmNext, setConfirmNext] = useState<boolean>(true)

	async function refresh() {
		setLoading(true)
		try {
			const users = await api.adminListUsers()
			setList(users)
		} catch (err: any) {
			const msg = typeof err?.message === 'string' ? err.message : 'No se pudo cargar la lista de usuarios'
			show({ title: 'Error', description: msg, variant: 'error' })
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		refresh()
	}, [])

	function validate(): boolean {
		const e: typeof errors = {}
		if (form.name.trim().length < 2) e.name = 'Ingresa un nombre válido'
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
		if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
		if (!form.role) e.role = 'Selecciona un rol'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	async function createUser() {
		if (!validate()) return
		setLoading(true)
		try {
			await api.adminCreateUser({ ...form })
			show({ title: 'Usuario creado', variant: 'success' })
			setForm({ name: '', email: '', password: '', phone: '', role: 'CLIENTE' })
			await refresh()
		} catch (err: any) {
			const msg = typeof err?.message === 'string' ? err.message : 'No se pudo crear el usuario'
			show({ title: 'Error', description: msg, variant: 'error' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Usuarios</h1>
			<div className="card p-5">
				<h2 className="font-semibold mb-3">Crear usuario</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<Input label="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
					<Input label="Correo" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
					<Input label="Teléfono" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
					<Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} />
					<Select label="Rol" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))} error={errors.role}>
						<option value="CLIENTE">Cliente</option>
						<option value="RECEPCIONISTA">Recepcionista</option>
						<option value="VETERINARIO">Veterinario</option>
						<option value="ADMIN">Admin</option>
					</Select>
					<div className="flex items-end">
						<Button onClick={createUser} isLoading={loading}>Crear</Button>
					</div>
				</div>
			</div>

			<div className="card p-5">
				<h2 className="font-semibold mb-3">Lista</h2>
				{loading ? <p className="text-sm text-gray-600">Cargando...</p> : null}
				{!loading && list.length === 0 ? (
					<p className="text-sm text-gray-600">No hay usuarios registrados.</p>
				) : null}
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left">Nombre</th>
								<th className="px-4 py-2 text-left">Correo</th>
								<th className="px-4 py-2 text-left">Rol</th>
								<th className="px-4 py-2 text-left">Estado</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{list.map((u) => (
								<tr key={u.id} className="border-t">
									<td className="px-4 py-2">{u.name}</td>
									<td className="px-4 py-2">{u.email}</td>
									<td className="px-4 py-2">{u.role}</td>
									<td className="px-4 py-2">{u.active ? 'Activo' : 'Inactivo'}</td>
									<td className="px-4 py-2">
										<Button
											variant="outline"
											onClick={() => {
												setConfirmUser(u)
												setConfirmNext(!u.active)
												setConfirmOpen(true)
											}}
										>
											{u.active ? 'Desactivar' : 'Activar'}
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Modal
				title={confirmNext ? 'Activar usuario' : 'Desactivar usuario'}
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				footer={
					<div className="flex items-center justify-end gap-2">
						<Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
						<Button
							onClick={async () => {
								if (!confirmUser) return
								try {
									await api.adminSetUserActive(confirmUser.id, confirmNext)
									show({ title: confirmNext ? 'Usuario activado' : 'Usuario desactivado', variant: 'success' })
									setConfirmOpen(false)
									refresh()
								} catch (err: any) {
									show({ title: 'Error', description: err?.message || 'No se pudo actualizar', variant: 'error' })
								}
							}}
						>
							Confirmar
						</Button>
					</div>
				}
			>
				<p className="text-sm text-gray-700">
					¿Seguro que deseas {confirmNext ? 'activar' : 'desactivar'} al usuario{' '}
					<span className="font-medium">{confirmUser?.name}</span> ({confirmUser?.email})?
				</p>
			</Modal>
		</div>
	)
}


