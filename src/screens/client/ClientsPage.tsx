import { useEffect, useState } from 'react'
import { listClients, upsertClient } from '../../services/fakeApi'
import type { User } from '../../types'
import dayjs from '../../lib/dayjs'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ClientsPage() {
	const [clients, setClients] = useState<User[]>([])
	const [search, setSearch] = useState('')
	const [editing, setEditing] = useState<User | null>(null)
	const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })

	useEffect(() => {
		let mounted = true
		listClients().then((c) => {
			if (mounted) setClients(c as any)
		})
		return () => {
			mounted = false
		}
	}, [])

	function refresh() {
		listClients().then((c) => setClients(c as any))
	}

	function openEdit(u: User) {
		setEditing(u)
		setEditForm({ name: u.name, phone: u.phone ?? '', email: u.email ?? '' })
	}

	async function saveEdit() {
		if (!editing) return
		const updated = await upsertClient({ id: editing.id, name: editForm.name, phone: editForm.phone, email: editForm.email } as any)
		setEditing(null)
		refresh()
	}

	const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? '').toLowerCase().includes(search.toLowerCase()) || (c.phone ?? '').includes(search))

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Clientes</h1>
			<div className="card p-4">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
					<Input placeholder="Buscar por nombre, email o teléfono" value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
			</div>
			<div className="card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr>
								<th className="px-4 py-2 text-left">Nombre</th>
								<th className="px-4 py-2 text-left">Teléfono</th>
								<th className="px-4 py-2 text-left">Email</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((c) => (
								<tr key={c.id} className="border-t">
									<td className="px-4 py-2">{c.name}</td>
									<td className="px-4 py-2">{c.phone ?? '—'}</td>
									<td className="px-4 py-2">{c.email ?? '—'}</td>
									<td className="px-4 py-2">
										<div className="flex gap-2">
											<Button variant="outline" onClick={() => openEdit(c)}>Editar</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<Modal title="Editar cliente" open={!!editing} onClose={() => setEditing(null)} footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={saveEdit}>Guardar</Button></div>}>
				<div className="grid grid-cols-1 gap-2">
					<Input label="Nombre" value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} />
					<Input label="Teléfono" value={editForm.phone} onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))} />
					<Input label="Email" value={editForm.email} onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))} />
				</div>
			</Modal>
		</div>
	)
}
