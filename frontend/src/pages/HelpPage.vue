<template>
  <div class="help-page">
    <div class="help-container">
      <!-- Sidebar Navigation -->
      <aside class="help-sidebar">
        <div class="help-sidebar-header">
          <div class="help-logo">
            <span class="material-symbols-outlined logo-icon">auto_awesome</span>
            <span class="logo-text">ORKPAD <span class="text-primary">DOCS</span></span>
          </div>
        </div>

        <div class="help-search-box">
          <span class="material-symbols-outlined">search</span>
          <input v-model="searchQuery" type="text" placeholder="BUSCAR EN LA DOCS..." />
        </div>

        <nav class="help-nav custom-scrollbar">
          <div v-for="section in filteredNav" :key="section.id" class="nav-section">
            <h3 class="nav-section-title">{{ section.title }}</h3>
            <ul class="nav-list">
              <li v-for="item in section.items" :key="item.id">
                <a
                  href="#"
                  :class="['nav-item', { active: activeSection === item.id }]"
                  @click.prevent="scrollToSection(item.id)"
                >
                  <span class="material-symbols-outlined">{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="help-main custom-scrollbar">
        <header class="help-content-header">
          <div class="breadcrumb">
            <span>DOCUMENTACIÓN</span>
            <span class="separator">/</span>
            <span class="active">{{ currentSectionTitle }}</span>
          </div>
          <div class="header-actions">
            <button @click="toggleTheme" class="theme-toggle">
              <span class="material-symbols-outlined">{{
                uiStore.theme === 'dark' ? 'light_mode' : 'dark_mode'
              }}</span>
            </button>
            <button class="close-btn" @click="closeWindow" title="CERRAR">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <article class="help-article" ref="articleRef">
          <!-- Intro -->
          <section id="intro" class="article-section">
            <h1>BIENVENIDO A ORKPAD</h1>
            <p class="lead">
              EL SISTEMA OPERATIVO DEFINITIVO PARA PROFESIONALES, AGENCIAS Y EQUIPOS QUE BUSCAN
              CENTRALIZAR SU FLUJO DE TRABAJO EN UNA SOLA PLATAFORMA ELEGANTE Y POTENTE.
            </p>

            <div class="feature-grid">
              <div class="feature-card">
                <span class="material-symbols-outlined icon">bolt</span>
                <h3>VELOCIDAD EXTREMA</h3>
                <p>ARQUITECTURA OPTIMIZADA PARA QUE NUNCA PIERDAS UN SEGUNDO ENTRE TAREAS.</p>
              </div>
              <div class="feature-card">
                <span class="material-symbols-outlined icon">security</span>
                <h3>SEGURIDAD ENTERPRISE</h3>
                <p>TUS DATOS ESTÁN ENCRIPTADOS Y PROTEGIDOS CON LOS ESTÁNDARES MÁS ALTOS.</p>
              </div>
              <div class="feature-card">
                <span class="material-symbols-outlined icon">dashboard_customize</span>
                <h3>MODULAR Y FLEXIBLE</h3>
                <p>ACTIVA SOLO LO QUE NECESITES PARA TU NEGOCIO EN CADA MOMENTO.</p>
              </div>
            </div>

            <h2>¿QUÉ ES ORKPAD?</h2>
            <p>
              ORKPAD NO ES SOLO UNA HERRAMIENTA DE GESTIÓN; ES EL NÚCLEO DE TU OPERACIÓN. HEMOS
              DISEÑADO CADA MÓDULO PARA QUE TRABAJE EN ARMONÍA CON LOS DEMÁS, ELIMINANDO LA FRICCIÓN
              DE SALTAR ENTRE APLICACIONES DISCONEXAS.
            </p>

            <div class="info-box tip">
              <span class="material-symbols-outlined">info</span>
              <p>
                <strong>DATO CURIOSO:</strong> EL NOMBRE VIENE DE "ORCHESTRATION PAD", SIMBOLIZANDO
                LA ORQUESTACIÓN PERFECTA DE TU NEGOCIO.
              </p>
            </div>
          </section>

          <!-- Dashboard -->
          <section id="dashboard" class="article-section">
            <h2>DASHBOARD OPERATIVO</h2>
            <p>
              TU CENTRO DE COMANDO. AQUÍ TENDRÁS UNA VISTA PANORÁMICA DE TODO LO QUE SUCEDE EN TU
              ESPACIO DE TRABAJO EN TIEMPO REAL.
            </p>

            <h3>MÉTRICAS CLAVE (KPIS)</h3>
            <ul>
              <li><strong>INGRESOS DEL MES:</strong> TOTAL DE FACTURAS PAGADAS Y PENDIENTES.</li>
              <li><strong>PROYECTOS ACTIVOS:</strong> CONTEO DE TRABAJOS EN EJECUCIÓN.</li>
            </ul>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> CÓMO USAR EL DASHBOARD
              </h4>
              <p>
                USA LOS FILTROS SUPERIORES PARA CAMBIAR EL RANGO DE TIEMPO. CADA TARJETA DE KPI ES
                CLICKEABLE Y TE LLEVARÁ AL MÓDULO CORRESPONDIENTE PARA VER EL DETALLE.
              </p>
            </div>
          </section>

          <!-- Clients -->
          <section id="crm" class="article-section">
            <h2>GESTIÓN DE CLIENTES (CRM)</h2>
            <p>
              CENTRALIZA TODA LA INFORMACIÓN DE TUS CLIENTES EN UN SOLO LUGAR. DESDE DATOS FISCALES
              HASTA EL HISTORIAL COMPLETO DE PROYECTOS.
            </p>

            <div class="info-box info">
              <span class="material-symbols-outlined">group</span>
              <p>
                EL CRM PERMITE VINCULAR CONTACTOS, NOTAS INTERNAS Y DOCUMENTOS ESPECÍFICOS PARA CADA
                CLIENTE.
              </p>
            </div>

            <h3>LO QUE PERMITE</h3>
            <ul>
              <li>
                <strong>BASE DE DATOS UNIFICADA:</strong> GUARDA TELÉFONOS, EMAILS Y DIRECCIONES
                FISCALES.
              </li>
              <li>
                <strong>HISTORIAL 360°:</strong> VE CADA FACTURA, TAREA Y PROYECTO ASOCIADO AL
                CLIENTE.
              </li>
              <li>
                <strong>SEGMENTACIÓN POR ETIQUETAS:</strong> CLASIFICA CLIENTES POR TIPO DE SERVICIO
                O PRIORIDAD.
              </li>
            </ul>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UN
                CLIENTE
              </h4>
              <ol>
                <li>VE A LA SECCIÓN <strong>CLIENTES</strong> EN EL MENÚ LATERAL.</li>
                <li>HAZ CLIC EN EL BOTÓN <strong>+ NUEVO CLIENTE</strong>.</li>
                <li>COMPLETA LA INFORMACIÓN BÁSICA (NOMBRE, EMAIL, EMPRESA).</li>
                <li>
                  HAZ CLIC EN <strong>CREAR</strong>. EL CLIENTE YA ESTÁ LISTO PARA RECIBIR
                  PROYECTOS.
                </li>
              </ol>
            </div>
          </section>

          <!-- Messaging -->
          <section id="projects" class="article-section">
            <h2>PROYECTOS Y TAREAS (KANBAN)</h2>
            <p>
              ORGANIZA TU TRABAJO CON UNA ESTRUCTURA JERÁRQUICA CLARA. LOS PROYECTOS AGRUPAN TAREAS,
              Y LAS TAREAS SON LA UNIDAD MÍNIMA DE EJECUCIÓN.
            </p>

            <div class="grid-2">
              <div>
                <h3>GESTIÓN DE PROYECTOS</h3>
                <p>
                  DEFINE PRESUPUESTOS, FECHAS DE ENTREGA Y RESPONSABLES. SIGUE EL PROGRESO
                  VISUALMENTE CON BARRAS DE AVANCE AUTOMÁTICAS.
                </p>
              </div>
              <div>
                <h3>TABLERO KANBAN</h3>
                <p>
                  GESTIONA TUS TAREAS VISUALMENTE. MUEVE TARJETAS ENTRE <strong>TO DO</strong>,
                  <strong>DOING</strong> Y <strong>DONE</strong>.
                </p>
              </div>
            </div>

            <div class="info-box tip">
              <span class="material-symbols-outlined">payments</span>
              <p>
                <strong>PLAN DE COBRO:</strong> AL CREAR O EDITAR UN PROYECTO ELEGÍ ENTRE PAGO
                TOTAL O EN CUOTAS. CON CUOTAS, LA PESTAÑA FINANZAS DEL PROYECTO TE PERMITE
                GENERAR LAS FACTURAS AUTOMÁTICAMENTE (MONTOS IGUALES, VENCIMIENTOS MENSUALES).
              </p>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: GESTIÓN DE
                TAREAS
              </h4>
              <ol>
                <li>DENTRO DE UN PROYECTO, HAZ CLIC EN <strong>+ NUEVA TAREA</strong>.</li>
                <li>ASIGNA UN NOMBRE, PRIORIDAD Y RESPONSABLE.</li>
                <li>
                  CUANDO EMPIECES A TRABAJAR, ARRASTRA LA TAREA A LA COLUMNA <strong>DOING</strong>.
                </li>
                <li>
                  AL TERMINAR, MUÉVELA A <strong>DONE</strong> PARA QUE SE NOTIFIQUE AL SISTEMA.
                </li>
              </ol>
            </div>
          </section>

          <section id="planner" class="article-section">
            <h2>PLANNER</h2>
            <p>
              ORGANIZÁ TU DÍA A DÍA EN BLOQUES DE TIEMPO. EL PLANNER TE PERMITE ARMAR UNA AGENDA
              VISUAL DE BLOQUES DE TRABAJO, COMBINANDO TAREAS, DESCANSOS Y EVENTOS EN UNA MISMA
              LÍNEA DE TIEMPO.
            </p>

            <div class="info-box tip">
              <span class="material-symbols-outlined">view_day</span>
              <p>
                ACTIVÁ EL <strong>MODO FOCO</strong> (TECLA "F") PARA CONCENTRARTE EN EL BLOQUE
                ACTUAL SIN DISTRACCIONES.
              </p>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> CÓMO USAR EL PLANNER
              </h4>
              <p>
                CREÁ BLOQUES ARRASTRANDO SOBRE LA LÍNEA DE TIEMPO, ASIGNALES UNA TAREA O
                DESCRIPCIÓN, Y MARCÁLOS COMO COMPLETADOS A MEDIDA QUE AVANZÁS EN TU JORNADA.
              </p>
            </div>
          </section>

          <!-- Goals -->
          <section id="goals" class="article-section">
            <h2>OBJETIVOS</h2>
            <p>
              DEFINÍ Y SEGUÍ TUS METAS PERSONALES Y DE NEGOCIO CON 4 VISTAS:
              <strong>HOY</strong> (OBJETIVOS DIARIOS), <strong>SEMANA/MES</strong> (PERIÓDICOS),
              <strong>METAS</strong> (TARGETS DE LARGO PLAZO) Y <strong>CALENDARIO</strong> (HEATMAP
              DE CUMPLIMIENTO).
            </p>

            <ul>
              <li>
                <strong>PROGRESO RÁPIDO:</strong> INCREMENTÁ O DECREMENTÁ EL AVANCE DE UN OBJETIVO
                DIRECTAMENTE DESDE LA LISTA.
              </li>
              <li>
                <strong>ESTADÍSTICAS:</strong> ABRÍ EL DETALLE DE UN OBJETIVO PARA VER SU HISTORIAL
                COMPLETO EN UN PANEL LATERAL.
              </li>
            </ul>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UN
                OBJETIVO
              </h4>
              <ol>
                <li>VE A <strong>OBJETIVOS</strong> EN EL MENÚ LATERAL.</li>
                <li>HACÉ CLIC EN <strong>NUEVO OBJETIVO</strong>.</li>
                <li>ELEGÍ EL TIPO (DIARIO, PERIÓDICO O META) Y COMPLETÁ LOS DATOS.</li>
                <li>MARCALO COMO COMPLETADO O ACTUALIZÁ SU PROGRESO A MEDIDA QUE AVANZÁS.</li>
              </ol>
            </div>
          </section>

          <!-- Finance -->
          <section id="finance" class="article-section">
            <h2>FINANZAS Y FACTURACIÓN</h2>
            <p>
              CONTROL TOTAL SOBRE TU FLUJO DE CAJA. REGISTRA CADA MOVIMIENTO Y GENERA DOCUMENTOS
              PROFESIONALES.
            </p>

            <div class="finance-grid">
              <div class="finance-item">
                <span class="material-symbols-outlined">trending_up</span>
                <h4>INGRESOS</h4>
                <p>FACTURA TUS SERVICIOS Y REGISTRA PAGOS RECIBIDOS.</p>
              </div>
              <div class="finance-item">
                <span class="material-symbols-outlined">trending_down</span>
                <h4>GASTOS</h4>
                <p>CONTROLA TUS COSTOS OPERATIVOS Y PAGOS A PROVEEDORES.</p>
              </div>
              <div class="finance-item">
                <span class="material-symbols-outlined">description</span>
                <h4>FACTURAS PDF</h4>
                <p>GENERA COMPROBANTES CON TU LOGO Y DATOS LEGALES AL INSTANTE.</p>
              </div>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UNA
                FACTURA
              </h4>
              <ol>
                <li>VE A <strong>FINANZAS</strong> -> <strong>NUEVA FACTURA</strong>.</li>
                <li>SELECCIONA EL CLIENTE Y EL PROYECTO ASOCIADO.</li>
                <li>AGREGA LOS CONCEPTOS (ITEMS) Y EL PRECIO.</li>
                <li>
                  HAZ CLIC EN <strong>GENERAR PDF</strong> Y ENVÍALA POR EMAIL DESDE LA PLATAFORMA.
                </li>
              </ol>
            </div>
          </section>

          <!-- Quotes -->
          <section id="quotes" class="article-section">
            <h2>PRESUPUESTOS</h2>
            <p>
              CREÁ COTIZACIONES PROFESIONALES PARA TUS CLIENTES ANTES DE ARRANCAR UN PROYECTO. CADA
              PRESUPUESTO TIENE UN ESTADO: <strong>BORRADOR</strong>, <strong>ENVIADO</strong>,
              <strong>ACEPTADO</strong>, <strong>RECHAZADO</strong> O <strong>VENCIDO</strong>.
            </p>

            <div class="info-box info">
              <span class="material-symbols-outlined">request_quote</span>
              <p>
                EL BUILDER TE PERMITE DEFINIR ALCANCE, ENTREGABLES, ÍTEMS Y SECCIONES CON PRECIOS,
                DATOS DEL CLIENTE Y TUYOS, CONDICIONES DE PAGO Y VALIDEZ DE LA OFERTA.
              </p>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UN
                PRESUPUESTO
              </h4>
              <ol>
                <li>
                  VE A <strong>PRESUPUESTOS</strong> Y HACÉ CLIC EN
                  <strong>NUEVO PRESUPUESTO</strong>.
                </li>
                <li>
                  COMPLETÁ LOS DATOS GENERALES, EL CLIENTE Y LOS ÍTEMS O SECCIONES CON SUS PRECIOS.
                </li>
                <li>AGREGÁ CONDICIONES DE PAGO Y NOTAS DE VALIDEZ.</li>
                <li>GUARDÁ Y DESCARGÁ EL PDF PARA ENVIARLO AL CLIENTE.</li>
                <li>
                  CUANDO EL CLIENTE LO ACEPTE, MARCALO COMO <strong>ACEPTADO</strong> Y CONVERTILO
                  EN FACTURA CON UN CLIC.
                </li>
              </ol>
            </div>
          </section>

          <!-- Client Subscriptions -->
          <section id="client-subscriptions" class="article-section">
            <h2>PAGOS RECURRENTES</h2>
            <p>
              LLEVÁ EL CONTROL DE TUS INGRESOS Y EGRESOS RECURRENTES. CADA REGISTRO TIENE UN
              PLAN, CICLO DE FACTURACIÓN, PRECIO Y PRÓXIMA FECHA DE COBRO O PAGO. LOS INGRESOS
              SE LIGAN A UN CLIENTE (CUOTAS); LOS EGRESOS SIRVEN PARA SERVIDORES, SAAS Y OTROS
              COSTOS FIJOS.
            </p>

            <div class="info-box tip">
              <span class="material-symbols-outlined">rebase_edit</span>
              <p>
                LA TABLA RESALTA AUTOMÁTICAMENTE LAS SUSCRIPCIONES PRÓXIMAS A VENCER O ATRASADAS,
                PARA QUE NUNCA TE OLVIDES DE FACTURAR UN COBRO RECURRENTE.
              </p>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UNA
                SUSCRIPCIÓN DE CLIENTE
              </h4>
              <ol>
                <li>
                  VE A <strong>SUSCRIPCIONES</strong> EN EL MENÚ LATERAL (SECCIÓN OPERACIONES).
                </li>
                <li>SELECCIONÁ EL TIPO (INGRESO O EGRESO) Y, SI ES INGRESO, EL CLIENTE.</li>
                <li>DEFINÍ EL PRECIO Y EL CICLO (MENSUAL O ANUAL).</li>
                <li>ORKPAD TE AVISARÁ CUANDO SE ACERQUE LA PRÓXIMA FECHA DE FACTURACIÓN.</li>
              </ol>
            </div>
          </section>

          <!-- Time Tracking -->
          <section id="time" class="article-section">
            <h2>TIME TRACKING</h2>
            <p>
              MIDE TU PRODUCTIVIDAD. REGISTRA EXACTAMENTE CUÁNTO TIEMPO DEDICAS A CADA TAREA PARA
              UNA FACTURACIÓN PRECISA POR HORAS.
            </p>

            <div class="info-box tip">
              <span class="material-symbols-outlined">timer</span>
              <p>
                PUEDES USAR EL TEMPORIZADOR EN TIEMPO REAL O INGRESAR LAS HORAS MANUALMENTE AL FINAL
                DEL DÍA.
              </p>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> CÓMO REGISTRAR TIEMPO
              </h4>
              <p>
                SELECCIONA UNA TAREA ACTIVA Y HAZ CLIC EN EL BOTÓN DE <strong>PLAY</strong>. EL
                SISTEMA EMPEZARÁ A CONTAR. AL TERMINAR, HAZ CLIC EN <strong>STOP</strong> Y EL
                REGISTRO SE GUARDARÁ AUTOMÁTICAMENTE VINCULADO AL PROYECTO.
              </p>
            </div>
          </section>

          <!-- Products & Subscriptions -->
          <section id="docs" class="article-section">
            <h2>CONOCIMIENTO (DOCS INTERNA)</h2>
            <p>
              TU WIKI EMPRESARIAL. CREA MANUALES DE PROCESOS, GUÍAS PARA CLIENTES Y NOTAS INTERNAS
              COMPARTIDAS.
            </p>

            <p>
              USA EL EXPLORADOR DE ARCHIVOS PARA ORGANIZAR TUS DOCUMENTOS POR CARPETAS. SOPORTA
              MARKDOWN Y SUBIDA DE ARCHIVOS BINARIOS (PDF, DOCS, XLS).
            </p>
          </section>

          <!-- Academy / Resources -->
          <section id="notes" class="article-section">
            <h2>PIZARRA (NOTAS RÁPIDAS)</h2>
            <p>
              UN ESPACIO DE PENSAMIENTO LIBRE. LA PIZARRA ES TU ÁREA PERSONAL PARA CAPTURAR IDEAS,
              NOTAS Y BORRADORES SIN ESTRUCTURA RÍGIDA.
            </p>

            <div class="info-box tip">
              <span class="material-symbols-outlined">edit_note</span>
              <p>
                A DIFERENCIA DE LOS DOCUMENTOS, LAS NOTAS DE LA PIZARRA SON LIGERAS Y ESTÁN PENSADAS
                PARA EL DÍA A DÍA: CAPTURAR UNA IDEA, ANOTAR UN NÚMERO DE TELÉFONO O REDACTAR UN
                BORRADOR.
              </p>
            </div>

            <h3>CARACTERÍSTICAS</h3>
            <ul>
              <li><strong>EDITOR RICO:</strong> SOPORTE DE FORMATO, LISTAS Y CÓDIGO CON TipTap.</li>
              <li>
                <strong>ACCESO RÁPIDO:</strong> DISPONIBLE DESDE EL MENÚ LATERAL CON UN SOLO CLIC.
              </li>
              <li>
                <strong>SIN CARPETAS:</strong> DISEÑADA PARA VELOCIDAD, NO PARA ORGANIZACIÓN
                PROFUNDA.
              </li>
            </ul>

            <div class="tutorial-box">
              <h4><span class="material-symbols-outlined">play_circle</span> CREAR UNA NOTA</h4>
              <ol>
                <li>VE A <strong>PIZARRA</strong> EN EL MENÚ LATERAL.</li>
                <li>HAZ CLIC EN <strong>+ NUEVA NOTA</strong>.</li>
                <li>ESCRIBE LIBREMENTE. LOS CAMBIOS SE GUARDAN AUTOMÁTICAMENTE.</li>
              </ol>
            </div>
          </section>

          <!-- GitHub Integration -->
          <section id="github" class="article-section">
            <h2>INTEGRACIÓN CON GITHUB</h2>
            <p>
              CONECTÁ TU CUENTA DE GITHUB PARA VINCULAR REPOSITORIOS A TUS PROYECTOS DE ORKPAD. VER
              COMMITS RECIENTES Y PULL REQUESTS ABIERTOS SIN SALIR DE LA PLATAFORMA.
            </p>

            <div class="info-box info">
              <span class="material-symbols-outlined">commit</span>
              <p>
                LA INTEGRACIÓN CON GITHUB FUNCIONA VÍA OAUTH. CONECTÁ TU CUENTA DESDE
                INTEGRACIONES UNA VEZ Y ORKPAD TENDRÁ ACCESO A TUS REPOSITORIOS.
              </p>
            </div>

            <h3>¿QUÉ PODÉS HACER?</h3>
            <ul>
              <li>
                <strong>CONECTAR VÍA OAUTH:</strong> UN CLIC EN "CONECTAR GITHUB" DESDE
                INTEGRACIONES Y LISTO. NO NECESITÁS TOKENS MANUALES.
              </li>
              <li>
                <strong>VINCULAR REPOSITORIOS:</strong> ASOCIÁ UNO O VARIOS REPOSITORIOS A CADA
                PROYECTO DE ORKPAD.
              </li>
              <li>
                <strong>VER COMMITS:</strong> HISTORIAL DE LOS ÚLTIMOS 20 COMMITS CON AUTOR, MENSAJE
                Y FECHA.
              </li>
              <li>
                <strong>VER PULL REQUESTS:</strong> LISTADO DE PRs ABIERTOS CON LINK DIRECTO A
                GITHUB.
              </li>
              <li>
                <strong>CREAR BRANCHES:</strong> CREÁ UN BRANCH DESDE UNA TAREA DE ORKPAD
                DIRECTAMENTE (EL NOMBRE SE GENERA AUTOMÁTICAMENTE).
              </li>
              <li>
                <strong>MÚLTIPLES REPOS:</strong> UN PROYECTO PUEDE TENER VARIOS REPOSITORIOS
                VINCULADOS, CADA UNO CON SU PROPIA PESTAÑA DE ACTIVIDAD.
              </li>
            </ul>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CONECTAR GITHUB
              </h4>
              <ol>
                <li>
                  VE A <strong>INTEGRACIONES</strong> EN EL MENÚ LATERAL Y HACÉ CLIC EN
                  <strong>CONECTAR GITHUB</strong>.
                </li>
                <li>AUTORIZÁ A ORKPAD EN LA PANTALLA DE GITHUB.</li>
                <li>SERÁS REDIRIGIDO DE VUELTA A LA APP CON TU CUENTA VINCULADA.</li>
                <li>
                  TAMBIÉN PODÉS VERLO EN <strong>INTEGRACIONES</strong> — GITHUB APARECE COMO "VIA
                  OAUTH".
                </li>
              </ol>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: VINCULAR UN
                REPOSITORIO A UN PROYECTO
              </h4>
              <ol>
                <li>ABRÍ UN PROYECTO DESDE <strong>PROYECTOS</strong>.</li>
                <li>
                  EN LA SECCIÓN <strong>GITHUB</strong> DEL DETALLE, HACÉ CLIC EN
                  <strong>CONECTAR REPO</strong>.
                </li>
                <li>
                  EN EL BUSCADOR QUE APARECE, ESCRIBÍ EL NOMBRE DEL REPOSITORIO Y SELECCIONALO.
                </li>
                <li>
                  HACÉ CLIC EN <strong>CONECTAR</strong>. EL REPO APARECE LISTADO EN LA SECCIÓN.
                </li>
                <li>
                  HACÉ CLIC EN <strong>VER ACTIVIDAD</strong> PARA VER COMMITS Y PULL REQUESTS.
                </li>
              </ol>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: CREAR UN BRANCH
                DESDE UNA TAREA
              </h4>
              <ol>
                <li>ABRÍ UNA TAREA DENTRO DE UN PROYECTO QUE TENGA UN REPOSITORIO CONECTADO.</li>
                <li>HACÉ CLIC EN EL BOTÓN <strong>CREAR BRANCH</strong>.</li>
                <li>
                  ORKPAD CREARÁ AUTOMÁTICAMENTE UN BRANCH EN GITHUB CON EL NOMBRE DE LA TAREA.
                </li>
                <li>RECIBIRÁS UN LINK DIRECTO AL NUEVO BRANCH.</li>
              </ol>
            </div>

            <div class="info-box tip">
              <span class="material-symbols-outlined">info</span>
              <p>
                <strong>CONSEJO:</strong> PODÉS VINCULAR REPOSITORIOS PÚBLICOS Y PRIVADOS. LOS REPOS
                PRIVADOS APARECEN CON UN ÍCONO DE CANDADO EN EL BUSCADOR.
              </p>
            </div>
          </section>

          <section id="integrations" class="article-section">
            <h2>INTEGRACIONES</h2>
            <p>
              ORKPAD SE CONECTA CON LAS HERRAMIENTAS QUE YA USÁS. LA SECCIÓN DE INTEGRACIONES ES EL
              HUB CENTRAL PARA GESTIONAR TODAS LAS CONEXIONES EXTERNAS.
            </p>

            <div class="finance-grid">
              <div class="finance-item">
                <span class="material-symbols-outlined">commit</span>
                <h4>GITHUB</h4>
                <p>REPOSITORIOS, COMMITS Y PULL REQUESTS VINCULADOS A PROYECTOS.</p>
              </div>
              <div class="finance-item">
                <span class="material-symbols-outlined">add_circle</span>
                <h4>PRÓXIMAMENTE</h4>
                <p>MÁS INTEGRACIONES EN CAMINO.</p>
              </div>
            </div>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> ACCEDER A INTEGRACIONES
              </h4>
              <p>
                VE AL MENÚ LATERAL Y HACÉ CLIC EN <strong>INTEGRACIONES</strong>.
                DESDE AHÍ PODÉS CONECTAR TU CUENTA DE GITHUB PARA VINCULAR REPOSITORIOS
                A TUS PROYECTOS.
              </p>
            </div>
          </section>

          <section id="agenda" class="article-section">
            <h2>CALENDARIO Y AGENDA</h2>
            <p>
              NUNCA PIERDAS UNA REUNIÓN. EL CALENDARIO INTEGRA TUS TAREAS CON VENCIMIENTO Y EVENTOS
              PROGRAMADOS.
            </p>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> AGENDAR UNA REUNIÓN
              </h4>
              <p>
                HAZ CLIC EN CUALQUIER DÍA DEL CALENDARIO. COMPLETA EL TÍTULO, HORA Y VINCULA UN
                CLIENTE. EL EVENTO APARECERÁ TAMBIÉN EN EL DASHBOARD COMO "PRÓXIMO EVENTO".
              </p>
            </div>
          </section>

          <!-- Settings -->
          <section id="assistant" class="article-section">
            <h2>ASISTENTE IA</h2>
            <p>
              PREGUNTALE A ORKPAD POR TUS PROYECTOS, CUOTAS, TAREAS Y DOCUMENTACIÓN. USA UN
              MODELO LOCAL (OLLAMA): NADA SALE DE TU SERVIDOR.
            </p>

            <div class="tutorial-box">
              <h4>
                <span class="material-symbols-outlined">play_circle</span> TUTORIAL: PRIMERA PREGUNTA
              </h4>
              <ol>
                <li>ABRÍ <strong>ASISTENTE IA</strong> EN EL MENÚ LATERAL.</li>
                <li>ELEGÍ UN PROYECTO O DEJÁ "TODO EL WORKSPACE".</li>
                <li>ESCRIBÍ TU PREGUNTA, POR EJEMPLO "¿QUÉ FALTA COBRAR ESTE MES?".</li>
                <li>LAS RESPUESTAS CITAN LAS FUENTES [1], [2]... USADAS.</li>
              </ol>
            </div>

            <div class="info-box info">
              <span class="material-symbols-outlined">settings</span>
              <p>
                CONFIGURALO EN <strong>CONFIGURACIÓN → ASISTENTE IA</strong>: URL DE OLLAMA,
                MODELO DE CHAT Y DE EMBEDDINGS, QUÉ TIPOS DE DATOS INDEXA Y BOTÓN
                <strong>REINDEXAR TODO</strong> DESPUÉS DE CARGAR DOCUMENTACIÓN.
              </p>
            </div>
          </section>

          <section id="settings" class="article-section">
            <h2>CONFIGURACIÓN DEL SISTEMA</h2>
            <p>PERSONALIZA TU EXPERIENCIA EN ORKPAD.</p>

            <ul>
              <li><strong>PERFIL:</strong> CAMBIA TU AVATAR, NOMBRE Y CONTRASEÑA.</li>
              <li>
                <strong>WORKSPACE:</strong> DEFINE EL NOMBRE DE TU EMPRESA Y CONFIGURACIÓN REGIONAL.
              </li>
              <li>
                <strong>NOTIFICACIONES:</strong> ELIGE QUÉ ALERTAS QUIERES RECIBIR POR EMAIL O EN EL
                NAVEGADOR.
              </li>
            </ul>
          </section>
        </article>

        <footer class="help-footer">
          <p>© 2026 ORKPAD · APACHE-2.0 · OPEN SOURCE</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui.store'

export default defineComponent({
  name: 'HelpPage',
  setup() {
    const uiStore = useUIStore()
    const activeSection = ref('intro')
    const searchQuery = ref('')
    const articleRef = ref<HTMLElement | null>(null)

    const navSections = [
      {
        title: 'GENERAL',
        items: [
          { id: 'intro', label: 'BIENVENIDO', icon: 'auto_awesome' },
          { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard' },
        ],
      },
      {
        title: 'MÓDULOS CORE',
        items: [
          { id: 'crm', label: 'CLIENTES (CRM)', icon: 'group' },
          { id: 'projects', label: 'PROYECTOS Y TAREAS', icon: 'assignment' },
        ],
      },
      {
        title: 'PLANIFICACIÓN',
        items: [
          { id: 'planner', label: 'PLANNER', icon: 'view_day' },
          { id: 'agenda', label: 'AGENDA', icon: 'calendar_month' },
          { id: 'goals', label: 'OBJETIVOS', icon: 'flag' },
        ],
      },
      {
        title: 'FINANZAS',
        items: [
          { id: 'finance', label: 'FINANZAS', icon: 'account_balance_wallet' },
          { id: 'quotes', label: 'PRESUPUESTOS', icon: 'request_quote' },
          { id: 'client-subscriptions', label: 'PAGOS RECURRENTES', icon: 'rebase_edit' },
        ],
      },
      {
        title: 'PRODUCTIVIDAD',
        items: [
          { id: 'time', label: 'TIME TRACKING', icon: 'timer' },
          { id: 'notes', label: 'PIZARRA', icon: 'edit_note' },
        ],
      },
      {
        title: 'INTEGRACIONES',
        items: [
          { id: 'github', label: 'GITHUB', icon: 'commit' },
          { id: 'integrations', label: 'INTEGRACIONES', icon: 'electrical_services' },
        ],
      },
      {
        title: 'CONOCIMIENTO',
        items: [
          { id: 'docs', label: 'DOCUMENTACIÓN INTERNA', icon: 'description' },
        ],
      },
      {
        title: 'SISTEMA',
        items: [
          { id: 'assistant', label: 'ASISTENTE IA', icon: 'smart_toy' },
          { id: 'settings', label: 'CONFIGURACIÓN', icon: 'settings' },
        ],
      },
    ]

    const filteredNav = computed(() => {
      if (!searchQuery.value) return navSections
      const q = searchQuery.value.toLowerCase()
      return navSections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.label.toLowerCase().includes(q) || section.title.toLowerCase().includes(q),
          ),
        }))
        .filter((section) => section.items.length > 0)
    })

    const currentSectionTitle = computed(() => {
      for (const section of navSections) {
        const item = section.items.find((i) => i.id === activeSection.value)
        if (item) return item.label
      }
      return 'DOCUMENTACIÓN'
    })

    const scrollToSection = (id: string) => {
      activeSection.value = id
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const closeWindow = () => {
      window.close()
    }

    const toggleTheme = () => {
      uiStore.toggleTheme()
    }

    onMounted(() => {
      // Check for hash in URL
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        setTimeout(() => scrollToSection(hash), 500)
      }

      // Observer to update active section on scroll
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeSection.value = entry.target.id
            }
          })
        },
        { threshold: 0.5 },
      )

      document.querySelectorAll('.article-section').forEach((section) => {
        observer.observe(section)
      })
    })

    return {
      uiStore,
      activeSection,
      searchQuery,
      filteredNav,
      currentSectionTitle,
      scrollToSection,
      closeWindow,
      toggleTheme,
      articleRef,
    }
  },
})
</script>

