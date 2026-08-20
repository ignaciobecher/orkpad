<template>
  <Teleport to="body">
    <div class="wc-fullscreen">
      <div class="wc-legend">
        <p class="wc-legend-line">
          TAMAÑO = URGENCIA <span class="wc-legend-sub">(proyecto y tareas — más grande, vence antes)</span>
        </p>
        <p class="wc-legend-line">
          DISTANCIA AL CENTRO = ABANDONO <span class="wc-legend-sub">(más lejos, más tiempo sin actividad)</span>
        </p>
        <p class="wc-legend-line">
          ÓRBITAS = TAREAS DEL PROYECTO <span class="wc-legend-sub">(más rápido y cerca, vence antes)</span>
        </p>
        <p class="wc-legend-line">
          COLOR = IDENTIDAD DEL PROYECTO <span class="wc-legend-sub">(brillo rojo = urgente y abandonado a la vez)</span>
        </p>
      </div>

      <button type="button" class="wc-close" @click="$emit('close')" aria-label="Cerrar">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div v-if="loading" class="wc-state-wrap">
        <w-loading-skeleton width="240px" height="240px" rounded />
      </div>

      <div v-else-if="!nodes.length" class="wc-state-wrap">
        <w-empty-state
          title="Sin proyectos activos"
          message="No hay proyectos activos en este workspace todavía."
        />
      </div>

      <div
        v-else
        ref="host"
        class="wc-canvas-host"
        @pointermove="onPointerMove"
        @click="onClick"
      ></div>

      <div
        v-if="hovered"
        class="wc-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <template v-if="hovered.kind === 'project'">
          <p class="wc-tooltip-title">{{ hovered.node.projectName }}</p>
          <p class="wc-tooltip-sub">{{ hovered.node.clientName ?? 'Sin cliente' }}</p>
          <p class="wc-tooltip-row">{{ dueLabel(hovered.node.dueDate, hovered.node.daysUntilDue) }}</p>
          <p class="wc-tooltip-row">
            Última actividad hace {{ hovered.node.daysSinceActivity }} días
            ({{ activitySourceLabel(hovered.node.activitySource) }})
          </p>
        </template>
        <template v-else>
          <p class="wc-tooltip-title">{{ hovered.task.title }}</p>
          <p class="wc-tooltip-sub">{{ hovered.projectName }}</p>
          <p class="wc-tooltip-row">{{ dueLabel(hovered.task.dueDate, hovered.task.daysUntilDue) }}</p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { scaleLinear, scalePow } from 'd3-scale'
import { dashboardApi } from '@/api/dashboard/dashboard.api'
import type { ConstellationNode, ConstellationTask } from '@/api/dashboard/dashboard.types'
import WLoadingSkeleton from '@/components/ui/WLoadingSkeleton.vue'
import WEmptyState from '@/components/ui/WEmptyState.vue'
import {
  hashString,
  projectColor,
  buildRing,
  buildStarfield,
  buildAsteroidBelt,
  buildShip,
  createCometScheduler,
} from './constellation-scene-kit'

interface HoveredProject {
  kind: 'project'
  node: ConstellationNode
}
interface HoveredTask {
  kind: 'task'
  task: ConstellationTask
  projectName: string
}
type Hovered = HoveredProject | HoveredTask

interface OrbitRuntime {
  mesh: THREE.Mesh
  radius: number
  speed: number
  angle: number
  tiltSin: number
  tiltCos: number
}

interface ThreeState {
  renderer: THREE.WebGLRenderer
  labelRenderer: CSS2DRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls | null
  raycaster: THREE.Raycaster
  projectMeshes: THREE.Mesh[]
  taskMeshes: THREE.Mesh[]
  animationFrameId: number
  resizeObserver: ResizeObserver
}

const ACTIVITY_SOURCE_LABEL: Record<ConstellationNode['activitySource'], string> = {
  'time-entry': 'registro de tiempo',
  'task-update': 'actualización de una tarea',
  'project-update': 'edición del proyecto',
}

