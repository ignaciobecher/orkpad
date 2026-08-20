/**
 * Seed script — pobla la colección de recursos educativos.
 *
 * Requiere que el servidor esté corriendo y que tengas el token de admin.
 *
 * Uso:
 *   ADMIN_TOKEN=<tu_jwt> ts-node scripts/seed-resources.ts
 *
 * O con el servidor en otro puerto:
 *   API_URL=http://localhost:3000 ADMIN_TOKEN=<jwt> ts-node scripts/seed-resources.ts
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3000'
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? ''

if (!ADMIN_TOKEN) {
  console.error('❌  Falta ADMIN_TOKEN. Exportá tu JWT de admin antes de ejecutar.')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ADMIN_TOKEN}`,
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Propuestas y Cotizaciones', slug: 'propuestas', icon: 'request_quote', description: 'Cómo armar propuestas que convierten y cotizaciones profesionales.' },
  { name: 'Contratos y Legal',         slug: 'contratos',  icon: 'gavel',         description: 'Cláusulas esenciales y buenas prácticas legales para freelancers.' },
  { name: 'Gestión de Clientes',       slug: 'clientes',   icon: 'handshake',     description: 'Comunicación efectiva, expectativas y relaciones duraderas.' },
  { name: 'Cobros y Finanzas',         slug: 'finanzas',   icon: 'payments',      description: 'Tarifas, adelantos, seguimiento de pagos y salud financiera.' },
  { name: 'Productividad',             slug: 'productividad', icon: 'bolt',        description: 'Herramientas y hábitos para trabajar mejor y con menos estrés.' },
  { name: 'Crecimiento Freelance',     slug: 'crecimiento', icon: 'trending_up',  description: 'Estrategias para escalar tu negocio y conseguir mejores clientes.' },
]

// ─── Resources ───────────────────────────────────────────────────────────────

const RESOURCES = [
  {
    categorySlug: 'propuestas',
    title: 'Cómo armar una propuesta ganadora para proyectos de software',
    slug: 'propuesta-ganadora-software',
    excerpt: 'Una propuesta bien estructurada puede ser la diferencia entre ganar o perder un proyecto. Aprendé los elementos clave que transforman un presupuesto en una propuesta irresistible.',
    tags: ['propuesta', 'ventas', 'software', 'cotización'],
    readTimeMinutes: 7,
    content: `## Por qué la mayoría de las propuestas no funcionan

La mayoría de los freelancers envían un documento con precio y descripción técnica. El cliente lo recibe, lo compara con otros tres, y elige el más barato. Si esto te suena familiar, el problema no es tu precio: es cómo estás presentando el valor.

Una propuesta ganadora no es un presupuesto. Es un documento de ventas que responde antes de que el cliente pregunte.

---

## Los 6 elementos de una propuesta efectiva

### 1. El problema del cliente (no tu solución)

Empezá con sus palabras. Antes de hablar de lo que vas a hacer, demostrá que entendés el problema que tienen.

> "Entiendo que hoy tu proceso de facturación se hace en Excel, lo que genera errores y les insume 3 horas por semana al equipo de administración."

Esto genera confianza inmediata. El cliente siente que ya lo conocés.

### 2. El resultado esperado

¿Qué va a poder hacer el cliente cuando el proyecto esté terminado que hoy no puede hacer?

No describas la tecnología. Describí el resultado de negocio:

- *"Podrás generar facturas en 2 clics y exportarlas directamente a tu sistema contable."*
- *"Tu equipo comercial podrá ver el pipeline en tiempo real desde el celular."*

### 3. El alcance (scope) claro y acotado

Este es el punto donde más freelancers fallan. Sé específico en qué incluye y qué **no** incluye el proyecto.

Usá listas cortas:

**Incluye:**
- Diseño e implementación de la base de datos
- 3 pantallas de administración (dashboard, listado, detalle)
- Integración con API de facturación electrónica

**No incluye:**
- Migración de datos históricos
- Capacitación del equipo
- Mantenimiento posterior al período de garantía

Esta claridad protege a ambas partes y elimina el scope creep desde el inicio.

### 4. Los entregables con fechas

En vez de "el proyecto se entrega en 6 semanas", estructurá hitos:

| Semana | Entregable |
|--------|------------|
| 2 | Diseño de base de datos aprobado |
| 4 | Backend y APIs funcionando en staging |
| 5 | Frontend integrado y en testing |
| 6 | Deploy a producción + documentación |

Las fechas visibles generan confianza y te protegen si el cliente demora sus aprobaciones.

### 5. El precio con justificación

No pongas un número solo. Justificalo:

- **Etapa 1 — Diseño y arquitectura:** $X
- **Etapa 2 — Desarrollo backend:** $X
- **Etapa 3 — Frontend e integración:** $X
- **Total:** $X

Esto le permite al cliente entender en qué se gasta el dinero y reduce la fricción de "es muy caro".

### 6. El llamado a la acción

Terminá con una pregunta o acción concreta:

> "¿Podemos agendar una llamada de 30 minutos esta semana para revisar esto juntos y ajustar lo que necesiten?"

---

## Errores que hay que evitar

**Error 1: Propuesta genérica.** Si podés enviar la misma propuesta a 5 clientes distintos, no va a convertir bien. Personalizá cada una con el nombre del cliente, su empresa y detalles específicos de su contexto.

**Error 2: Demasiada jerga técnica.** Tu cliente no sabe qué es un microservicio, un ORM ni un CDN. Hablá de resultados, no de tecnología.

**Error 3: No tener seguimiento.** El 80% de las propuestas que no responden en 3 días simplemente se olvidaron. Un email de seguimiento amable ("¿tuviste tiempo de revisar la propuesta?") puede reactivar conversaciones.

**Error 4: Precio sin contexto.** Un precio alto sin explicación parece caro. El mismo precio justificado parece razonable.

---

## Plantilla de estructura recomendada

\`\`\`
1. Resumen ejecutivo (3-4 líneas)
2. Entendimiento del problema
3. Solución propuesta
4. Alcance detallado (incluye / no incluye)
5. Plan de trabajo con hitos
6. Inversión desglosada
7. Sobre mí / mis trabajos anteriores relevantes
8. Próximos pasos
\`\`\`

Usá Orkpad para generar y enviar tus presupuestos — podés registrar el estado de cada cotización y hacer seguimiento desde el pipeline.
`,
  },
  {
    categorySlug: 'contratos',
    title: 'Contrato para proyectos de software: las 8 cláusulas que no pueden faltar',
    slug: 'contrato-software-clausulas-esenciales',
    excerpt: 'Un contrato no es un obstáculo: es lo que te protege cuando algo sale mal. Estas 8 cláusulas son innegociables en cualquier proyecto de desarrollo.',
    tags: ['contrato', 'legal', 'protección', 'freelance'],
    readTimeMinutes: 8,
    content: `## El contrato es tu mejor amigo

Muchos freelancers evitan el contrato porque creen que "espanta clientes" o que "con un email alcanza". Error grave. El contrato no es desconfianza: es profesionalismo. Y cuando algo sale mal (y eventualmente algo sale mal), es lo único que te protege.

No necesitás un abogado para empezar. Necesitás entender qué cláusulas importan y por qué.

---

## 1. Alcance del trabajo (Scope of Work)

Describí con precisión qué vas a hacer y, igual de importante, **qué no vas a hacer**. Todo lo que no esté documentado en el contrato puede convertirse en un "pero yo pensé que incluía..."

> "El presente contrato incluye el desarrollo del sistema de facturación descrito en la propuesta del [fecha]. Cualquier trabajo adicional no contemplado en dicha propuesta será cotizado por separado previo al inicio."

### Por qué importa

El scope creep es la razón #1 por la que los proyectos freelance se vuelven no rentables. Una cláusula clara te da base para cobrar por el trabajo extra.

---

## 2. Precio y condiciones de pago

Especificá:
- El monto total
- El porcentaje de adelanto
- Cuándo se pagan las cuotas restantes (por hito, no por tiempo)
- Moneda y método de pago

> "El cliente abonará el 40% del monto total como adelanto antes del inicio del proyecto. El 60% restante se abonará al momento de la entrega final."

### Consejo práctico

Cobrá por hitos, no mensualmente. Si cobrás mensual, tu incentivo y el del cliente están desalineados. Si cobrás por entregable completado, ambos empujan en la misma dirección.

---

## 3. Revisiones y cambios

Definí cuántas rondas de revisión están incluidas y qué pasa si el cliente pide más.

> "El contrato incluye hasta 2 rondas de revisión por entregable. Las revisiones adicionales se facturarán a $[tarifa horaria] por hora."

Sin esta cláusula, podés quedar atrapado en ciclos infinitos de "¿podrías cambiar este detallito?"

---

## 4. Derechos de propiedad intelectual

¿Cuándo pasan los derechos del código al cliente? La respuesta correcta: **cuando pagan el 100%**.

> "Los derechos de propiedad intelectual sobre el trabajo entregado se transfieren al cliente una vez acreditado el pago total del contrato. Hasta ese momento, el proveedor retiene todos los derechos sobre el trabajo producido."

Esto te protege si un cliente recibe el código y luego no paga la última cuota.

---

## 5. Responsabilidad del cliente

El cliente también tiene obligaciones. Documentalas:
- Proveer acceso a sistemas, credenciales y documentación necesaria
- Responder aprobaciones en un plazo definido (ej: 5 días hábiles)
- Proveer feedback consolidado (no 10 personas distintas enviando comentarios)

> "El cliente se compromete a proveer todo el material, accesos y feedback necesarios en un plazo máximo de 5 días hábiles. Demoras del cliente pueden impactar los plazos del proyecto sin costo adicional para el proveedor."

---

## 6. Política de cancelación

¿Qué pasa si el cliente cancela a mitad del proyecto? Necesitás una cláusula que cubra el trabajo ya realizado.

> "En caso de cancelación por parte del cliente, se facturará el trabajo realizado hasta la fecha proporcional al total del contrato. El adelanto no es reembolsable."

---

## 7. Confidencialidad (NDA básico)

Para proyectos donde el cliente tiene información sensible:

> "El proveedor se compromete a mantener confidencial toda la información técnica, comercial y estratégica del cliente a la que tenga acceso durante el proyecto, durante la duración del contrato y por 2 años posteriores a su finalización."

---

## 8. Ley aplicable y resolución de conflictos

> "Cualquier disputa derivada del presente contrato será resuelta bajo las leyes de [tu país], y las partes acuerdan la jurisdicción de los tribunales de [tu ciudad]."

Simple, pero necesario para que el contrato sea ejecutable.

---

## Formato recomendado

Un contrato de 2 páginas con estas 8 cláusulas es infinitamente mejor que un contrato de 20 páginas lleno de jerga legal que ninguno de los dos va a leer.

Podés usar Google Docs, enviarlo por email, y pedir una confirmación escrita de aceptación. Para proyectos más grandes, considerá una plataforma de firma digital.

> **Regla de oro:** Si no está en el contrato, no existe.
`,
  },
  {
    categorySlug: 'clientes',
    title: 'El primer contacto con un cliente: cómo pasar de interesado a proyecto confirmado',
    slug: 'primer-contacto-cliente',
    excerpt: 'Los primeros 15 minutos de conversación con un potencial cliente determinan si vas a conseguir el proyecto. Estos son los pasos para convertir ese interés inicial en un "sí".',
    tags: ['clientes', 'ventas', 'comunicación', 'primer contacto'],
    readTimeMinutes: 6,
    content: `## El momento más importante

El primer contacto con un cliente potencial es donde se gana o se pierde el proyecto antes de que hayas escrito una sola línea de código o diseñado una sola pantalla.

Muchos freelancers lo abordan mal: hablan demasiado sobre ellos mismos, van directo al precio, o no hacen las preguntas correctas. Resultado: el cliente se va sin comprometerse.

---

## Antes de la primera llamada

Antes de hablar con el cliente, investigá:
- ¿Qué hace la empresa o qué hace el cliente?
- ¿Qué tipo de proyecto es?
- ¿Hay algún contexto público disponible (LinkedIn, sitio web, redes)?

Llegar con contexto cambia completamente la dinámica. En vez de "contame de tu empresa", podés decir "vi que estás en el rubro de logística — ¿el sistema que necesitás es para la gestión interna o para los clientes finales?"

---

## Las 5 preguntas que necesitás responder

Antes de cotizar cualquier proyecto, necesitás saber:

### 1. ¿Cuál es el problema real?

No el problema técnico ("necesito una app"), sino el problema de negocio ("perdemos clientes porque el proceso de reserva es demasiado lento").

Preguntá: *"¿Qué problema específico estamos resolviendo con este proyecto?"*

### 2. ¿Qué pasó antes?

¿Ya intentaron resolver esto? ¿Hay código existente? ¿Trabajaron con alguien antes? Si hubo un proyecto anterior fallido, necesitás saber por qué.

Preguntá: *"¿Es la primera vez que encarás este proyecto o ya tuviste alguna experiencia anterior?"*

### 3. ¿Cuál es el presupuesto?

Muchos freelancers tienen miedo de preguntar el presupuesto. Es un error. Saberlo antes te ahorra tiempo a los dos. Si tienen $500 para un sistema de $5000, mejor saberlo ahora.

Decí: *"Para poder hacer una propuesta que se ajuste a lo que necesitás, ¿tienen algún presupuesto estimado en mente?"*

### 4. ¿Cuáles son los plazos?

¿Hay una fecha límite real (un lanzamiento, un evento) o es una estimación flexible?

### 5. ¿Quién toma las decisiones?

¿La persona con la que hablás es quien aprueba el proyecto y el presupuesto? Si no, necesitás eventualmente llegar a esa persona.

---

## Cómo manejar la reunión

**Los primeros 5 minutos:** Escuchá. Dejá que el cliente explique qué necesita antes de abrir la boca. Tomá notas.

**Los siguientes 10 minutos:** Hacé las 5 preguntas de arriba. No en orden mecánico — como conversación.

**Los últimos 5 minutos:** Resumí lo que entendiste y acordá próximos pasos.

> "Entendí que necesitás [resumen en 2 líneas]. Lo que haría es [propuesta muy general]. ¿Tiene sentido esto como primera mirada? Voy a preparar una propuesta formal con alcance y precios para [fecha]. ¿Está bien?"

---

## El error más común: cotizar en el acto

Nunca des un precio en el primer contacto salvo que sea un proyecto muy estandarizado que conozcas de memoria. Decí siempre:

> "Necesito un tiempo para analizar bien lo que me contaste y preparar una propuesta que tenga sentido. Te la mando en [X días]."

Esto te da tiempo para pensar, evita que des un número que después tengas que justificar, y mantiene tu posición de profesional, no de vendedor desesperado.

---

## El seguimiento

Si el cliente dijo "sí, mandame la propuesta" y pasaron 3 días sin respuesta después de enviarla, escribí:

> "Hola [nombre], quería saber si tuviste tiempo de revisar la propuesta. Estoy disponible si querés que hablemos de algún punto en detalle."

Simple, sin presión, efectivo.

---

## Señales de alerta desde el primer contacto

Prestá atención si el cliente:
- No puede explicar qué necesita en términos simples
- Quiere precio antes de entender bien el alcance
- Habla mal de todos los freelancers anteriores
- Pide referencias pero no da contexto de su empresa
- Dice "es un proyecto simple" para todo

Ninguna de estas señales es automáticamente un "no" — pero son puntos que conviene aclarar antes de comprometerte.
`,
  },
  {
    categorySlug: 'finanzas',
    title: 'Cómo cobrar el adelanto sin incomodidad (y por qué siempre deberías hacerlo)',
    slug: 'cobrar-adelanto-freelance',
    excerpt: 'Pedir un adelanto no es desconfianza. Es la práctica estándar del trabajo freelance. Acá te explicamos cómo pedirlo de forma natural y qué porcentaje cobrar.',
    tags: ['adelanto', 'cobros', 'pagos', 'finanzas'],
    readTimeMinutes: 5,
    content: `## La pregunta que todos evitan

"¿Cómo le pido el adelanto sin que piense que desconfío de él?"

Esta pregunta tiene una respuesta simple: no es desconfianza, es estándar. Y si lo planteás así, el cliente lo entiende.

---

## Por qué el adelanto es no negociable

**Razón 1: Protege tu tiempo.**

Sin adelanto, podés pasar semanas trabajando en un proyecto y que el cliente desaparezca, cambie de idea o simplemente no tenga el dinero cuando llegue el momento de pagar.

**Razón 2: Filtra clientes serios.**

Un cliente que no puede pagar el 30-40% del proyecto al inicio tiene un problema de liquidez que va a afectar todo el proyecto. Es mejor saberlo ahora.

**Razón 3: Aliena los incentivos correctamente.**

Cuando el cliente ya pagó algo, tiene interés en que el proyecto avance. Es psicología básica.

**Razón 4: Cubre tus costos iniciales.**

Horas de análisis, wireframes, reuniones de planning — todo eso es trabajo que hacés antes de empezar a cobrar. El adelanto cubre esa fase.

---

## ¿Cuánto cobrar de adelanto?

El estándar del mercado:

- **Proyectos de corta duración (menos de 1 mes):** 50% adelanto, 50% al finalizar
- **Proyectos medianos (1-3 meses):** 40% adelanto, 30% a mitad, 30% al finalizar
- **Proyectos largos (3+ meses):** 30% adelanto, pagos mensuales o por hito, 10% retenido al finalizar

Para proyectos pequeños o clientes nuevos, 50% adelanto es perfectamente razonable.

---

## Cómo pedirlo sin incomodidad

La clave está en presentarlo como parte natural del proceso, no como una negociación especial.

**Mal:**
> "Mmm... ¿te parece si... podemos hacer algo como un adelanto? No es que no confíe en vos, pero..."

**Bien:**
> "Como trabajo con todos mis clientes, mi proceso es el siguiente: antes de comenzar, se abona el 40% del proyecto. Con eso agendo el tiempo para empezar y hacemos kick-off. El 60% restante se abona al momento de la entrega."

Presentalo como proceso, no como pedido especial. "Como trabajo con todos mis clientes" es la frase clave — normaliza la práctica.

---

## Qué hacer si el cliente dice que no puede pagar adelanto

Hay tres respuestas posibles:

**Opción 1 — Reducir el alcance inicial:**
> "Podemos empezar con una primera fase más acotada que tenga un costo menor, y con eso arrancamos. Una vez que veas los resultados, seguimos con la siguiente fase."

**Opción 2 — Pedir un adelanto menor:**
> "Entiendo. ¿Podés hacer el 20% para arrancar? Así puedo reservar el tiempo y comenzamos esta semana."

**Opción 3 — No aceptar:**
Un cliente que no puede pagar el 30% adelanto sobre un proyecto de $2000 ($600) probablemente no va a poder pagarte cuando entregues. Es una señal de alerta seria.

---

## El adelanto en el contrato

Siempre especificá el adelanto en el contrato:

> "El inicio del proyecto está condicionado a la acreditación del adelanto del [X]% del valor total. El adelanto no es reembolsable en caso de cancelación por parte del cliente."

Esa última parte es importante: define qué pasa si el cliente cancela después de pagar.

---

## Una verdad incómoda

Si nunca pediste adelanto y tus proyectos salieron bien, no es porque los adelantos no sean necesarios. Es porque tuviste suerte con los clientes que elegiste.

El día que te toque un cliente que no paga la última cuota, que desaparece, o que cancela cuando el proyecto está al 80%, vas a desear haberlo pedido.

Empezá ahora, con el próximo proyecto.
`,
  },
  {
    categorySlug: 'clientes',
    title: 'Gestión de expectativas: la habilidad más importante del freelancer',
    slug: 'gestion-expectativas-freelancer',
    excerpt: 'La mayoría de los conflictos con clientes no vienen de problemas técnicos, sino de expectativas mal gestionadas. Aprendé a alinear expectativas desde el inicio para tener proyectos más fluidos.',
    tags: ['clientes', 'comunicación', 'expectativas', 'gestión'],
    readTimeMinutes: 6,
    content: `## El origen de casi todos los conflictos

Pensá en el último proyecto complicado que tuviste. ¿El problema fue técnico o fue de comunicación?

La mayoría de las veces, la respuesta es comunicación. El cliente esperaba X, vos entregaste Y (también válido, también correcto), pero no era lo que esperaban.

La gestión de expectativas no es una habilidad blanda opcional. Es la diferencia entre proyectos que fluyen y proyectos que terminan mal.

---

## Las expectativas que siempre hay que gestionar

### Tiempos

"¿Para cuándo está listo?" es la pregunta más cargada del trabajo freelance.

Nunca des una fecha sin colchón. Si creés que algo lleva 3 semanas, decí 4. No porque vayas a ser lento, sino porque algo siempre aparece: una reunión inesperada, un bug difícil, una aprobación que tarda.

Además, gestioná activamente las demoras del cliente como parte del timeline:

> "El timeline de 4 semanas asume que las aprobaciones se dan en 48 horas hábiles. Si hay demoras de su lado, el plazo final se extiende proporcionalmente."

### Qué incluye el precio

Nunca asumas que el cliente entendió el scope del contrato. En la primera reunión post-firma, repasalo brevemente:

> "Antes de arrancar, quiero confirmar que estamos alineados en el alcance. El proyecto incluye [A, B, C]. No incluye [D, E]. ¿Estamos de acuerdo?"

### Comunicación y disponibilidad

Definí cómo y cuándo te contactan:

> "Mi horario de trabajo es de lunes a viernes de 9 a 18h. Respondo emails y mensajes en ese horario. Para urgencias fuera de horario, usá el canal X."

Esto parece obvio pero evita que el cliente te mande mensajes a las 11pm esperando respuesta inmediata.

### Proceso de revisión

Explicá cómo funcionan las revisiones antes de que el cliente las pida:

> "Cuando entregue un módulo, van a tener 5 días hábiles para revisarlo y enviarme feedback consolidado. El feedback de múltiples personas conviene coordinarlo internamente antes de enviármelo."

---

## La técnica del "resumen escrito"

Después de cada llamada o reunión, mandá un email corto con lo que acordaron:

> "Resumen de la reunión de hoy:
> - Acordamos que el módulo de reportes se agrega como Fase 2
> - La fecha de entrega del prototipo es el viernes 15
> - Pedro va a coordinar el feedback del equipo antes de enviármelo
>
> ¿Quedó algo fuera? Escribime antes del miércoles si hay correcciones."

Este email sirve como registro y fuerza la confirmación del cliente. Si hay un malentendido, mejor descubrirlo ahora que en 3 semanas.

---

## Cómo dar malas noticias

Inevitablemente va a haber demoras, bugs inesperados, cambios de alcance. La forma de comunicarlo importa tanto como el hecho en sí.

**Mal:**
> "Se demoró porque hubo complicaciones técnicas."

**Bien:**
> "Hola [nombre], quería avisarte que el módulo de pagos va a demorarse 3 días más de lo planeado. Encontramos un conflicto con la API del banco que llevó más tiempo del esperado resolverlo. El nuevo plazo es el [fecha]. ¿Hay algo que necesites antes de eso que podamos priorizar?"

La diferencia:
1. Avisás proactivamente antes de que el cliente pregunte
2. Explicás por qué (sin quejarte ni excusarte en exceso)
3. Das la nueva fecha
4. Mostrás que pensás en sus necesidades

---

## Cuando el cliente pide algo que no está en el scope

Va a pasar. Siempre. La forma de manejarlo:

> "Con gusto lo agrego. Eso no estaba en el alcance original, así que voy a cotizarlo por separado. ¿Te mando un presupuesto adicional o lo dejamos para una segunda fase?"

Sin drama, sin reproches. Es natural que los proyectos evolucionen. Lo que no es natural es que esa evolución sea gratis.

---

## La regla de los updates proactivos

Aunque el proyecto vaya bien, mandá un update semanal breve:

> "Semana 2: terminé el backend de usuarios, estoy trabajando en el módulo de facturas. Todo en tiempo. Nada que requiera decisión de tu parte."

Esto reduce la ansiedad del cliente (que normalmente no sabe qué pasa con su proyecto), reduce las interrupciones ("¿cómo va todo?") y construye confianza.

Un cliente que confía en vos es un cliente que recomienda.
`,
  },
  {
    categorySlug: 'finanzas',
    title: 'Cuándo y cómo aumentar tus tarifas como freelancer',
    slug: 'aumentar-tarifas-freelancer',
    excerpt: 'Subir precios es una de las decisiones más difíciles para un freelancer. Acá te explicamos cuándo es el momento correcto y cómo comunicarlo sin perder clientes.',
    tags: ['tarifas', 'precios', 'negocio', 'finanzas'],
    readTimeMinutes: 7,
    content: `## El problema de no subir precios

La inflación corre, tus habilidades crecen, tus costos operativos aumentan — pero tu tarifa sigue igual que hace dos años.

Esto significa que cada año ganás menos en términos reales. Y los clientes nuevos que conseguís se acostumbran a tu tarifa vieja, haciendo cada vez más difícil cobrar lo que realmente vale tu trabajo.

Subir precios no es avaricia. Es mantenimiento básico de negocio.

---

## ¿Cuándo subir tus tarifas?

### Señal 1: Tenés más trabajo del que podés manejar

Si estás rechazando proyectos o trabajando más de 45 horas semanales, tu precio está por debajo del mercado. La economía básica dice: cuando la demanda supera la oferta, el precio sube.

### Señal 2: Conseguiste proyectos sin negociar precio

Si el último cliente aceptó tu cotización sin siquiera preguntar si podías bajar el precio, probablemente tu precio es bajo para ese segmento de mercado.

### Señal 3: Adquiriste nuevas habilidades o especialización

¿Aprendiste una tecnología nueva que tiene demanda? ¿Desarrollaste expertise en un nicho específico (fintech, salud, e-commerce)? Eso tiene valor y debería reflejarse en tu tarifa.

### Señal 4: Llevas más de un año con la misma tarifa

Como regla general, deberías revisar tu tarifa una vez por año. No necesariamente subirla siempre, pero sí evaluarla contra el mercado.

---

## ¿Cuánto subir?

Depende de cuánto tiempo pasó y de cuánto te alejaste del mercado, pero como referencia:

- **Ajuste anual inflacionario:** 15-25% (según inflación del país)
- **Actualización de skills o especialización:** 20-40%
- **Reposicionamiento de mercado (pasar de generalista a especialista):** hasta 100%

Mi recomendación: no subas menos del 20% si vas a subir. Una subida del 5-10% apenas se nota y no justifica la conversación incómoda.

---

## Cómo comunicárselo a clientes actuales

La forma más directa funciona mejor:

> "Hola [nombre], te escribo porque a partir de [fecha] voy a actualizar mis tarifas. Mi nueva tarifa será de [precio nuevo]. Quería avisarte con anticipación para que puedas planificar tu presupuesto.
>
> Si tenés algún proyecto en mente que quieras arrancar antes de esa fecha, con gusto lo mantenemos con la tarifa actual."

Puntos clave:
- Avisá con 30-60 días de anticipación
- No te disculpes por subir el precio
- Ofrecé la tarifa vieja como ventaja para proyectos que arranquen antes

---

## Qué hacer si el cliente dice que no puede pagar más

Dos opciones honestas:

**Opción 1 — Reducir el scope:**
> "Entiendo. Podríamos ajustar el alcance de los proyectos a lo que cabe en tu presupuesto actual."

**Opción 2 — Aceptar el final de la relación:**
> "Entiendo completamente. Si en algún momento tu presupuesto cambia, estaré disponible. Fue un placer trabajar juntos."

No bajes el precio porque un cliente se queje. Si bajás ante el primer reclamo, aprendés que quejarse funciona, y el cliente aprende lo mismo.

---

## La estrategia de los nuevos clientes

La forma más fácil de subir tarifas: cobrar la tarifa nueva solo a los clientes nuevos. Los clientes actuales siguen con la tarifa vieja hasta que finalizan el proyecto o llega el momento de renovar.

Esto tiene varias ventajas:
- No genera fricción con clientes establecidos
- Empezás a validar que el mercado acepta la nueva tarifa
- En 6-12 meses, todos tus nuevos proyectos están a la tarifa nueva

---

## El experimento del 20%

Si tenés dudas, hacé esto: en la próxima cotización que mandes a un cliente nuevo, subí el precio un 20%.

Si aceptan sin negociar → tu precio anterior era bajo. Subí a todos.
Si negocian pero aceptan → bien, le encontraste el límite.
Si rechazan → aprendiste el techo de ese segmento.

El rechazo no duele. Lo que duele es ganar menos de lo que merecés durante años por miedo a preguntar.
`,
  },
  {
    categorySlug: 'propuestas',
    title: 'Cómo definir el scope de un proyecto (y evitar el scope creep para siempre)',
    slug: 'scope-proyecto-evitar-scope-creep',
    excerpt: 'El scope creep es la causa número uno de proyectos que no son rentables. Esta guía te enseña a definir el alcance con precisión y a gestionar los cambios sin perder la relación con el cliente.',
    tags: ['scope', 'alcance', 'gestión', 'propuesta'],
    readTimeMinutes: 6,
    content: `## ¿Qué es el scope creep y por qué arruina proyectos?

El scope creep es cuando un proyecto crece más allá de lo acordado originalmente, sin que el presupuesto crezca con él.

Empezás con "un sistema de gestión de tareas" y terminás construyendo también reportes, notificaciones push, integración con Google Calendar, y un módulo de chat interno — todo incluido en el precio original.

El resultado: trabajás el doble, cobrás lo mismo, y el cliente igual queda insatisfecho porque "había tantas cosas más".

---

## La raíz del problema: el scope ambiguo

"Quiero una aplicación web para gestionar mis clientes."

Esta frase puede significar 50 horas de trabajo o 500. Sin definición clara, ambos pueden tener razón.

El scope creep no siempre viene de clientes de mala fe. La mayoría de las veces es consecuencia directa de una definición de alcance ambigua desde el inicio.

---

## Cómo escribir un scope que proteja a ambas partes

### Especificidad sobre funcionalidades

Malo:
> Sistema de gestión de facturas

Bueno:
> Sistema de gestión de facturas que incluye:
> - Creación y edición de facturas con hasta 10 líneas de items
> - Estados: borrador, enviada, pagada, vencida
> - Descarga en PDF
> - Listado con filtros por estado y fecha
> - NO incluye: envío automático por email, integración con sistemas contables, portal del cliente

### Número de pantallas o módulos

Si es una aplicación, especificá exactamente cuántas pantallas o secciones incluye. "La aplicación tendrá 5 pantallas: Dashboard, Clientes, Proyectos, Facturas y Configuración."

### Número de revisiones

"El proyecto incluye 2 rondas de revisión por entregable. Cambios adicionales se cotizan por separado."

### Qué NO incluye (igual de importante)

Listar explícitamente lo que no está incluido es tan importante como listar lo que sí está. Anticipá las cosas que más frecuentemente los clientes asumen como incluidas y aclaralas:

> **No incluye:** migración de datos históricos, capacitación del equipo, mantenimiento posterior a la garantía de 30 días, integraciones con terceros no especificadas.

---

## Cómo manejar un pedido de cambio

Cuando un cliente pide algo que no está en el scope, el proceso correcto es:

**Paso 1: Escuchar sin comprometerse**
> "Entiendo lo que necesitás. Dejame evaluar el impacto en el proyecto y te doy una respuesta en [tiempo]."

**Paso 2: Evaluar si cabe en lo existente**
Si el cambio es mínimo (menos de 30 min de trabajo), muchas veces vale la pena incluirlo como gesto de buena voluntad y decirlo explícitamente:

> "Para este caso puntual lo incluyo sin costo adicional, pero si hay más cambios de este tipo en el futuro los voy a cotizar."

**Paso 3: Cotizar si es significativo**
> "Este cambio implicaría [X horas/días] adicionales de trabajo. Eso está fuera del alcance original, así que lo cotizaría en [$X]. ¿Lo agrego como una fase adicional o lo dejamos para después?"

---

## El Change Order

Para cambios formales en proyectos en curso, usá un Change Order: un mini-documento que describe el cambio, el tiempo adicional y el costo.

\`\`\`
CHANGE ORDER #1 — [nombre del proyecto]
Fecha: [fecha]

Descripción del cambio: Agregar módulo de reportes mensual con exportación a Excel
Trabajo adicional estimado: 12 horas
Costo adicional: $XXX
Impacto en plazo: +3 días hábiles

Aprobado por: _________________  Fecha: ___________
\`\`\`

Tenerlo en papel (o email con confirmación) protege a ambas partes y mantiene el proyecto dentro de lo que se puede entregar.

---

## La conversación que más cuesta tener

Cuando el cliente pide un cambio importante y dice "pero pensé que estaba incluido":

> "Entiendo la confusión. Mirando el contrato, el alcance incluye [A y B], pero lo que pedís es [C], que no está especificado. No es un reproche — estas cosas pasan cuando los proyectos evolucionan. Lo que propongo es [solución: cotizar por separado / incluirlo en siguiente fase / negociar]. ¿Qué preferís?"

La clave: no es un conflicto, es una aclaración. Mantenelo en ese tono y la mayoría de los clientes lo entienden.
`,
  },
  {
    categorySlug: 'finanzas',
    title: 'Cómo estructurar tus cobros: plazos, cuotas y formas de pago',
    slug: 'estructurar-cobros-plazos-cuotas',
    excerpt: 'Cobrar bien es tan importante como trabajar bien. Estos son los modelos de pago más comunes en el mundo freelance y cómo elegir el que mejor funciona para cada tipo de proyecto.',
    tags: ['cobros', 'pagos', 'finanzas', 'modelos'],
    readTimeMinutes: 6,
    content: `## El dinero y el trabajo tienen que ir juntos

Una de las paradojas del trabajo freelance: cuanto más tiempo pasa entre que hacés el trabajo y que cobrás, más riesgo tomás.

La estructura de cobro ideal hace que el dinero fluya proporcionalmente al trabajo entregado. Acá están los modelos más comunes y cuándo usar cada uno.

---

## Modelo 1: Pago por hito (el más recomendado)

El trabajo se divide en etapas y cada etapa tiene su pago.

**Ejemplo para un proyecto de 3 meses:**
- 40% al firmar el contrato (adelanto)
- 30% al completar el backend
- 30% al hacer el deploy final

**Por qué funciona:**
- El dinero fluye con el progreso real
- Si el proyecto se cancela, cobrás por el trabajo hecho
- Genera checkpoints naturales de aprobación

**Cuándo usarlo:** proyectos con entregables claros y separables.

---

## Modelo 2: Pago mensual (retainer)

El cliente paga una cantidad fija mensual por una cantidad definida de horas o entregables.

**Ejemplo:**
> "Retainer mensual: 20 horas de desarrollo por $X. Horas adicionales se facturan a $X/hora."

**Por qué funciona:**
- Predecibilidad de ingresos para vos
- El cliente tiene disponibilidad garantizada
- Ideal para clientes recurrentes

**Cuándo usarlo:** mantenimiento, proyectos en evolución continua, relaciones de largo plazo.

**Cuidado con:** retainers sin límite claro de horas ("cuando te necesite") — terminan siendo caros para vos e impredecibles.

---

## Modelo 3: Precio fijo por proyecto

Un único precio para el proyecto completo, pagado en 2-3 cuotas.

**Ejemplo:**
- 40% adelanto
- 60% al finalizar

**Por qué funciona:**
- Simple de administrar
- El cliente sabe exactamente cuánto paga

**Cuándo usarlo:** proyectos pequeños (menos de 2 semanas) o con scope muy definido.

**Riesgo:** si el proyecto se extiende más de lo esperado, el precio fijo te perjudica. Protegete con un scope bien definido.

---

## Modelo 4: Por hora

Cobrás una tarifa horaria y facturás las horas trabajadas.

**Ejemplo:**
> "Mi tarifa es $X/hora. Registro el tiempo con precisión y envío un informe semanal."

**Por qué funciona:**
- Sin riesgo de subestimar el proyecto
- Transparente para el cliente

**Cuándo usarlo:** proyectos exploratorios, consultoría, trabajo con scope incierto.

**Cuidado con:** clientes que micromanagean o cuestionan cada hora. Necesitás registrar el tiempo de forma precisa.

---

## Las condiciones de pago: qué especificar siempre

### Plazo de pago

Define cuántos días tiene el cliente para pagar desde que emitís la factura:

> "Las facturas tienen un plazo de 5 días hábiles para su pago."

El estándar varía, pero 5-15 días es razonable para freelancers. Más de 30 días es territorio de corporaciones y crea problemas de flujo de caja.

### Moneda

Especificá siempre en qué moneda. En países con alta inflación, considera facturar en dólares o con cláusula de actualización.

### Medio de pago

Especificá cómo querés recibir el pago: transferencia bancaria, billetera virtual, plataforma de pagos. Cuanto más simple para el cliente, antes pagás.

---

## Qué hacer cuando el cliente no paga en el plazo

**Día 1 después del vencimiento:**
> "Hola [nombre], quería consultarte si tuviste algún problema con el pago que vence hoy. Cualquier inconveniente, avisame."

Amable, asume buena fe. La mayoría de los atrasos son por olvido.

**Día 5:**
> "Hola [nombre], te escribo nuevamente por el pago vencido. ¿Podés confirmarme cuándo va a estar disponible? Necesito saberlo para organizarme."

Más directo, pero no agresivo.

**Día 10:**
> "Hola [nombre], el pago lleva 10 días de retraso. Necesito que esto se resuelva antes de continuar con el trabajo. ¿Podemos hablar hoy?"

A este punto, pausás el trabajo hasta que paguen.

---

## El registro en Orkpad

Usá el módulo de Finanzas para:
- Crear facturas con fecha de vencimiento
- Ver qué está pendiente de cobro
- Registrar los pagos cuando entren
- Tener historial por cliente

Un freelancer que sabe exactamente cuánto le deben y cuándo vence es un freelancer que tiene el control de su negocio.
`,
  },
  {
    categorySlug: 'crecimiento',
    title: 'Cómo conseguir tus primeros clientes como freelancer',
    slug: 'conseguir-primeros-clientes',
    excerpt: 'El primer cliente siempre es el más difícil. Esta guía te da estrategias concretas para conseguir tus primeros proyectos sin experiencia ni cartera de clientes.',
    tags: ['clientes', 'crecimiento', 'prospección', 'networking'],
    readTimeMinutes: 7,
    content: `## El problema del "necesito experiencia para conseguir experiencia"

Todo freelancer empieza sin clientes. No hay cartera, no hay testimoniales, no hay referencias. Y muchos se quedan paralizados en ese punto esperando que alguien los encuentre.

La realidad: los primeros clientes no vienen solos. Hay que ir a buscarlos, y hay formas concretas de hacerlo que funcionan.

---

## Por dónde empezar: tu red cercana

El primer cliente casi siempre está más cerca de lo que creés.

**Paso 1: Hacé una lista de 30 personas** que conocés y que podrían necesitar lo que hacés — o que conocen a alguien que lo necesita. Excompañeros de trabajo, amigos con emprendimientos, conocidos en LinkedIn, familiares con negocios.

**Paso 2: Escribiles un mensaje directo y específico:**

> "Hola [nombre], estoy lanzando mi servicio de [desarrollo web / diseño / etc.]. Si conocés a alguien que esté buscando esto o que tenga un proyecto en mente, me sería muy útil que me lo presentaras. ¡Gracias de antemano!"

No estás pidiendo trabajo directamente — estás pidiendo una introducción. Es menos incómodo para ellos y más efectivo para vos.

---

## Plataformas freelance para los primeros proyectos

Las plataformas tipo Workana, Freelancer o Upwork tienen mala reputación por los precios bajos, pero son útiles para una sola cosa: **conseguir los primeros testimoniales y cartera**.

### Estrategia para los primeros 3 proyectos en plataformas

1. **Aplicá a proyectos pequeños y bien definidos** — no los más grandes ni los más pagos. Buscá proyectos donde el scope sea claro y el cliente no pida mucha experiencia previa.

2. **Escribí propuestas personalizadas** — el 90% de las propuestas en estas plataformas son genéricas. Mencioná algo específico del proyecto del cliente.

3. **Fijate en las reviews más que en el dinero** — en los primeros 3 proyectos, el objetivo es conseguir 5 estrellas y un testimonial con métricas. El dinero viene después.

4. **Entregá algo extra** — un documento de handover bien hecho, una guía de uso, un video explicativo. Algo que el cliente no esperaba y que genera una review entusiasta.

---

## LinkedIn: la plataforma más subestimada

LinkedIn tiene millones de tomadores de decisión buscando proveedores. La mayoría de los freelancers lo usa mal — ponen un perfil y esperan.

### Qué hacer en LinkedIn

**Optimizá el titular:** No pongas "Desarrollador web". Poné "Desarrollo aplicaciones web para empresas de e-commerce | React + Node.js".

**Publicá contenido útil:** Un post por semana sobre algo que aprendiste, un problema que resolviste, o un consejo práctico. No tiene que ser largo. Lo importante es la consistencia.

**Conectate estratégicamente:** Buscá fundadores de startups, dueños de agencias, gerentes de producto en empresas medianas. Mandá una solicitud de conexión con una nota personalizada.

**Escribí a personas en tu red con contexto:**

> "Hola [nombre], vi que estás en el rubro de [X]. Yo trabajo con empresas similares desarrollando [solución concreta]. ¿Tenés 15 minutos para una llamada rápida? No para venderte nada, sino para ver si puedo ser útil en algún punto."

---

## Grupos y comunidades online

Hay comunidades donde los clientes están buscando activamente freelancers:

- **Grupos de Facebook** de emprendedores, e-commerce, startups en tu país
- **Comunidades de Slack** de industrias específicas (SaaS, startups, marketing)
- **Reddit** — subreddits como r/startups, r/entrepreneurship, r/forhire
- **Discord** de comunidades tecnológicas o de nicho

La clave: **no llegues a vender**. Participá, respondé preguntas, aportá valor. Cuando alguien pregunta "¿alguien conoce un desarrollador que haga X?", estás posicionado para responder.

---

## El portfolio que cierra proyectos (aunque no tengas clientes)

No tener clientes no significa no poder tener portfolio.

**Proyecto propio:** Construí algo que resuelva un problema real, aunque no tengas cliente. Un tool, una app, un template. Documentalo bien y publicalo.

**Proyecto de causa:** Ayudá a una ONG o emprendimiento social. Cobrá menos o nada, pero documentá el proceso y el resultado.

**Case study ficticio pero real:** Elegí un problema conocido de una empresa existente (un e-commerce con proceso de checkout malo, por ejemplo) y construí cómo lo resolverías. No es mentira — es demostrar capacidad.

---

## La regla de los 90 días

Si sos nuevo en el mundo freelance, los primeros 90 días son los más difíciles. Es normal. La consistencia en estas actividades hace la diferencia:

| Actividad | Frecuencia sugerida |
|-----------|---------------------|
| Contactar personas de la red | 5 por semana |
| Aplicar a proyectos en plataformas | 3-5 por semana |
| Publicar en LinkedIn | 1 por semana |
| Participar en comunidades | Diario (15 min) |

No necesitás hacer todo. Elegí 2 o 3 canales y sé constante en ellos durante 90 días. Los resultados siempre llegan más tarde de lo esperado, pero llegan.

---

## Lo que no funciona (para que no pierdas tiempo)

**Esperar a que te encuentren:** No tenés el volumen de contenido ni la autoridad de marca para que las oportunidades lleguen solas. Al principio, hay que salir a buscar.

**Mandar CVs a empresas:** El modelo de "busco trabajo" no funciona para el mundo freelance. Tenés que posicionarte como proveedor, no como empleado.

**Bajar el precio para ganar proyectos:** Funciona a corto plazo, pero crea un ciclo donde siempre atraés clientes que buscan el precio más bajo. Mejor trabajar la propuesta de valor.

Recordá: el primer cliente siempre es el más difícil. El segundo es mucho más fácil. Y con 5 proyectos en tu cartera, el juego cambia completamente.
`,
  },
  {
    categorySlug: 'finanzas',
    title: 'Cómo lograr cobros recurrentes de clientes',
    slug: 'cobros-recurrentes-clientes',
    excerpt: 'El ingreso recurrente es el sueño de todo freelancer. Acá te explicamos cómo estructurar tu oferta y tus relaciones para que los clientes sigan pagando mes a mes.',
    tags: ['cobros', 'recurrencia', 'retainer', 'ingresos'],
    readTimeMinutes: 7,
    content: `## El problema del ingreso freelance tradicional

El modelo clásico del freelancer es cobrar por proyecto. Terminás uno, buscás el siguiente. Terminás otro, buscás el siguiente. Es un ciclo que nunca para y que genera una montaña rusa de ingresos: meses excelentes seguidos de meses en cero.

La solución no es trabajar más. Es cambiar el modelo: en lugar de cobrar por proyectos únicos, estructurá relaciones de largo plazo con cobros mensuales.

---

## Por qué los clientes aceptan pagar mensualmente

La pregunta que se hacen muchos freelancers es: "¿por qué un cliente me va a pagar todos los meses si el proyecto ya terminó?"

La respuesta: porque el proyecto nunca termina realmente.

Todo sistema digital necesita mantenimiento, actualizaciones, mejoras, soporte. Todo negocio en crecimiento tiene necesidades nuevas todos los meses. El cliente que ya trabajó con vos y confía en vos prefiere tenerte disponible garantizadamente a tener que buscar alguien nuevo cada vez.

---

## Los 4 modelos de cobro recurrente para freelancers

### Modelo 1: Retainer de mantenimiento

El cliente paga una cantidad fija mensual por mantenimiento del sistema que vos desarrollaste.

**Qué incluye típicamente:**
- Actualizaciones de seguridad y dependencias
- Corrección de bugs menores
- Tiempo de respuesta garantizado (ej: 24 horas hábiles)
- 2-4 horas de pequeñas mejoras por mes

**Precio sugerido:** 10-20% del costo del proyecto original, por mes.

> "El retainer de mantenimiento es $X/mes e incluye soporte técnico, actualizaciones de seguridad y hasta 3 horas de mejoras menores. Cambios que requieran más horas se cotizan por separado."

### Modelo 2: Retainer de horas garantizadas

El cliente compra una cantidad de horas por mes a una tarifa con descuento. Las horas no se acumulan (use it or lose it).

**Ventaja para el cliente:** disponibilidad garantizada y tarifa preferencial.
**Ventaja para vos:** ingreso predecible aunque el cliente no consuma todo.

**Estructura típica:**
- 10 horas/mes — tarifa normal
- 20 horas/mes — 10% de descuento
- 40 horas/mes — 15% de descuento

### Modelo 3: Retainer de resultado o rol

El cliente te contrata para cumplir un rol específico mes a mes: CTO part-time, desarrollador dedicado, tech lead. No vendés horas, vendés responsabilidad.

**Este modelo cobra más** porque no es una relación transaccional — es una relación estratégica.

### Modelo 4: Producto como servicio (SaaS o herramienta)

Construís algo una vez y cobrás por el acceso. El caso más común para freelancers es construir un sistema a medida para un cliente y cobrar por su uso mensual en lugar de venderlo de forma plana.

---

## Cómo proponer el retainer después de un proyecto

El momento ideal para proponer un retainer es **antes de entregar el proyecto final**.

**Mal:** "¿Te interesaría contratar mantenimiento?"

**Bien:**
> "Al momento de entrega, me gustaría presentarte un plan de continuidad para que el sistema siempre esté actualizado y tengas soporte cuando lo necesites. Lo llamo el Plan de Mantenimiento Mensual. ¿Te parece bien si lo incluyo en la propuesta final junto con el proyecto?"

Presentalo como parte natural del proceso de entrega, no como un add-on de último momento.

---

## Qué incluir en el contrato de retainer

Un retainer sin contrato claro genera más problemas que el proyecto inicial. Especificá:

**Duración mínima:** Tres meses mínimos es razonable. Esto te protege de que el cliente cancele al primer mes.

**Qué incluye y qué no:** Sé específico. "Soporte técnico" puede significar muchas cosas. Defínilo:

> "Incluye: respuesta a consultas técnicas por email en 24 horas hábiles, corrección de bugs en el sistema entregado, actualizaciones de dependencias de seguridad. No incluye: nuevas funcionalidades, cambios de diseño, trabajo en sistemas de terceros."

**Condiciones de cancelación:** Cuánto preaviso se necesita (30 días es estándar).

**Método y fecha de pago:** El 1 de cada mes, transferencia bancaria, con factura el último día del mes anterior.

---

## Cómo evitar que el retainer se convierta en trabajo gratis

El riesgo del retainer: el cliente empieza a pedir más de lo que el acuerdo incluye.

Solución: **llevar registro de las horas o tickets trabajados** y compartirlo mensualmente con el cliente. Un informe de 5 líneas es suficiente:

> "Resumen del mes:
> - Bug en módulo de login → resuelto en 2 horas
> - Actualización de dependencias → 1 hora
> - Consulta de configuración de servidor → 30 min
> - Total: 3.5 hs de las 4 incluidas
>
> Disponibilidad para el mes que viene: 4 horas."

Este reporte tiene dos funciones: demuestra el valor que generás y actúa como límite natural cuando el cliente quiere más.

---

## La conversación de renovación anual

Una vez al año, revisá el retainer con el cliente:

> "Estamos llegando al año de trabajo juntos. Quería hacer un balance: [lista de lo que logramos juntos]. Dado el crecimiento del sistema y los costos, voy a ajustar el retainer a $X a partir de [fecha]. ¿Seguimos?"

La clave: llegás con logros concretos, no solo con el pedido de aumento.

---

## Cuántos retainers podés manejar al mismo tiempo

La respuesta depende de tu tiempo disponible, pero como referencia:

| Tipo de retainer | Horas/mes típicas | Máx simultáneos |
|------------------|-------------------|-----------------|
| Mantenimiento básico | 4-8 hs | 5-8 clientes |
| Horas garantizadas | 10-20 hs | 2-4 clientes |
| Rol / CTO part-time | 20-40 hs | 1-2 clientes |

El objetivo no es tener muchos retainers. Es tener los suficientes para cubrir tus gastos fijos con ingresos predecibles, y usar el tiempo restante para proyectos nuevos.

Con dos o tres retainers bien estructurados, podés tener una base de ingreso estable que transforma completamente la experiencia del trabajo freelance.
`,
  },
  {
    categorySlug: 'contratos',
    title: 'Cómo hacer un contrato freelance desde cero',
    slug: 'como-hacer-contrato-freelance',
    excerpt: 'Nunca trabajés sin contrato. Esta guía te explica paso a paso cómo armar un contrato simple, efectivo y profesional para cualquier proyecto freelance.',
    tags: ['contrato', 'legal', 'freelance', 'protección'],
    readTimeMinutes: 8,
    content: `## Por qué el contrato importa más de lo que creés

La mayoría de los freelancers que tienen problemas con clientes — pagos que no llegan, alcance que se expande sin fin, proyectos que se cancelan sin pagar — tienen algo en común: no tenían un contrato claro.

El contrato no es un signo de desconfianza. Es el documento que define las reglas de juego para ambas partes. Un cliente serio y profesional no solo va a aceptar que pidas un contrato — lo va a agradecer.

---

## Los principios de un buen contrato freelance

Antes de entrar en las cláusulas, tres principios que guían todo lo demás:

**1. Simple es mejor que completo.** Un contrato de 2 páginas que ambos entienden es mejor que uno de 20 páginas que nadie lee.

**2. Específico es mejor que general.** "Se entregará el proyecto en tiempo y forma" no dice nada. "Se entregará el prototipo funcional el 15 de junio y el deploy final el 30 de junio" sí.

**3. Cubrí los escenarios más probables, no todos los posibles.** No podés anticipar todo. Cubí las situaciones que más frecuentemente generan conflictos: cambios de alcance, pagos atrasados, cancelaciones.

---

## La estructura básica del contrato

### Sección 1: Identificación de las partes

Nombre completo (o razón social), documento de identidad o CUIT/CUIL, dirección de email, ciudad.

> "Entre [tu nombre completo], DNI/CUIL [número], en adelante "el Proveedor", y [nombre del cliente], DNI/CUIL [número], en adelante "el Cliente", se acuerda lo siguiente:"

### Sección 2: Descripción del trabajo

Una descripción clara pero concisa de qué vas a hacer. Podés referenciar la propuesta:

> "El Proveedor desarrollará el sistema de gestión de turnos descripto en la propuesta enviada el [fecha], cuya copia integra el presente contrato como Anexo I."

### Sección 3: Alcance — lo que incluye y lo que NO incluye

Esta es la cláusula más importante del contrato. Sé explícito en ambas direcciones.

**Incluye:**
- Lista concreta de funcionalidades o entregables
- Número de pantallas o módulos
- Número de rondas de revisión (ej: 2 por entregable)

**No incluye:**
- Migración de datos históricos
- Capacitación del equipo
- Mantenimiento posterior a los 30 días de garantía
- Integraciones con sistemas no mencionados expresamente

### Sección 4: Plazos

Listá los hitos con fechas:

> | Hito | Fecha estimada |
> |------|----------------|
> | Kickoff y definición técnica | [fecha] |
> | Primer entregable (backend) | [fecha] |
> | Frontend integrado | [fecha] |
> | Deploy y cierre | [fecha] |
>
> Los plazos están condicionados a que el Cliente provea el feedback y las aprobaciones en un máximo de 5 días hábiles. Las demoras del Cliente extienden los plazos proporcionalmente.

### Sección 5: Precio y condiciones de pago

> - Monto total: $[X]
> - Adelanto: $[X] (40% del total), abonado antes del inicio
> - Segunda cuota: $[X] (30%), al completar el hito intermedio
> - Cuota final: $[X] (30%), al momento del deploy
> - Moneda: [pesos / dólares]
> - Método de pago: transferencia bancaria a CBU [número]

### Sección 6: Cambios y trabajo adicional

> "Cualquier cambio al alcance original debe acordarse por escrito. El Proveedor evaluará el impacto en plazo y costo y lo comunicará antes de iniciar. Cambios que impliquen más de 2 horas de trabajo se cotizarán por separado."

### Sección 7: Propiedad intelectual

> "Los derechos sobre el trabajo entregado se transfieren al Cliente una vez acreditado el pago total del contrato. Hasta ese momento, el Proveedor retiene todos los derechos sobre el trabajo producido."

### Sección 8: Cancelación

> "En caso de cancelación por el Cliente, se facturará el trabajo realizado hasta la fecha. El adelanto no es reembolsable. En caso de cancelación por el Proveedor, se devolverá el adelanto proporcional al trabajo no realizado."

### Sección 9: Garantía

> "El Proveedor garantiza el correcto funcionamiento del sistema entregado por 30 días desde el deploy. Durante ese período, corregirá sin costo adicional los bugs que sean resultado directo del trabajo realizado."

### Sección 10: Firma y aceptación

> "Las partes declaran haber leído y comprendido el presente contrato y manifiestan su conformidad. La confirmación del adelanto o el inicio del trabajo implica la aceptación de estos términos."

Firma física, firma digital o simplemente confirmación por email. Para proyectos de hasta $5000, la confirmación escrita por email suele ser suficiente.

---

## Herramientas para crear y firmar contratos

**Google Docs:** Gratis, fácil de compartir, permite comentarios y edición colaborativa. Para muchos freelancers es suficiente.

**Docusign / HelloSign:** Para firma digital formal. Útil para proyectos grandes o clientes corporativos.

**Notion / Notion Templates:** Si usás Notion, podés tener plantillas que se generan con un duplicado.

---

## La pregunta que más miedo da: ¿y si el cliente no quiere firmar?

Dos posibilidades:

**El cliente es serio pero le parece mucho papeleo:** Reducí el contrato a lo mínimo esencial — una página con el alcance, el precio y las condiciones de pago. La mayoría de las veces eso alcanza.

**El cliente se niega a cualquier acuerdo escrito:** Esa es una señal de alerta importante. Un cliente profesional no tiene razones para resistirse a tener las cosas por escrito. Si insiste en trabajar "de palabra", evaluá si vale la pena tomar ese riesgo.

El contrato más simple que sirve es mejor que ningún contrato. Empezá con algo básico y mejoralo con cada proyecto.
`,
  },
  {
    categorySlug: 'propuestas',
    title: 'Cómo hacer una propuesta freelance que gana proyectos',
    slug: 'como-hacer-propuesta-freelance',
    excerpt: 'Una propuesta no es un presupuesto. Es un documento de ventas. Esta guía te enseña a estructurar propuestas que convierten, con plantilla incluida.',
    tags: ['propuesta', 'ventas', 'cotización', 'freelance'],
    readTimeMinutes: 7,
    content: `## La diferencia entre una propuesta y un presupuesto

Un presupuesto dice cuánto cuesta algo.
Una propuesta dice por qué vale la pena invertir en algo, con quién, y cómo va a hacerse.

Los freelancers que pierden proyectos por precio casi siempre están enviando presupuestos cuando deberían enviar propuestas.

---

## Los 3 errores más comunes en propuestas freelance

**Error 1: Empezar por el precio.**
El cliente no está listo para evaluar un precio si todavía no entiende qué va a recibir a cambio. El precio viene al final, después de que el cliente ya está convencido del valor.

**Error 2: Hablar de tecnología en lugar de resultados.**
"Voy a usar React con TypeScript, MongoDB y un servidor en AWS" no le dice nada al cliente de negocio. "Tu equipo va a poder actualizar el catálogo de productos en 2 minutos sin depender del área técnica" sí.

**Error 3: Propuesta genérica.**
Si podés copiar y pegar la propuesta para otro cliente, no va a convertir. El cliente tiene que sentir que entendés su situación específica.

---

## La estructura de una propuesta que gana

### 1. Resumen ejecutivo (5-7 líneas)

Una síntesis de qué vas a hacer y qué problema resuelve. Es lo primero que leen y lo que determina si siguen leyendo.

> "Esta propuesta describe el desarrollo de un sistema de gestión de pedidos para [empresa]. Hoy el proceso se hace por WhatsApp y genera errores de comunicación y demoras. La solución reducirá el tiempo de procesamiento de cada pedido de 8 minutos a menos de 2, y dará al equipo visibilidad en tiempo real sobre el estado de cada entrega."

### 2. Entendimiento del problema

Mostrá que entendés el contexto del cliente mejor de lo que ellos esperaban.

- ¿Cuál es el problema de negocio?
- ¿Qué impacto tiene hoy ese problema?
- ¿Qué pasa si no se resuelve?

No tenés que saber todo. Pero tenés que demostrar que escuchaste y reflexionaste.

### 3. Solución propuesta

Describí qué vas a construir, con foco en los resultados y no en la tecnología.

Estructuralo por módulos o fases si el proyecto es grande. Cada módulo tiene su descripción funcional y su entregable.

### 4. Alcance detallado

El corazón técnico de la propuesta:

**Incluye:**
- Lista específica de funcionalidades
- Número de pantallas o módulos
- Número de rondas de revisión

**No incluye:**
- Las cosas que comúnmente los clientes asumen como incluidas

### 5. Plan de trabajo con hitos y fechas

Una tabla simple:

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| 1 | Análisis y arquitectura | Documento técnico aprobado |
| 2-3 | Desarrollo del módulo A | Demo funcional en staging |
| 4-5 | Módulo B + integración | Sistema completo en testing |
| 6 | QA y deploy | Sistema en producción |

### 6. Inversión

Nunca llamarlo "precio". Llamalo inversión, honorarios o plan de trabajo.

Desglosalo por fase o módulo, no un solo número:

> - Etapa 1 — Análisis y diseño técnico: $X
> - Etapa 2 — Desarrollo: $X
> - Etapa 3 — QA y deploy: $X
> - **Total: $X**
>
> Condiciones: 40% adelanto antes de comenzar, 30% al completar la Etapa 2, 30% al deploy final.

### 7. Sobre mí

No un CV. Una narrativa de por qué sos la persona indicada para **este** proyecto en particular.

> "Trabajé con 3 empresas de logística en los últimos 2 años, incluyendo [nombre], donde desarrollé un sistema similar que redujo los errores de despacho en un 60%. Entiendo los desafíos operativos de este tipo de proyectos."

Si no tenés experiencia directa en la industria, enfocate en el tipo de problema:

> "Especializado en sistemas de gestión y automatización de procesos manuales."

### 8. Próximos pasos

Terminá con claridad sobre qué sigue:

> "Si esta propuesta se ajusta a lo que buscás, el siguiente paso es confirmar el adelanto y agendar una llamada de kickoff. Si hay algún punto que quieras ajustar, podemos hablarlo. ¿Te parece bien si cerramos esto esta semana?"

---

## El formato importa

Una propuesta bien diseñada comunica profesionalismo antes de que el cliente lea una sola línea.

- **Usá una plantilla limpia** con tu nombre o logo, los datos del cliente y la fecha.
- **Párrafos cortos.** Ningún párrafo de más de 4-5 líneas.
- **Tablas para el scope y los hitos.** Son más fáciles de leer que las listas de texto.
- **PDF para enviar.** No un Word editable. El PDF comunica que es un documento terminado y profesional.

---

## Cuánto tiempo dedicarle a una propuesta

No todas las propuestas valen el mismo esfuerzo:

| Tamaño del proyecto | Tiempo en propuesta |
|---------------------|---------------------|
| Menos de $1000 | 30-60 minutos |
| $1000 - $5000 | 1-2 horas |
| Más de $5000 | 3-5 horas |

Para proyectos grandes, la propuesta es parte del trabajo de ventas. Vale la pena invertir tiempo en ella.

---

## El seguimiento

Enviaste la propuesta y no hay respuesta después de 3 días. Escribí:

> "Hola [nombre], quería saber si tuviste tiempo de revisar la propuesta. Estoy disponible si querés que hablemos de algún punto en detalle o si necesitás algún ajuste."

Simple, sin presión. El 40% de los proyectos que conseguirás en tu carrera van a necesitar al menos un seguimiento.
`,
  },
  {
    categorySlug: 'propuestas',
    title: 'Cómo calcular un presupuesto sin quedarte corto',
    slug: 'calcular-presupuesto-freelance',
    excerpt: 'Subestimar el tiempo es el error que más dinero le cuesta a los freelancers. Esta guía te enseña a calcular presupuestos reales que cubren todo el trabajo, incluido lo que siempre olvidamos.',
    tags: ['presupuesto', 'precios', 'tarifas', 'cálculo'],
    readTimeMinutes: 6,
    content: `## El problema de subestimar

Aceptás un proyecto por $3000 pensando que son 30 horas de trabajo. A la semana 3, llevás 50 horas y todavía falta la mitad. Terminás trabajando el equivalente a $15/hora cuando tu tarifa debería ser el doble.

Esto no es mala suerte. Es un problema de cálculo que tiene solución.

---

## Por qué los freelancers siempre se quedan cortos

**Razón 1: Solo contamos las horas de "hacer".**
Olvidamos las horas de reuniones, emails, correcciones, investigación, documentación, deploy, y comunicación con el cliente. En proyectos reales, estas horas pueden representar el 30-50% del tiempo total.

**Razón 2: Somos optimistas sobre los imprevistos.**
El cliente va a pedir cambios. Habrá un bug difícil de reproducir. La API del tercero no funciona como dice la documentación. Los imprevistos son predecibles en su existencia, aunque no en su forma.

**Razón 3: No contamos el tiempo de venta y administración.**
El tiempo que tardaste en hacer la propuesta, la reunión inicial, el contrato, la facturación — todo eso es parte del costo del proyecto.

---

## El método de estimación por componentes

En lugar de estimar el proyecto como una unidad, descomponelo en partes lo más pequeñas posible.

**Ejemplo — Sistema de gestión de clientes:**

| Componente | Tiempo estimado |
|------------|----------------|
| Análisis y diseño técnico | 4 hs |
| Base de datos y modelos | 3 hs |
| API de usuarios (CRUD) | 5 hs |
| API de clientes (CRUD) | 4 hs |
| Frontend — listado de clientes | 4 hs |
| Frontend — detalle y edición | 5 hs |
| Frontend — búsqueda y filtros | 3 hs |
| Autenticación (login/logout) | 4 hs |
| Deploy y configuración | 3 hs |
| Testing y correcciones | 4 hs |
| **Subtotal horas técnicas** | **39 hs** |

Ahora aplicamos los multiplicadores de la realidad:

| Factor | Porcentaje |
|--------|------------|
| Reuniones y comunicación | +15% |
| Revisiones y ajustes del cliente | +20% |
| Imprevistos técnicos | +15% |
| Administración y facturación | +5% |
| **Total ajustado** | **+55%** |

39 hs × 1.55 = **60 hs reales**.

Si tu tarifa es $50/hora, el precio del proyecto debería ser $3000, no $1950.

---

## Tu tarifa por hora: cómo calcularla correctamente

Tu tarifa no puede ser solo "lo que cobra la competencia". Tiene que cubrir:

**Gastos fijos mensuales:**
- Alquiler (o parte proporcional si trabajás desde casa)
- Internet, teléfono, software, herramientas
- Contador, servicios financieros
- Seguro médico, aportes

**Horas realmente facturables:**
Un freelancer full-time trabaja ~160 horas al mes, pero no todas son facturables. Contabilizando ventas, administración, capacitación y tiempo no asignado, en la práctica son **80-100 horas facturables** al mes.

**Fórmula básica:**

\`\`\`
Tarifa mínima = (Gastos fijos + Sueldo objetivo) / Horas facturables mensuales
\`\`\`

Si tus gastos son $1000/mes y querés ganar $4000 netos, necesitás generar $5000/mes. Con 100 horas facturables, tu tarifa mínima es $50/hora.

Ese es el piso. La tarifa real debería ser mayor para contemplar meses con menos trabajo.

---

## El colchón de riesgo

Todo presupuesto debería incluir un margen de riesgo explícito, no oculto.

**En proyectos conocidos** (tecnología que dominás, scope bien definido): +20%

**En proyectos medianos** (algo nuevo, cliente nuevo): +30%

**En proyectos con alta incertidumbre** (integración con sistemas de terceros, migración de datos, requisitos poco claros): +40-50%

No lo escondas. Si el cliente pregunta, explicalo:

> "Incluyo un margen del 25% para contemplar el trabajo de correcciones, comunicación y los imprevistos que siempre aparecen en este tipo de proyectos. Si el proyecto va según lo planeado, ese margen no se usa."

---

## Precio fijo vs. precio por hora

Para proyectos con scope definido, el precio fijo es más predecible para el cliente pero más arriesgado para vos. Por eso el margen de riesgo es crítico.

Para proyectos con scope incierto o trabajo continuo, el precio por hora te protege mejor. Pero necesitás registrar las horas con precisión y reportarlas al cliente.

**Regla práctica:** Si no podés describir el 80% del scope en una lista específica de funcionalidades, no cotices precio fijo.

---

## Cómo manejar cuando el cliente dice "es demasiado"

Primero, entendé si el problema es el total o la estructura de pago:

> "¿El presupuesto total es el problema o preferirías ver cómo estructuramos los pagos de otra manera?"

Si el problema es el total, tenés dos opciones reales:
1. Reducir el scope ("puedo hacer las funcionalidades A, B y C por ese presupuesto; D y E quedarían para una segunda fase")
2. Mantener el precio y pasar al siguiente cliente

Lo que no debería ser una opción es reducir tu tarifa porque el cliente lo pide. Eso solo funciona una vez — y el cliente aprende que presionar da resultados.

---

## Herramienta simple para presupuestar

Antes de enviar cualquier presupuesto, completá esta checklist mental:

- [ ] ¿Listé todos los componentes técnicos?
- [ ] ¿Agregué horas de reuniones y comunicación?
- [ ] ¿Agregué un margen de revisiones y ajustes?
- [ ] ¿Agregué margen de riesgo según la incertidumbre?
- [ ] ¿El precio cubre mi tarifa real (con gastos y tiempo no facturable)?
- [ ] ¿Definí qué pasa si el scope cambia?

Si respondés sí a todo, el número que tenés es un presupuesto honesto. Envialo con confianza.
`,
  },
  {
    categorySlug: 'clientes',
    title: 'Cómo manejar clientes difíciles sin perder la relación',
    slug: 'manejar-clientes-dificiles',
    excerpt: 'Tarde o temprano, todos los freelancers tienen un cliente difícil. Esta guía te da herramientas concretas para resolver conflictos, establecer límites y decidir cuándo terminar una relación.',
    tags: ['clientes', 'conflictos', 'comunicación', 'límites'],
    readTimeMinutes: 7,
    content: `## Primero, la distinción importante

No todos los clientes "difíciles" son iguales. Hay una diferencia crucial entre:

**Cliente exigente:** tiene altos estándares, pide mucho, pero dentro del acuerdo, paga bien y es de buena fe. Este cliente vale la pena.

**Cliente problemático:** cambia de opinión constantemente, no respeta el scope, demora pagos, o es irrespetuoso. Este cliente cuesta más de lo que vale.

El manejo es diferente para cada tipo.

---

## Las 5 situaciones difíciles más comunes y cómo resolverlas

### Situación 1: El cliente que pide "cambios pequeños" infinitos

*El síntoma:* Después de cada entrega, hay "una cosita más" que cambia. Sola, cada pedido parece razonable. En conjunto, son 20 horas de trabajo extra no pago.

*La respuesta:*

> "Con gusto lo ajusto. Antes de hacerlo, te comento que este cambio queda fuera del alcance original del contrato, así que voy a necesitar cotizarlo. Son aproximadamente 3 horas de trabajo. ¿Lo agrego como un adicional al proyecto o lo dejamos para una siguiente fase?"

La primera vez que lo hacés, el cliente puede sorprenderse. La segunda vez, aprende que los cambios tienen costo.

### Situación 2: El cliente que no responde y después aparece urgente

*El síntoma:* Enviaste los wireframes para aprobación. Una semana sin respuesta. De repente: "¿Cuándo lo tenés listo? Lo necesito para mañana."

*La respuesta:*

> "Entiendo la urgencia. Para poder priorizarlo necesito que confirmes los wireframes enviados el [fecha]. Una vez que tenga aprobación, estimo [X] días de trabajo para tener la entrega lista."

No absorbas las demoras del cliente como si fueran tuyas. El contrato debería especificar que las demoras del cliente extienden los plazos — usá esa cláusula.

### Situación 3: El cliente que pide descuento después de acordar el precio

*El síntoma:* Enviaste la propuesta, el cliente aceptó, empezaste el trabajo. A mitad del proyecto: "¿No podemos hacer algo con el precio? Estamos muy justos."

*La respuesta:*

> "Entiendo que el presupuesto tiene sus límites. El precio acordado refleja el trabajo que acordamos. Si necesitamos ajustar el costo, podemos revisar qué funcionalidades podríamos dejar para una segunda fase."

Nunca bajes el precio sin reducir el scope. Si hacés un descuento "de buena voluntad", el cliente aprende que negociar después de acordar es efectivo.

### Situación 4: El cliente que no paga (o demora los pagos)

*El síntoma:* Pasó la fecha de vencimiento de la factura. El cliente "está viendo" o directamente no responde.

*La respuesta escalonada:*

**Día 1 del vencimiento:**
> "Hola [nombre], te consulto si tuviste algún inconveniente con el pago que vence hoy."

**Día 5:**
> "Hola [nombre], el pago todavía no aparece acreditado. ¿Podés confirmarme cuándo lo vas a realizar?"

**Día 10 — pausa del trabajo:**
> "Hola [nombre], el pago lleva 10 días de retraso. Voy a pausar el trabajo hasta que se resuelva el pago. Por favor escribime para coordinar."

Pausar el trabajo es tu palanca más poderosa. Usala sin culpa — es lo que corresponde.

### Situación 5: El cliente irrespetuoso

*El síntoma:* Mensajes agresivos, tono condescendiente, comentarios que cruzan el límite profesional.

*La respuesta:*

> "Quiero que este proyecto salga bien para los dos. Para eso necesito que la comunicación sea siempre en tono profesional. Si hay algo con lo que no estás conforme, podemos hablarlo con calma."

Una vez, en tono firme pero no agresivo. Si persiste, evaluá si querés continuar con ese cliente.

---

## Establecer límites sin destruir la relación

Los límites no son ataques. Son la definición de cómo querés trabajar.

**Lo que más funciona:** establecer los límites antes de que sean necesarios, en el proceso de onboarding:

> "Mi horario de atención es lunes a viernes de 9 a 18. Las consultas las respondo dentro de las 24 horas hábiles. Para emergencias, [canal específico]."

Cuando el cliente manda mensajes a las 11 de la noche y no recibe respuesta, no se sorprende — porque ya sabía cómo funciona.

---

## La conversación difícil: cuando hay que dar malas noticias

Inevitablemente, vas a tener que decirle al cliente algo que no quiere escuchar: una demora, un error, un cambio de estimación.

**Reglas para dar malas noticias:**

1. **Avisá proactivamente.** No esperes a que el cliente pregunte. Llegá con la noticia antes de que la descubra.
2. **Explicá el por qué sin excusas excesivas.** Una línea de contexto es suficiente.
3. **Llegá con solución.** No solo "hay un problema", sino "hay un problema y lo que propongo es [X]".
4. **Fijá el nuevo plazo con precisión.**

**Ejemplo:**
> "Hola [nombre], quería avisarte que el módulo de pagos va a demorarse 3 días más. Encontramos un conflicto con la documentación de la API del banco que nos llevó más tiempo del esperado. El nuevo plazo de entrega es el [fecha]. ¿Hay algo urgente que necesites antes de eso?"

---

## Cuándo terminar una relación con un cliente

Hay situaciones donde lo más profesional es terminar el proyecto.

**Señales de que es momento de salir:**
- El cliente no paga después de múltiples intentos
- El trato es sistemáticamente irrespetuoso
- El scope ha crecido tanto que el proyecto original ya no existe
- El cliente actúa de mala fe (negando acuerdos escritos, haciendo pedidos ilegales o poco éticos)

**Cómo salir:**
> "Después de pensar bien la situación, creo que no somos el fit correcto para continuar este proyecto. Te propongo [opciones: terminar acá con lo que está hecho y un pago proporcional, o traspasar el trabajo a otro profesional]."

Terminar un proyecto antes de tiempo es estresante. Pero seguir con un cliente que te hace daño — económico o emocionalmente — siempre cuesta más que salir a tiempo.

---

## La perspectiva de largo plazo

Los mejores clientes son los que saben trabajar con freelancers. Y los freelancers más exitosos son los que saben distinguir, desde temprano, cuáles son esos clientes — y tienen la confianza para alejarse de los que no lo son.

Cada vez que establecés un límite y lo mantenés, estás construyendo la reputación de un profesional serio. Y los profesionales serios atraen clientes que los tratan como tales.
`,
  },
  {
    categorySlug: 'productividad',
    title: 'Productividad para freelancers: el sistema de 3 bloques',
    slug: 'productividad-sistema-tres-bloques',
    excerpt: 'Sin estructura externa que te organice, el trabajo freelance puede volverse caótico. Este sistema simple te ayuda a tomar el control de tu tiempo y a trabajar con más foco y menos estrés.',
    tags: ['productividad', 'tiempo', 'organización', 'foco'],
    readTimeMinutes: 6,
    content: `## El problema de la libertad sin estructura

La libertad del trabajo freelance es también su mayor riesgo. Sin horarios fijos, sin reuniones obligatorias, sin jefe que supervise, muchos freelancers terminan en uno de dos extremos: trabajando todo el tiempo (y sin apagarse nunca) o procrastinando hasta que la presión los obliga a trabajar en modo pánico.

Ninguno de los dos es sostenible.

La solución no es más disciplina ni más fuerza de voluntad. Es un sistema que funcione con la energía y los ritmos reales, no con la versión idealizada de vos mismo.

---

## El sistema de 3 bloques

El principio es simple: dividí tu día en 3 bloques de trabajo con propósitos distintos. No hay una sola manera de aplicarlo — lo que importa es la separación intencional.

### Bloque 1: Trabajo profundo (deep work)

**Qué es:** El trabajo que requiere máxima concentración y que genera el mayor valor. Código complejo, diseño, escritura, análisis.

**Cuánto:** 3-4 horas. No podés hacer esto más de 4 horas de calidad.

**Cuándo:** A la mañana, cuando tu energía es más alta. (Si sos nocturno, ajustá.)

**Reglas:**
- Sin notificaciones de email ni mensajes
- Sin multitasking
- Una sola tarea a la vez
- Si surge algo urgente, anotalo para después — no lo interrumpas

Este bloque es el núcleo de tu productividad. Protegerlo es tu trabajo más importante del día.

### Bloque 2: Trabajo reactivo

**Qué es:** Emails, mensajes de clientes, revisiones, calls, tareas administrativas.

**Cuánto:** 1-2 horas.

**Cuándo:** Después del bloque profundo, o al final de la tarde.

**Reglas:**
- Procesá todo lo que llegó durante el bloque profundo
- Si una respuesta lleva menos de 2 minutos, respondé ahora
- Si lleva más, agendalo para el próximo bloque reactivo o deep work

Este bloque evita que las notificaciones interrumpan el trabajo real, pero asegura que los clientes reciban respuestas en el día.

### Bloque 3: Trabajo proactivo

**Qué es:** Todo lo que no es urgente pero es importante para tu negocio: desarrollar habilidades, mejorar procesos, hacer seguimiento comercial, trabajar en tu perfil o portfolio.

**Cuánto:** 30-60 minutos.

**Cuándo:** Al final del día, o en los huecos entre proyectos.

Este bloque es el que más se pierde cuando hay presión. Es también el que construye el futuro de tu negocio.

---

## El ritual de inicio de día

La transición de "modo personal" a "modo trabajo" es crítica para el freelancer. Sin una oficina a la que ir, esa transición puede ser invisible — y el trabajo puede arrastrarse hacia el desayuno, la siesta y la cena.

Un ritual de inicio de día efectivo tiene 3 pasos:

**Paso 1: Revisá tu agenda (5 min)**
¿Qué tiene que pasar hoy sí o sí? ¿Hay una deadline? ¿Una reunión?

**Paso 2: Definí una sola prioridad máxima (2 min)**
No tres. No cinco. Una. La tarea que, si la terminás hoy, el día fue exitoso. Todo lo demás es bonus.

**Paso 3: Silenciá notificaciones y comenzá el bloque profundo**
Sin verificar email, sin revisar mensajes. Primero el trabajo, después la bandeja de entrada.

---

## Gestión de proyectos múltiples

La mayoría de los freelancers trabajan con varios clientes simultáneamente. Esto multiplica las interrupciones y la carga mental.

**Estrategia de contextos separados:**
Asigná días o medios días específicos a cada proyecto. El lunes y miércoles son del Cliente A. El martes y jueves del Cliente B. El viernes es para tareas administrativas y trabajo proactivo.

Esto reduce el costo de cambiar de contexto (context switching), que puede consumir hasta el 40% de tu productividad si cambiás entre proyectos varias veces al día.

**Batch de comunicación:**
Respondé emails y mensajes de todos los clientes en el mismo bloque, no uno a la vez a lo largo del día. Un bloque de 45 minutos de emails es más eficiente que 20 interrupciones de 5 minutos.

---

## La gestión de la energía vs. la gestión del tiempo

Los sistemas de productividad tradicionales gestionan tiempo. Los que realmente funcionan gestionan energía.

Preguntate:
- ¿Cuándo tenés más energía creativa? → Bloque profundo
- ¿Cuándo podés hacer trabajo rutinario? → Bloque reactivo
- ¿Cuándo tu energía cae? → Descanso, no más trabajo

Un descanso real (sin pantallas, sin email) de 20 minutos a media jornada puede recuperar 2 horas de calidad de trabajo. No es tiempo perdido — es inversión en productividad.

---

## Herramientas mínimas que funcionan

No necesitás el sistema de GTD completo ni la app de productividad perfecta. Lo que funciona para la mayoría de los freelancers:

**Para tareas:** Una lista simple por día. Papel, Notion, Todoist — lo que te resulte natural.

**Para tiempo:** Un timer o técnica Pomodoro (25 min de trabajo, 5 de descanso) para el bloque profundo.

**Para proyectos y clientes:** Orkpad te permite centralizar el seguimiento de proyectos, tareas y comunicación con clientes, para que no tengas que recordar todo en tu cabeza.

**Para desconectarte:** Un ritual de cierre tan claro como el de inicio. "Guardé lo que estaba haciendo, revisé las tareas de mañana, cierro la computadora." La computadora cerrada es la señal de que el trabajo terminó.

---

## El indicador correcto de productividad

¿Cuántas horas trabajaste hoy? No es el indicador correcto.

¿Cuántas horas facturables completaste? Mejor, pero todavía incompleto.

El indicador correcto es: **¿terminé mi prioridad máxima del día?**

Un día donde terminaste las 2 cosas más importantes es más productivo que un día de 10 horas donde avanzaste en 15 cosas sin terminar ninguna.

La productividad del freelancer no se mide en horas. Se mide en resultados.
`,
  },
  {
    categorySlug: 'crecimiento',
    title: 'De freelancer a consultor: cómo posicionarte para conseguir mejores clientes',
    slug: 'de-freelancer-a-consultor',
    excerpt: 'La diferencia entre cobrar $20/hora y $100/hora no siempre es la calidad del trabajo. Muchas veces es el posicionamiento. Esta guía explica cómo hacer ese salto.',
    tags: ['posicionamiento', 'consultor', 'tarifas', 'crecimiento'],
    readTimeMinutes: 8,
    content: `## El problema del freelancer genérico

"Desarrollador web freelance. Trabajo con React, Node.js, Vue, Angular, Python, Django, WordPress, PHP..."

Este perfil dice todo y no dice nada. El cliente no sabe si sos la persona indicada para su problema. Y cuando no sabe si sos el indicado, va a elegir al más barato.

El posicionamiento es la respuesta a: **"¿Para qué cliente, con qué problema, soy la mejor opción?"**

---

## La paradoja de la especialización

Muchos freelancers creen que especializarse reduce sus oportunidades ("si me especializo en fintech, pierdo los clientes de e-commerce").

La realidad es exactamente la opuesta: la especialización aumenta las oportunidades porque:

1. Los clientes que buscan expertise específico te encuentran a vos y no a 500 generalistas
2. Podés cobrar más porque aportas valor específico, no genérico
3. Cada proyecto hace más fuerte tu especialización (efecto compuesto)

---

## Cómo elegir tu especialización

Tres preguntas:

**¿En qué sos realmente bueno?** (No qué sabés hacer, sino qué hacés mejor que la mayoría)

**¿Qué tipo de proyectos encontrás más interesantes?** (Lo que te interesa, lo hacés mejor y con más energía)

**¿Dónde hay mercado dispuesto a pagar?** (La intersección de lo anterior con lo que el mercado valora)

La especialización puede ser:
- **Por industria:** fintech, salud, e-commerce, logística, SaaS B2B
- **Por tecnología:** React Native, Shopify, plataformas de pago, ML
- **Por tipo de problema:** performance, arquitectura, migraciones, lanzamientos rápidos
- **Por etapa de empresa:** startups en etapa temprana, empresas en crecimiento, corporaciones

---

## El lenguaje del consultor vs. el del ejecutor

Esta es la diferencia más importante y la más difícil de cambiar:

**Ejecutor dice:**
- "Desarrollo aplicaciones web"
- "Tengo 5 años de experiencia con React"
- "¿Cuál es tu stack tecnológico?"

**Consultor dice:**
- "Ayudo a empresas de e-commerce a reducir su tiempo de checkout con aplicaciones optimizadas"
- "Trabajé con 3 plataformas en Latinoamérica que aumentaron su conversión después de migrar su frontend"
- "Cuéntame qué problema de negocio estás tratando de resolver"

El consultor habla en resultados de negocio. El ejecutor habla en tareas técnicas.

---

## Cómo construir credibilidad en tu especialización

### Case studies

No son portfolios de "miré lo bonito que quedó". Son historias de problema-solución-resultado:

> "La empresa X tenía un proceso de onboarding que tardaba 3 días y perdía el 40% de los usuarios en el camino. Rediseñé el flujo y lo redujimos a 4 horas. La tasa de activación subió de 60% a 82% en el primer mes."

### Contenido específico

Escribir sobre temas de tu especialización es la forma más efectiva de construir autoridad. Un artículo técnico sobre un problema específico de fintech es más valioso que 10 artículos genéricos sobre "buenas prácticas de código".

### Testimoniales con métricas

"Gran profesional, lo recomiendo" no es un testimonial. "Redujo el tiempo de carga de nuestra plataforma de 8 segundos a 1.2 segundos, lo que resultó en un aumento del 15% en conversiones" sí lo es.

---

## La trampa de bajar el precio para "entrar" a un mercado

Muchos freelancers bajan su tarifa cuando cambian de especialización "porque aún no tengo experiencia en este nicho".

El problema: los clientes premium no buscan el precio más bajo. Buscan el menor riesgo. Y un precio bajo no reduce el riesgo percibido — en realidad lo aumenta.

En su lugar: ofrecé un proyecto piloto de menor alcance a precio completo:

> "Para que podamos evaluar si somos un buen fit, propongo empezar con [pequeño proyecto o fase inicial]. Así ambos tenemos la oportunidad de trabajar juntos antes de comprometernos con el proyecto completo."

---

## El posicionamiento no es para siempre

Podés cambiar tu especialización. De hecho, lo más probable es que evolucione. Lo importante es que en cualquier momento dado, tengas una respuesta clara a "¿para qué tipo de cliente sos la mejor opción?"

Un posicionamiento claro aunque no sea perfecto es infinitamente mejor que no tener ninguno.

---

## El toolkit del consultor

Para posicionarte como consultor, necesitás:

1. **Perfil claro** — quién ayudás, con qué problema, con qué resultado
2. **Case studies** — 2-3 ejemplos con métricas reales
3. **Proceso** — cómo trabajás (fases, entregables, comunicación)
4. **Propuesta profesional** — no un documento de precios, sino un documento estratégico
5. **Herramientas profesionales** — Orkpad para gestión de clientes, proyectos y facturación

El cliente que paga $100/hora espera un nivel de profesionalismo en cada punto de contacto. Cada detalle cuenta.
`,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Iniciando seed de recursos educativos...\n')

  // 1. Crear categorías
  const categoryIds: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    try {
      const result = await post('/resources/categories', cat)
      categoryIds[cat.slug] = result._id
      console.log(`  ✅  Categoría creada: ${cat.name}`)
    } catch (err: any) {
      console.log(`  ⚠️   Categoría omitida (puede ya existir): ${cat.name} — ${err.message}`)
    }
  }

  // 2. Obtener IDs de categorías existentes si el POST falló
  const catRes = await fetch(`${API_URL}/resources/categories`, { headers })
  const existingCats: { _id: string; slug: string }[] = await catRes.json()
  for (const cat of existingCats) {
    if (!categoryIds[cat.slug]) categoryIds[cat.slug] = cat._id
  }

  console.log('')

  // 3. Crear recursos
  for (const resource of RESOURCES) {
    const { categorySlug, ...rest } = resource
    const categoryId = categoryIds[categorySlug]
    try {
      await post('/resources', {
        ...rest,
        categoryId: categoryId ?? null,
        isPublished: true,
      })
      console.log(`  ✅  Recurso creado: ${resource.title}`)
    } catch (err: any) {
      console.log(`  ⚠️   Recurso omitido (puede ya existir): ${resource.title} — ${err.message}`)
    }
  }

  console.log('\n🎉  Seed completado.')
}

seed().catch((err) => {
  console.error('❌  Error en seed:', err)
  process.exit(1)
})