<style scoped>
.help-page {
  height: 100vh;
  background-color: var(--color-bg-base);
  color: var(--color-text-base);
  font-family: var(--font-body);
}

.help-container {
  display: flex;
  height: 100%;
}

/* Sidebar */
.help-sidebar {
  width: 300px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface);
}

.help-sidebar-header {
  padding: 32px 24px;
}

.help-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: var(--color-primary);
}

.logo-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.text-primary {
  color: var(--color-primary);
}

.help-search-box {
  padding: 0 24px 24px;
  position: relative;
}

.help-search-box span {
  position: absolute;
  left: 36px;
  top: 10px;
  font-size: 18px;
  color: var(--color-text-muted);
}

.help-search-box input {
  width: 100%;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-border);
  padding: 10px 12px 10px 40px;
  color: var(--color-text-base);
  font-family: var(--font-mono);
  font-size: 11px;
  outline: none;
  border-radius: 0;
}

.help-nav {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px 32px;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  padding-left: 12px;
  letter-spacing: 1.5px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.nav-item span {
  font-size: 18px;
}

.nav-item:hover {
  background-color: var(--color-bg-surface-highest);
  color: var(--color-text-base);
}

.nav-item.active {
  background-color: var(--color-bg-base);
  border-color: var(--color-border);
  color: var(--color-primary);
}

.help-sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  letter-spacing: 1px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-success);
}