export default defineComponent({
  name: 'WorkloadConstellation',
  components: { WLoadingSkeleton, WEmptyState },
  emits: ['close'],
  data() {
    return {
      nodes: [] as ConstellationNode[],
      loading: false,
      hovered: null as Hovered | null,
      tooltipX: 0,
      tooltipY: 0,
      three: null as ThreeState | null,
      keydownHandler: null as (() => void) | null,
    }
  },
  methods: {
    async fetchAndBuild() {
      this.loading = true
      try {
        const { data } = await dashboardApi.getWorkloadConstellation()
        this.nodes = data.nodes
      } finally {
        this.loading = false
      }
      if (this.nodes.length) {
        await this.$nextTick()
        this.initScene()
      }
    },
    dueLabel(dueDate: string | null, daysUntilDue: number | null): string {
      if (dueDate === null || daysUntilDue === null) return 'Sin fecha límite'
      if (daysUntilDue < 0) return `Vencido hace ${Math.abs(daysUntilDue)} días`
      if (daysUntilDue === 0) return 'Vence hoy'
      return `Vence en ${daysUntilDue} días`
    },
    activitySourceLabel(source: ConstellationNode['activitySource']): string {
      return ACTIVITY_SOURCE_LABEL[source]
    },
    initScene() {
      const host = this.$refs.host as HTMLElement
      const width = host.clientWidth
      const height = host.clientHeight

      const styles = getComputedStyle(document.documentElement)
      const colorPrimary = styles.getPropertyValue('--color-primary').trim()
      const colorError = styles.getPropertyValue('--color-error').trim()
      const colorMuted = styles.getPropertyValue('--color-text-muted').trim()

      const scene = new THREE.Scene()

      // On narrow/portrait viewports (phones) a PerspectiveCamera's horizontal
      // FOV shrinks with the aspect ratio, cropping the sides of the system —
      // pull the camera back proportionally so the whole scene still fits.
      const aspect = width / height
      const framingScale = aspect < 1 ? Math.min(1.8, 1 / aspect) : 1

      const REST_CAMERA_POS = new THREE.Vector3(0, 5, 14).multiplyScalar(framingScale)
      const START_CAMERA_POS = new THREE.Vector3(0, 22, 52).multiplyScalar(Math.max(1, framingScale * 0.9))
      const INTRO_DURATION = 2.2

      const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100)
      camera.position.copy(START_CAMERA_POS)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.inset = '0'
      host.appendChild(renderer.domElement)

      const labelRenderer = new CSS2DRenderer()
      labelRenderer.setSize(width, height)
      labelRenderer.domElement.style.position = 'absolute'
      labelRenderer.domElement.style.inset = '0'
      labelRenderer.domElement.style.pointerEvents = 'none'
      host.appendChild(labelRenderer.domElement)

      // OrbitControls is constructed only once the camera reaches its resting
      // position (see renderLoop below) — it reads the camera's position at
      // construction time to seed its internal spherical state, so building it
      // up front would make it fight the scripted fly-in every frame.
      let controls: OrbitControls | null = null
      let introT = 0

      scene.add(new THREE.AmbientLight(0xffffff, 0.32))
      const sunLight = new THREE.PointLight(0xfff2cc, 9, 0, 1.4)
      sunLight.position.set(0, 0, 0)
      scene.add(sunLight)

      scene.add(buildStarfield(2200))

      const SUN_RADIUS = 0.45
      const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd166 }),
      )
      scene.add(sunMesh)
      const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(SUN_RADIUS * 1.9, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.22, side: THREE.BackSide }),
      )
      scene.add(sunGlow)
      const sunLabelDiv = document.createElement('div')
      sunLabelDiv.className = 'wc-sun-label'
      sunLabelDiv.textContent = 'ORKPAD'
      const sunLabel = new CSS2DObject(sunLabelDiv)
      sunLabel.position.set(0, SUN_RADIUS + 0.32, 0)
      scene.add(sunLabel)

      scene.add(buildAsteroidBelt(160, 7, 8.4))

      const ship = buildShip(colorPrimary)
      scene.add(ship)
      let shipAngle = 0
      const shipOrbitRadius = 11
      const shipSpeed = 0.22

      ;[3, 6, 9].forEach((radius) => scene.add(buildRing(radius, 0, 1, colorMuted, 0.18)))

      const clientKeys = [...new Set(this.nodes.map((n) => n.clientId ?? '__none__'))]
      const sectorSize = (2 * Math.PI) / clientKeys.length

      const dueValues = this.nodes.map((n) => n.daysUntilDue).filter((d): d is number => d !== null)
      const staleValues = this.nodes.map((n) => n.daysSinceActivity)
      const minDue = dueValues.length ? Math.min(...dueValues) : 0
      const maxDue = dueValues.length ? Math.max(...dueValues) : 1
      const safeMaxDue = maxDue === minDue ? minDue + 1 : maxDue
      const minStale = Math.min(...staleValues)
      const maxStale = Math.max(...staleValues)
      const safeMaxStale = maxStale === minStale ? minStale + 1 : maxStale

      const projectSizeScale = scalePow().exponent(0.5).domain([minDue, safeMaxDue]).range([0.45, 0.18]).clamp(true)
      const distanceScale = scaleLinear().domain([minStale, safeMaxStale]).range([3, 9]).clamp(true)
      const urgencyNormScale = scaleLinear().domain([minDue, safeMaxDue]).range([1, 0]).clamp(true)
      const stalenessNormScale = scaleLinear().domain([minStale, safeMaxStale]).range([0, 1]).clamp(true)

      const projectMeshes: THREE.Mesh[] = []
      const taskMeshes: THREE.Mesh[] = []
      const orbitRuntime: OrbitRuntime[] = []

      this.nodes.forEach((node) => {
        const clientIndex = clientKeys.indexOf(node.clientId ?? '__none__')
        const sectorStart = clientIndex * sectorSize
        const hash = hashString(node.projectId)
        const azimuth = sectorStart + ((hash % 1000) / 1000) * sectorSize * 0.8 + sectorSize * 0.1
        const elevationJitter = (((Math.floor(hash / 8)) % 1000) / 1000 - 0.5) * 2

        const distance = distanceScale(node.daysSinceActivity)
        const x = distance * Math.cos(azimuth)
        const z = distance * Math.sin(azimuth)
        const y = elevationJitter * 1.5

        const group = new THREE.Group()
        group.position.set(x, y, z)
        scene.add(group)

        const urgencyNorm = node.daysUntilDue !== null ? urgencyNormScale(node.daysUntilDue) : 0
        const stalenessNorm = stalenessNormScale(node.daysSinceActivity)
        const danger = urgencyNorm > 0.6 && stalenessNorm > 0.6

        const planetColor = projectColor(node.projectId)
        const projectRadius = node.daysUntilDue === null ? 0.18 : projectSizeScale(node.daysUntilDue)
        const projectMesh = new THREE.Mesh(
          new THREE.SphereGeometry(projectRadius, 28, 28),
          new THREE.MeshStandardMaterial({
            color: planetColor,
            roughness: 0.55,
            metalness: 0.15,
            emissive: danger ? new THREE.Color(colorError) : new THREE.Color(0x000000),
            emissiveIntensity: danger ? 0.55 : 0,
          }),
        )
        projectMesh.userData = { kind: 'project', node }
        group.add(projectMesh)
        projectMeshes.push(projectMesh)

        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(projectRadius * 1.3, 20, 20),
          new THREE.MeshBasicMaterial({
            color: danger ? colorError : planetColor,
            transparent: true,
            opacity: danger ? 0.22 : 0.15,
            side: THREE.BackSide,
          }),
        )
        group.add(atmosphere)

        const labelDiv = document.createElement('div')
        labelDiv.className = 'wc-planet-label'
        labelDiv.textContent = node.projectName
        labelDiv.style.borderColor = `#${planetColor.getHexString()}`
        const label = new CSS2DObject(labelDiv)
        label.position.set(0, projectRadius + 0.22, 0)
        group.add(label)

        const taskMaterial = new THREE.MeshStandardMaterial({
          color: planetColor.clone().offsetHSL(0, 0, 0.18),
          roughness: 0.5,
          metalness: 0.1,
        })

        const taskDueValues = node.tasks.map((t) => t.daysUntilDue).filter((d): d is number => d !== null)
        const minTaskDue = taskDueValues.length ? Math.min(...taskDueValues) : 0
        const maxTaskDueRaw = taskDueValues.length ? Math.max(...taskDueValues) : 1
        const maxTaskDue = maxTaskDueRaw === minTaskDue ? minTaskDue + 1 : maxTaskDueRaw

        const orbitRadiusScale = scaleLinear().domain([minTaskDue, maxTaskDue]).range([0.5, 1.7]).clamp(true)
        const orbitSpeedScale = scaleLinear().domain([minTaskDue, maxTaskDue]).range([0.55, 0.15]).clamp(true)
        const taskSizeScale = scalePow().exponent(0.5).domain([minTaskDue, maxTaskDue]).range([0.075, 0.035]).clamp(true)

        node.tasks.forEach((task, taskIndex) => {
          const hasDue = task.daysUntilDue !== null
          const orbitRadius = hasDue ? orbitRadiusScale(task.daysUntilDue as number) : 1.7
          const orbitSpeed = hasDue ? orbitSpeedScale(task.daysUntilDue as number) : 0.1
          const taskRadius = hasDue ? taskSizeScale(task.daysUntilDue as number) : 0.035

          const taskHash = hashString(task.taskId)
          const startAngle = ((taskHash % 1000) / 1000) * Math.PI * 2
          const tilt = (((Math.floor(taskHash / 16)) % 1000) / 1000 - 0.5) * 1.1
          const tiltSin = Math.sin(tilt)
          const tiltCos = Math.cos(tilt)

          const taskMesh = new THREE.Mesh(new THREE.SphereGeometry(taskRadius, 12, 12), taskMaterial)
          taskMesh.userData = { kind: 'task', task, projectName: node.projectName }
          group.add(taskMesh)
          taskMeshes.push(taskMesh)

          group.add(buildRing(orbitRadius, tiltSin, tiltCos, colorMuted, 0.15))

          orbitRuntime.push({
            mesh: taskMesh,
            radius: orbitRadius,
            speed: orbitSpeed * (taskIndex % 2 === 0 ? 1 : -1),
            angle: startAngle,
            tiltSin,
            tiltCos,
          })
        })
      })

      const raycaster = new THREE.Raycaster()
      const clock = new THREE.Clock()
      const resizeObserver = new ResizeObserver(() => this.onResize())
      resizeObserver.observe(host)
      const cometScheduler = createCometScheduler(scene, { shellRadius: 40 })

      const state: ThreeState = {
        renderer,
        labelRenderer,
        scene,
        camera,
        controls: null,
        raycaster,
        projectMeshes,
        taskMeshes,
        animationFrameId: 0,
        resizeObserver,
      }
      this.three = markRaw(state)

      const renderLoop = () => {
        const delta = clock.getDelta()

        if (introT < 1) {
          introT = Math.min(1, introT + delta / INTRO_DURATION)
          const eased = 1 - Math.pow(1 - introT, 3)
          camera.position.lerpVectors(START_CAMERA_POS, REST_CAMERA_POS, eased)
          camera.lookAt(0, 0, 0)
          if (introT >= 1) {
            controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true
            controls.dampingFactor = 0.08
            controls.minDistance = 4
            controls.maxDistance = 30 * framingScale
            controls.target.set(0, 0, 0)
            state.controls = controls
          }
        }

        orbitRuntime.forEach((o) => {
          o.angle += o.speed * delta
          o.mesh.position.set(
            o.radius * Math.cos(o.angle),
            o.radius * Math.sin(o.angle) * o.tiltSin,
            o.radius * Math.sin(o.angle) * o.tiltCos,
          )
        })

        shipAngle += shipSpeed * delta
        ship.position.set(
          shipOrbitRadius * Math.cos(shipAngle),
          2.4 + Math.sin(shipAngle * 2) * 0.4,
          shipOrbitRadius * Math.sin(shipAngle),
        )
        ship.rotation.y = -shipAngle + Math.PI / 2

        cometScheduler.update(delta)

        controls?.update()
        renderer.render(scene, camera)
        labelRenderer.render(scene, camera)
        state.animationFrameId = requestAnimationFrame(renderLoop)
      }
      renderLoop()
    },
    onResize() {
      if (!this.three) return
      const host = this.$refs.host as HTMLElement
      const width = host.clientWidth
      const height = host.clientHeight
      this.three.camera.aspect = width / height
      this.three.camera.updateProjectionMatrix()
      this.three.renderer.setSize(width, height)
      this.three.labelRenderer.setSize(width, height)
    },
    onPointerMove(e: PointerEvent) {
      if (!this.three) return
      const host = this.$refs.host as HTMLElement
      const rect = host.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      this.three.raycaster.setFromCamera(ndc, this.three.camera)

      const projectHit = this.three.raycaster.intersectObjects(this.three.projectMeshes)[0]
      const taskHit = !projectHit ? this.three.raycaster.intersectObjects(this.three.taskMeshes)[0] : undefined

      if (projectHit) {
        this.hovered = { kind: 'project', node: (projectHit.object.userData as any).node }
      } else if (taskHit) {
        const data = taskHit.object.userData as any
        this.hovered = { kind: 'task', task: data.task, projectName: data.projectName }
      } else {
        this.hovered = null
      }

      const TOOLTIP_WIDTH = 240
      const TOOLTIP_HEIGHT = 90
      this.tooltipX = Math.max(8, Math.min(e.clientX - rect.left + 14, rect.width - TOOLTIP_WIDTH - 8))
      this.tooltipY = Math.max(8, Math.min(e.clientY - rect.top + 14, rect.height - TOOLTIP_HEIGHT - 8))
    },
    onClick() {
      if (!this.hovered || this.hovered.kind !== 'project') return
      const projectId = this.hovered.node.projectId
      this.$emit('close')
      this.$router.push({ name: 'project-detail', params: { id: projectId } })
    },
  },
  mounted() {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.$emit('close')
    }
    window.addEventListener('keydown', this.keydownHandler)
    this.fetchAndBuild()
  },
  beforeUnmount() {
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler)

    const state = this.three
    if (!state) return
    cancelAnimationFrame(state.animationFrameId)
    state.resizeObserver.disconnect()
    state.controls?.dispose()
    state.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh | THREE.LineLoop
      if ((mesh as any).geometry) (mesh as any).geometry.dispose()
      const material = (mesh as any).material
      if (Array.isArray(material)) material.forEach((m: THREE.Material) => m.dispose())
      else if (material) material.dispose()
    })
    state.renderer.dispose()
    state.renderer.domElement.remove()
    state.labelRenderer.domElement.remove()
  },
})
</script>

