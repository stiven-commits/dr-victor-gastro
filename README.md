# Dr. Víctor Web + CRM

Aplicación React/Vite que combina:
- Sitio público del doctor.
- Flujo de auto-registro de pacientes.
- CRM administrativo (leads, pacientes, finanzas, informes, inventario, usuarios y auditoría).

## Stack
- React 19
- Vite 7
- React Router
- Tailwind CSS
- FullCalendar (agenda)
- Integración vía webhooks n8n

## Rutas URL actualmente en funcionamiento

Definidas en `src/App.jsx`:

- `/`
  - Landing pública (Home).
- `/registro`
  - Auto-registro de paciente / consentimiento digital.
- `/gracias`
  - Pantalla de confirmación posterior a registro.
- `/login`
  - Acceso administrativo.
- `/dashboard`
  - CRM (protegido por `RequireAuth`, requiere `isAdminAuth === 'true'` en localStorage).
- `*`
  - NotFound.

## Módulos del CRM (dentro de `/dashboard`)

Navegación controlada por `Sidebar` + permisos (`view` / `edit`):

- `leads`
  - Gestión de leads, notas, doble clic para editar, conversión a paciente.
- `patients`
  - Historial clínico, peso, notas, asignación de balón (si tratamiento coincide y hay permiso de edición).
- `finances`
  - Registro de pagos, pago grupal, ajustes de precio, reversos, impresión de cierre.
- `informes`
  - Informes médicos y récipe/recetas con historial e impresión.
- `inventory`
  - Inventario de balones (Allurion, OvalSilhouette, Spatz3, Gastroballon, Orbera365), movimientos y filtros.
- `audit` (solo admin)
  - Auditoría de acciones.
- `users` (solo admin)
  - Gestión de usuarios y permisos por módulo.

## Reglas de permisos (actuales)

- `admin`:
  - Puede ver y editar todos los módulos.
- `user` con permisos:
  - Puede ver módulos con permiso `view` o `edit`.
  - Solo puede editar donde tenga `edit`.

Impacto práctico:
- Botones de edición/acción (Agregar registro, Marcar paciente, Asignar balón, Pagar/Ajustar/Reversar) se ocultan si no hay permiso de edición.
- El doble clic para abrir edición en leads/pacientes está bloqueado si no hay `edit`.

## Cómo maneja pagos de más (estado actual)

Lógica en `src/admin/components/FinancesView.jsx`:

- Pago individual:
  - Si el monto > saldo pendiente, se bloquea y muestra alerta.
- Pago grupal:
  - Distribuye el monto entre deudas seleccionadas.
  - Si sobra dinero, muestra alerta de excedente no aplicado.

Importante:
- Actualmente el sistema no genera ni guarda “saldo a favor” automático del paciente.
- El excedente solo se informa y no se registra como crédito.

## Integraciones backend (webhooks n8n)

La app consume webhooks para:
- Login y actualización de contraseña.
- Leads/pacientes (crear, actualizar, borrar, auditoría).
- Tratamientos.
- Finanzas (listar, pago, ajuste, reverso, alta/baja de tratamiento financiero).
- Inventario de balones.
- Agenda médica.
- Usuarios y permisos.

## Scripts

Desde la raíz del proyecto:

- `npm run dev`
  - Levanta entorno local.
- `npm run build`
  - Build de producción.
- `npm run preview`
  - Previsualiza build local.
- `npm run lint`
  - Lint del proyecto.

## Estructura principal

- `src/App.jsx`: rutas públicas + rutas admin.
- `src/pages/SelfRegistration.jsx`: registro/consentimiento.
- `src/admin/Dashboard.jsx`: shell principal del CRM y tabs.
- `src/admin/components/*`: módulos internos (finanzas, inventario, informes, usuarios, agenda, modales, etc.).

## Estado de compilación

- Build de producción ejecutado correctamente (`npm run build`) en fecha 2026-03-10.
- Se observó advertencia HTML de `noscript` en `index.html`, pero no bloquea el build.