/* Main Content */
.help-main {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.help-content-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.breadcrumb .active {
  color: var(--color-text-base);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.theme-toggle,
.close-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  padding: 6px;
  transition: all 0.2s;
}

.theme-toggle:hover,
.close-btn:hover {
  color: var(--color-text-base);
  border-color: var(--color-primary);
}

.help-article {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 80px 40px;
}

.article-section {
  padding-bottom: 80px;
  margin-bottom: 80px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.article-section:last-child {
  border-bottom: none;
}

h1 {
  font-family: var(--font-mono);
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 32px;
  letter-spacing: -2px;
}

.lead {
  font-size: 18px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 48px;
  font-family: var(--font-mono);
}

h2 {
  font-family: var(--font-mono);
  font-size: 32px;
  margin: 0 0 24px 0;
  letter-spacing: -1px;
  text-transform: uppercase;
}

h3 {
  font-family: var(--font-mono);
  font-size: 18px;
  margin: 40px 0 16px 0;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

p {
  line-height: 1.8;
  margin-bottom: 24px;
  font-size: 15px;
}

ul,
ol {
  margin-bottom: 32px;
  padding-left: 24px;
}

li {
  margin-bottom: 12px;
  line-height: 1.6;
}

/* UI Elements */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1px;
  background-color: var(--color-border);
  margin: 48px 0;
  border: 1px solid var(--color-border);
}

.feature-card {
  background-color: var(--color-bg-surface);
  padding: 32px;
}

.feature-card .icon {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 24px;
}

.feature-card h3 {
  margin-top: 0 !important;
  color: var(--color-text-base);
}

.feature-card p {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  font-family: var(--font-mono);
}

.info-box {
  display: flex;
  gap: 20px;
  padding: 24px;
  border: 1px solid var(--color-border);
  margin: 40px 0;
  background-color: var(--color-bg-surface-low);
}

.info-box.tip {
  border-left: 4px solid var(--color-primary);
}
.info-box.info {
  border-left: 4px solid var(--color-info);
}

.info-box span {
  font-size: 24px;
  color: var(--color-primary);
}
.info-box p {
  margin: 0;
  font-size: 14px;
  font-family: var(--font-mono);
}

.tutorial-box {
  background-color: var(--color-bg-surface-highest);
  padding: 32px;
  border: 1px solid var(--color-border);
  margin: 48px 0;
}

.tutorial-box h4 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-primary);
  letter-spacing: 1px;
}

