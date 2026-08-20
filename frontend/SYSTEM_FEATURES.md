# Orkpad - Sistema de Gestión Operativa (Orkpad)

Este documento detalla las funcionalidades actuales y planificadas del sistema Orkpad, diseñado para centralizar la operación, ventas, finanzas e infraestructura de agencias y profesionales.

## 🚀 Módulos Principales

### 1. Gestión de Trabajo (Work)

- **Dashboard**: Vista panorámica con métricas clave, tareas próximas y estado general del espacio de trabajo.
- **Clientes**: Gestión completa de base de datos de clientes, incluyendo contactos, información fiscal y vista 360° de su actividad.
- **Proyectos**: Organización de trabajos por proyectos, vinculación con clientes y seguimiento de hitos.
- **Tareas (Kanban)**: Tablero visual para la gestión de tareas con estados personalizables, prioridades, fechas de vencimiento y asignación de responsables.

### 2. Ventas y Pipeline (Sales)

- **Pipeline**: Gestión de oportunidades comerciales en formato visual, permitiendo mover prospectos a través del embudo de ventas hasta el cierre.

### 3. Finanzas y Control (Finance)

- **Facturación y Gastos**: Registro de ingresos y egresos, gestión de facturas por cliente y seguimiento de estados (Pendiente, Pagado, Vencido).
- **Balance General**: Cálculo automático de flujo de caja y rentabilidad.
- **Control de Tiempo (Time Tracking)**: Registro de jornadas laborales y bloques de tiempo dedicados a proyectos específicos para análisis de productividad y facturación por horas.

### 4. Productos e Infraestructura

- **Catálogo de Productos**: Definición de servicios, productos digitales o físicos con precios y monedas configurables.
- **Suscripciones**: Gestión de pagos recurrentes, ciclos de facturación automáticos y control de renovaciones.
- **Infraestructura**: Inventario de recursos tecnológicos (Cloud, IA, Bases de datos, etc.) vinculados a proveedores, permitiendo controlar costos operativos de la arquitectura técnica.

### 5. Conocimiento y Organización

- **Documentación (Docs)**: Base de conocimientos interna con editor de texto enriquecido para manuales, procesos y notas compartidas.
- **Agenda**: Calendario interactivo para programar reuniones, recordatorios y citas vinculadas a clientes o tareas.

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
