# Veterinaria Front - Pochita S.A.

Aplicación frontend en React + TypeScript + Tailwind CSS para gestionar la veterinaria “Pochita S.A.”. 

Incluye los módulos:

- Agenda de citas (crear, confirmar 24h, cambiar y cancelar, lista de espera)
- Atención y tratamientos (3 procedimientos predefinidos y calendario de revisiones post-operatorias)
- Inventario y ventas (carrito, cobro, reposición), reservas por falta de stock con cola
- Gestión básica de clientes y mascotas

Estado global con React Context y persistencia local básica usando `localStorage`. 
De momento, los “endpoints” están simulados con un servicio en memoria (`src/services/fakeApi.ts`) con latencia artificial.

## Tecnologías

- React 18, TypeScript, Vite 5
- Tailwind CSS 3
- React Router DOM

## Estructura de carpetas (principal)

```
veterinaria-front/
  src/
    components/        # UI reutilizable (Botón, Modal, etc.) y navegación
    contexts/          # Contextos: Citas, Mascotas, Inventario, Toast
    providers/         # AppProviders que agrupa todos los contextos
    screens/           # Páginas: Dashboard, Citas, Visita, Inventario, Mascotas
    services/          # fakeApi.ts con simulación de endpoints
    types.ts           # Tipados de dominio
    utils/             # utilidades (storage)
```

## Scripts

- `yarn dev`: ejecuta el servidor de desarrollo
- `yarn build`: compila a producción
- `yarn preview`: ejecuta el build en modo preview

## Autenticación y roles (simulados)

Login/registro simulados en frontend con `localStorage`. Cuentas demo:

- Cliente: `cliente@pochita.com` / `123456`
- Recepción: `recepcion@pochita.com` / `123456`
- Veterinario: `vet@pochita.com` / `123456`
- Admin: `admin@pochita.com` / `123456`

Rutas por rol:
- Cliente: `/cliente` (inicio público en `/` para reservar)
- Recepción: `/recepcion` (agenda, lista de espera, confirmación 24h)
- Veterinario: `/vet` (citas del día y acceso a atención)
- Admin: `/admin` (atajos a agenda, inventario y mascotas)

## Requisitos previos

- Node.js 18+ y Yarn instalado

## Cómo ejecutar en local

1. Instalar dependencias:
   ```
   yarn
   ```
2. Ejecutar en desarrollo:
   ```
   yarn dev
   ```
3. Abrir en el navegador:
   - `http://localhost:5173`

## Notas de uso

- La data se persiste en `localStorage` mientras navegas.
- La disponibilidad de horarios es por horas (09:00-17:00) y depende de lo ya reservado.
- Confirmación de cita: solo habilitada cuando falta ≤ 24h para la hora programada.
- En “Visita”, seleccionar uno de los 3 procedimientos. Si es “Cirugía menor”, se proponen 3 revisiones automáticas (días 1, 7 y 14).
- En Inventario, si no hay stock, se puede crear una reserva; al reponer, se pueden “contactar/aceptar/liberar” reservas en orden.

## Estilo y UX

- Diseño responsive y mobile-first.
- Componentes UI básicos con Tailwind para una apariencia moderna y clara.

## Próximos pasos (sugerencias)

- Autenticación y roles
- Integración real con backend
- Perfil de cliente/mascota y ficha clínica avanzada
- Reportes y exportaciones


