import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ID, Product, Reservation } from '../types'
import {
	checkout,
	createReservation,
	listProducts,
	listReservationsByProduct,
	updateProductStock,
	updateReservationStatus
} from '../services/fakeApi'
import { useToast } from './ToastContext'

type CartItem = { productId: ID; quantity: number }

type InventoryContextValue = {
	products: Product[]
	cart: CartItem[]
	reservationsByProduct: Record<ID, Reservation[]>
	refresh: () => Promise<void>
	addToCart: (productId: ID) => void
	removeFromCart: (productId: ID) => void
	changeQty: (productId: ID, qty: number) => void
	doCheckout: () => Promise<void>
	restock: (productId: ID, qty: number) => Promise<void>
	createReserve: (productId: ID, clientName: string, phone: string) => Promise<void>
	loadReservations: (productId: ID) => Promise<void>
	nextReservation: (productId: ID) => Reservation | undefined
	markReservation: (reservationId: ID, status: Reservation['status'], productId: ID) => Promise<void>
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
	const [products, setProducts] = useState<Product[]>([])
	const [cart, setCart] = useState<CartItem[]>([])
	const [reservationsByProduct, setReservationsByProduct] = useState<Record<ID, Reservation[]>>({})
	const { show } = useToast()

	async function refresh() {
		const ps = await listProducts()
		setProducts(ps)
	}
	useEffect(() => {
		refresh()
	}, [])

	const value = useMemo<InventoryContextValue>(
		() => ({
			products,
			cart,
			reservationsByProduct,
			refresh,
			addToCart(productId) {
				setCart((prev) => {
					const existing = prev.find((c) => c.productId === productId)
					if (existing) return prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c))
					return [...prev, { productId, quantity: 1 }]
				})
			},
			removeFromCart(productId) {
				setCart((prev) => prev.filter((c) => c.productId !== productId))
			},
			changeQty(productId, qty) {
				setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity: Math.max(1, qty) } : c)))
			},
			async doCheckout() {
				if (cart.length === 0) return
				await checkout(cart)
				setCart([])
				await refresh()
				show({ title: 'Transacción realizada', variant: 'success' })
			},
			async restock(productId, qty) {
				await updateProductStock(productId, qty)
				await refresh()
				show({ title: 'Inventario actualizado', variant: 'success' })
			},
			async createReserve(productId, clientName, phone) {
				await createReservation({ productId, clientName, phone })
				await (this as any).loadReservations(productId)
				show({ title: 'Reserva creada', variant: 'success' })
			},
			async loadReservations(productId) {
				const list = await listReservationsByProduct(productId)
				setReservationsByProduct((prev) => ({ ...prev, [productId]: list }))
			},
			nextReservation(productId) {
				return reservationsByProduct[productId]?.find((r) => r.status === 'pendiente' || r.status === 'notificado')
			},
			async markReservation(reservationId, status, productId) {
				await updateReservationStatus(reservationId, status)
				await (this as any).loadReservations(productId)
				show({ title: 'Reserva actualizada', variant: 'success' })
			}
		}),
		[products, cart, reservationsByProduct]
	)

	return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
	const ctx = useContext(InventoryContext)
	if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
	return ctx
}


