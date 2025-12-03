import { useEffect, useState } from 'react'
import dayjs from '../../lib/dayjs'
import { listCalls, createCall, deleteCall } from '../../services/fakeApi'

type CallRecord = { id: string; name?: string; phone?: string; notes?: string; at: string }

export function CallsPage() {
	const [calls, setCalls] = useState<CallRecord[]>([])
	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [notes, setNotes] = useState('')

	useEffect(() => {
		let mounted = true
		listCalls().then((c) => { if (mounted) setCalls(c as any) })
		return () => { mounted = false }
	}, [])

	async function addCall() {
		const rec = await createCall({ name: name || undefined, phone: phone || undefined, notes: notes || undefined })
		setCalls((s) => [rec as any, ...s])
		setName('')
		setPhone('')
		setNotes('')
	}

	async function remove(id: string) {
		await deleteCall(id)
		setCalls((s) => s.filter((c) => c.id !== id))
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Registro de llamadas</h1>
			<div className="card p-4">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
					<input className="input" placeholder="Nombre cliente" value={name} onChange={(e) => setName(e.target.value)} />
					<input className="input" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\- ]/g, ''))} />
					<input className="input" placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
				</div>
				<div className="mt-3 flex justify-end">
					<button className="btn btn-primary" onClick={addCall}>Agregar llamada</button>
				</div>
			</div>

			<div className="card overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-700">
							<tr>
								<th className="px-4 py-2 text-left">Fecha</th>
								<th className="px-4 py-2 text-left">Nombre</th>
								<th className="px-4 py-2 text-left">Teléfono</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{calls.map((c) => (
								<tr key={c.id} className="border-t">
									<td className="px-4 py-2">{dayjs(c.at).format('DD/MM/YYYY HH:mm')}</td>
									<td className="px-4 py-2">{c.name ?? '—'}</td>
									<td className="px-4 py-2">{c.phone ?? '—'}</td>
									<td className="px-4 py-2"><button className="btn btn-outline" onClick={() => remove(c.id)}>Eliminar</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
