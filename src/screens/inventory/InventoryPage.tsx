import { useEffect, useMemo, useState } from 'react'
import { useInventory } from '../../contexts/InventoryContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function InventoryPage() {
	const { products, cart, addToCart, removeFromCart, changeQty, doCheckout, restock, createReserve, loadReservations, reservationsByProduct, nextReservation, markReservation } =
		useInventory()
	const [restockQty, setRestockQty] = useState<Record<string, number>>({})
	const [reserveForm, setReserveForm] = useState<{ [productId: string]: { name: string; phone: string } }>({})

	useEffect(() => {
		products.forEach((p) => loadReservations(p.id))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [products.length])

	const cartItems = useMemo(() => cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })), [cart, products])
	const total = cartItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0)

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Inventario y Ventas</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="card p-5 lg:col-span-2">
					<h2 className="font-semibold mb-3">Productos</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
						{products.map((p) => (
							<div key={p.id} className="border rounded-xl p-4">
								<div className="font-medium">{p.name}</div>
								<div className="text-sm text-gray-600">S/. {p.price.toFixed(2)}</div>
								<div className="text-sm mt-1">
									Stock: <span className={p.stock === 0 ? 'text-red-600' : ''}>{p.stock}</span>
								</div>
								<div className="mt-3 flex items-center gap-2">
									<Button variant="outline" onClick={() => addToCart(p.id)} disabled={p.stock === 0}>
										Agregar
									</Button>
									{p.stock === 0 ? (
										<>
											<Input
												placeholder="Nombre"
												value={reserveForm[p.id]?.name ?? ''}
												onChange={(e) =>
													setReserveForm((prev) => ({ ...prev, [p.id]: { ...prev[p.id], name: e.target.value } }))
												}
											/>
											<Input
												placeholder="Teléfono"
												value={reserveForm[p.id]?.phone ?? ''}
												onChange={(e) =>
													setReserveForm((prev) => ({ ...prev, [p.id]: { ...prev[p.id], phone: e.target.value } }))
												}
											/>
											<Button
												onClick={() =>
													createReserve(p.id, reserveForm[p.id]?.name ?? 'Cliente', reserveForm[p.id]?.phone ?? '')
												}
											>
												Reservar
											</Button>
										</>
									) : null}
								</div>
								<div className="mt-3 flex items-center gap-2">
									<Input
										type="number"
										placeholder="Reponer"
										value={restockQty[p.id] ?? ''}
										onChange={(e) => setRestockQty((prev) => ({ ...prev, [p.id]: parseInt(e.target.value || '0') }))}
									/>
									<Button variant="outline" onClick={() => restock(p.id, restockQty[p.id] || 0)}>
										Reponer
									</Button>
								</div>
								{(reservationsByProduct[p.id]?.length ?? 0) > 0 ? (
									<div className="mt-3 border-t pt-3">
										<div className="text-sm font-medium mb-2">Reservas</div>
										<div className="text-sm space-y-2">
											{(reservationsByProduct[p.id] ?? []).map((r) => (
												<div key={r.id} className="flex items-center justify-between">
													<div>
														<div>{r.clientName}</div>
														<div className="text-gray-600">{r.phone}</div>
													</div>
													<div className="text-xs capitalize">{r.status}</div>
												</div>
											))}
											<div className="flex gap-2">
												<Button
													variant="outline"
													onClick={() => {
														const nx = nextReservation(p.id)
														if (nx) markReservation(nx.id, 'notificado', p.id)
													}}
												>
													Contactar siguiente
												</Button>
												<Button
													variant="outline"
													onClick={() => {
														const nx = nextReservation(p.id)
														if (nx) markReservation(nx.id, 'aceptado', p.id)
													}}
												>
													Aceptar
												</Button>
												<Button
													variant="outline"
													onClick={() => {
														const nx = nextReservation(p.id)
														if (nx) markReservation(nx.id, 'liberado', p.id)
													}}
												>
													Liberar
												</Button>
											</div>
										</div>
									</div>
								) : null}
							</div>
						))}
					</div>
				</div>
				<div className="card p-5">
					<h2 className="font-semibold mb-3">Carrito</h2>
					{cartItems.length === 0 ? (
						<p className="text-sm text-gray-600">Añade productos para vender.</p>
					) : (
						<>
							<ul className="space-y-3">
								{cartItems.map((it) => (
									<li key={it.productId} className="flex items-center justify-between">
										<div>
											<div className="font-medium">{it.product.name}</div>
											<div className="text-xs text-gray-600">S/. {it.product.price.toFixed(2)}</div>
										</div>
										<div className="flex items-center gap-2">
											<Input
												type="number"
												value={it.quantity}
												onChange={(e) => changeQty(it.productId, parseInt(e.target.value || '1'))}
												className="w-20"
											/>
											<Button variant="outline" onClick={() => removeFromCart(it.productId)}>
												Quitar
											</Button>
										</div>
									</li>
								))}
							</ul>
							<div className="mt-4 flex items-center justify-between">
								<div className="font-semibold">Total: S/. {total.toFixed(2)}</div>
								<Button onClick={doCheckout}>Cobrar</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}


