import { useMemo, useState } from 'react'
import { usePetsManagement } from '../../contexts/PetsManagementContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../contexts/ToastContext'

export function PetsPage() {
	const { pets, createPet } = usePetsManagement()
	const { show } = useToast()
	const [petForm, setPetForm] = useState({ name: '', species: 'Perro', breed: '', age: '', weight: '', color: '', microchip: '' })
	const [errors, setErrors] = useState<{ name?: string; species?: string }>({})

	function validatePet(): boolean {
		const e: typeof errors = {}
		if (!petForm.name.trim()) e.name = 'Nombre requerido'
		if (!petForm.species) e.species = 'Especie requerida'
		setErrors(e)
		return Object.keys(e).length === 0
	}

	async function handleSavePet() {
		if (!validatePet()) return
		try {
			await createPet({
				name: petForm.name,
				species: petForm.species,
				breed: petForm.breed || undefined,
				age: petForm.age ? parseInt(petForm.age) : undefined,
				weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
				color: petForm.color || undefined,
				microchip: petForm.microchip || undefined
			})
			setPetForm({ name: '', species: 'Perro', breed: '', age: '', weight: '', color: '', microchip: '' })
		} catch {
			// Error ya manejado por el context
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Mis Mascotas</h1>
			<div className="card p-5">
				<h2 className="font-semibold mb-3">Registrar nueva mascota</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<Input 
						label="Nombre" 
						placeholder="Nombre de la mascota" 
						value={petForm.name} 
						onChange={(e) => setPetForm((f) => ({ ...f, name: e.target.value }))}
						error={errors.name}
					/>
					<Select 
						label="Especie" 
						value={petForm.species} 
						onChange={(e) => setPetForm((f) => ({ ...f, species: e.target.value }))}
						error={errors.species}
					>
						<option>Perro</option>
						<option>Gato</option>
						<option>Conejo</option>
						<option>Ave</option>
						<option>Otro</option>
					</Select>
					<Input 
						label="Raza" 
						placeholder="Raza" 
						value={petForm.breed} 
						onChange={(e) => setPetForm((f) => ({ ...f, breed: e.target.value }))}
					/>
					<Input 
						label="Edad (años)" 
						type="number" 
						placeholder="Edad" 
						value={petForm.age} 
						onChange={(e) => setPetForm((f) => ({ ...f, age: e.target.value }))}
					/>
					<Input 
						label="Peso (kg)" 
						type="number" 
						placeholder="Peso" 
						value={petForm.weight} 
						onChange={(e) => setPetForm((f) => ({ ...f, weight: e.target.value }))}
					/>
					<Input 
						label="Color" 
						placeholder="Color" 
						value={petForm.color} 
						onChange={(e) => setPetForm((f) => ({ ...f, color: e.target.value }))}
					/>
					<Input 
						label="Microchip" 
						placeholder="Microchip (opcional)" 
						value={petForm.microchip} 
						onChange={(e) => setPetForm((f) => ({ ...f, microchip: e.target.value }))}
					/>
					<div className="sm:col-span-2 lg:col-span-3 flex justify-end">
						<Button onClick={handleSavePet}>Guardar mascota</Button>
					</div>
				</div>
			</div>

			<div className="card p-5">
				<h2 className="font-semibold mb-3">Mis Mascotas Registradas</h2>
				{pets.length === 0 ? (
					<p className="text-sm text-gray-600">No tienes mascotas registradas aún.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-gray-50 text-gray-700">
								<tr>
									<th className="px-4 py-2 text-left">Nombre</th>
									<th className="px-4 py-2 text-left">Especie</th>
									<th className="px-4 py-2 text-left">Raza</th>
									<th className="px-4 py-2 text-left">Edad</th>
									<th className="px-4 py-2 text-left">Peso</th>
									<th className="px-4 py-2 text-left">Color</th>
									<th className="px-4 py-2 text-left">Microchip</th>
								</tr>
							</thead>
							<tbody>
								{pets.map((p) => (
									<tr key={p.id} className="border-t">
										<td className="px-4 py-2 font-medium">{p.name}</td>
										<td className="px-4 py-2">{p.species}</td>
										<td className="px-4 py-2">{p.breed || '—'}</td>
										<td className="px-4 py-2">{p.age ? `${p.age} años` : '—'}</td>
										<td className="px-4 py-2">{p.weight ? `${p.weight} kg` : '—'}</td>
										<td className="px-4 py-2">{p.color || '—'}</td>
										<td className="px-4 py-2 text-xs font-mono">{p.microchip || '—'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}


