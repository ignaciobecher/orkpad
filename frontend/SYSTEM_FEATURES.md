# Orkpad - Sistema de Gestión para Agencias de Software

Este documento detalla las funcionalidades del sistema Orkpad, diseñado para centralizar la operación de agencias de desarrollo: clientes, proyectos, tareas, horas, finanzas y cuotas recurrentes — con cada proyecto mostrando sus totales vinculados.

## 🚀 Módulos Principales

### 1. Gestión de Trabajo (Work)

- **Dashboard**: Vista panorámica con métricas clave, tareas próximas y estado general del espacio de trabajo.
- **Clientes**: Gestión completa de base de datos de clientes, incluyendo contactos, información fiscal y vista 360° de su actividad.
- **Proyectos**: Organización de trabajos por proyectos con totales vinculados (tareas pendientes, horas registradas, presupuestos, facturas cobradas/pendientes/vencidas y cuotas del cliente), vinculación con clientes, links públicos para compartir avance y repositorios GitHub.
- **Tareas (Kanban)**: Tablero visual para la gestión de tareas con estados personalizables, prioridades, fechas de vencimiento y asignación de responsables.

### 2. Finanzas y Control (Finance)

- **Facturación y Gastos**: Registro de ingresos y egresos, gestión de facturas por cliente y proyecto, seguimiento de estados (Pendiente, Pagado, Vencido).
- **Presupuestos**: Cotizaciones vinculadas a clientes y proyectos, convertibles en trabajo facturable.
- **Cuotas / Suscripciones**: Gestión de pagos recurrentes de clientes, ciclos de facturación y control de renovaciones.
- **Balance General**: Cálculo automático de flujo de caja y rentabilidad.
- **Control de Tiempo (Time Tracking)**: Registro de jornadas laborales y bloques de tiempo dedicados a proyectos específicos para análisis de productividad y facturación por horas.

### 3. Planificación y Organización

- **Planner**: Organización del día en bloques de tiempo.
- **Objetivos**: Metas y hábitos para la agencia.
- **Documentación (Docs)**: Base de conocimientos interna con editor de texto enriquecido para manuales, procesos y notas compartidas.
- **Agenda**: Calendario interactivo para programar reuniones, recordatorios y citas vinculadas a clientes o tareas.
- **Pizarra**: Notas rápidas.

### 4. Comunicación

- **Mensajería**: Conversación con clientes sin salir de la plataforma.
- **Soporte**: Bandeja de soporte con inbox administrable.
- **Notificaciones**: Notificaciones in-app (vencimientos, renovaciones, facturas) y push.

---

## ✨ Funcionalidades Avanzadas (Implementadas/En Proceso)

### Automatización de Notificaciones

- **Cierre de Tareas Inteligente**: Al marcar una tarea como completada, el sistema genera automáticamente un reporte de cumplimiento y notifica al cliente vía email con el detalle de lo realizado.

### Portal del Cliente (Próximamente)

- **Vista de Estado**: Espacio exclusivo donde el cliente puede entrar para ver el progreso en tiempo real de sus proyectos y sistemas.
- **Centro de Soporte**: Formulario directo para que el cliente cargue errores, bugs o solicitudes de cambio, que se transforman automáticamente en tareas en el Kanban del equipo.

---

## 🛠️ Especificaciones Técnicas (Frontend)

- **Interfaz Premium**: Diseño moderno con soporte para Modo Oscuro/Claro dinámico.
- **Arquitectura Reactiva**: Basado en Vue 3 y Vite para una experiencia de usuario instantánea.
- **Full Responsive**: Optimizado para uso en escritorio, tablets y móviles con layouts adaptables y tablas con scroll inteligente.
- **Sistema de Notificaciones (Toasts)**: Feedback visual inmediato sobre cada acción realizada.
- **Seguridad**: Integración con autenticación JWT, verificación de email y recuperación de contraseña.