/* Tables & Grids */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin: 40px 0;
}

.finance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.finance-item {
  padding: 24px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.finance-item span {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 16px;
  display: block;
}
.finance-item h4 {
  font-family: var(--font-mono);
  font-size: 14px;
  margin-bottom: 12px;
}
.finance-item p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.pricing-table {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1px;
  background-color: var(--color-border);
  margin-top: 48px;
  border: 1px solid var(--color-border);
}

.price-card {
  background-color: var(--color-bg-surface);
  padding: 40px 32px;
}

.price-card.featured {
  background-color: var(--color-bg-surface-highest);
}

.price-header {
  margin-bottom: 32px;
}
.plan-name {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}
.plan-price {
  font-size: 40px;
  font-weight: 800;
  display: block;
  margin-top: 8px;
}
.plan-price span {
  font-size: 14px;
  color: var(--color-text-muted);
}

.price-body ul {
  padding: 0;
  list-style: none;
  margin: 0;
}
.price-body li {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-subtle);
}

.help-footer {
  padding: 40px;
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

@media (max-width: 1024px) {
  .help-sidebar {
    width: 260px;
  }
}

@media (max-width: 768px) {
  .help-sidebar {
    display: none;
  }
  .help-article {
    padding: 40px 20px;
  }
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  h1 {
    font-size: 32px;
  }
}
</style>