<style scoped>
.wc-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-surface)) 0%,
    var(--color-bg-surface) 70%
  );
}

.wc-legend {
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
  max-width: 480px;
}

.wc-legend-line {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-text-base);
}

.wc-legend-sub {
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  color: var(--color-text-muted);
}

.wc-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
}

.wc-close:hover {
  color: var(--color-text-base);
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .wc-legend {
    top: 12px;
    left: 12px;
    right: 56px;
    max-width: none;
    gap: 2px;
  }

  .wc-legend-line {
    font-size: 9px;
  }

  /* The explanatory sub-text is the first thing to go on small screens —
     the bold labels alone still convey size/distance/orbit/color at a glance. */
  .wc-legend-sub {
    display: none;
  }

  .wc-close {
    top: 12px;
    right: 12px;
  }
}

.wc-state-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wc-canvas-host {
  flex: 1;
  position: relative;
  overflow: hidden;
  touch-action: none;
}

.wc-tooltip {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  max-width: 240px;
  padding: 10px 12px;
  background: var(--color-bg-surface-low);
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.wc-tooltip-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-base);
  margin-bottom: 2px;
}

.wc-tooltip-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.wc-tooltip-row {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>

<style>
/* Unscoped: these labels are mounted directly into the DOM by three.js'
   CSS2DRenderer, outside Vue's render tree, so scoped attribute selectors
   would never match them. */
.wc-planet-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-base);
  background: var(--color-bg-surface-low);
  border: 1px solid;
  padding: 2px 6px;
  white-space: nowrap;
  transform: translateY(-4px);
}

.wc-sun-label {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #ffd166;
  text-shadow: 0 0 8px rgba(255, 209, 102, 0.7);
  white-space: nowrap;
  transform: translateY(-6px);
}
</style>
