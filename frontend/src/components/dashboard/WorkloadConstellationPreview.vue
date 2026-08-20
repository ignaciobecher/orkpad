<template>
  <button type="button" class="wcp-card" @click="$emit('open')" aria-label="Abrir constelación de proyectos">
    <div v-if="loading" class="wcp-state">
      <w-loading-skeleton width="100%" height="100%" />
    </div>
    <div v-else-if="!nodes.length" class="wcp-state">
      <span class="wcp-empty-text">Sin proyectos activos</span>
    </div>
    <div v-else ref="host" class="wcp-canvas-host"></div>

    <div class="wcp-overlay">
      <span class="wcp-title">Constelación de proyectos</span>
      <span class="wcp-sub">Ver en pantalla completa</span>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import * as THREE from 'three'
import { scaleLinear, scalePow } from 'd3-scale'
import { dashboardApi } from '@/api/dashboard/dashboard.api'
import type { ConstellationNode } from '@/api/dashboard/dashboard.types'
import WLoadingSkeleton from '@/components/ui/WLoadingSkeleton.vue'
import { projectColor, buildStarfield, createCometScheduler } from './constellation-scene-kit'

interface ThreeState {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  animationFrameId: number
  resizeObserver: ResizeObserver
}

export default defineComponent({
  name: 'WorkloadConstellationPreview',
  components: { WLoadingSkeleton },
  emits: ['open'],
  data() {
    return {
      nodes: [] as ConstellationNode[],
      loading: false,
      three: null as ThreeState | null,
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
    initScene() {
      const host = this.$refs.host as HTMLElement
      const width = host.clientWidth
      const height = host.clientHeight

      const scene = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
      camera.position.set(0, 3.2, 7.4)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      host.appendChild(renderer.domElement)

      const root = new THREE.Group()
      scene.add(root)

      root.add(new THREE.AmbientLight(0xffffff, 0.4))
      const sunLight = new THREE.PointLight(0xfff2cc, 7, 0, 1.4)
      root.add(sunLight)

      root.add(buildStarfield(500, 12, 22))

      const sunMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd166 }),
      )
      root.add(sunMesh)
      const sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.22 * 1.9, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.25, side: THREE.BackSide }),
      )
      root.add(sunGlow)

      const dueValues = this.nodes.map((n) => n.daysUntilDue).filter((d): d is number => d !== null)
      const staleValues = this.nodes.map((n) => n.daysSinceActivity)
      const minDue = dueValues.length ? Math.min(...dueValues) : 0
      const maxDue = dueValues.length ? Math.max(...dueValues) : 1
      const safeMaxDue = maxDue === minDue ? minDue + 1 : maxDue
      const minStale = Math.min(...staleValues)
      const maxStale = Math.max(...staleValues)
      const safeMaxStale = maxStale === minStale ? minStale + 1 : maxStale

      const sizeScale = scalePow().exponent(0.5).domain([minDue, safeMaxDue]).range([0.2, 0.08]).clamp(true)
      const distanceScale = scaleLinear().domain([minStale, safeMaxStale]).range([0.9, 3]).clamp(true)

      this.nodes.forEach((node, index) => {
        const angle = (index / this.nodes.length) * Math.PI * 2
        const distance = distanceScale(node.daysSinceActivity)
        const planetColor = projectColor(node.projectId)
        const radius = node.daysUntilDue === null ? 0.08 : sizeScale(node.daysUntilDue)

        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 16, 16),
          new THREE.MeshStandardMaterial({ color: planetColor, roughness: 0.55, metalness: 0.15 }),
        )
        mesh.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle))
        root.add(mesh)
      })

      const clock = new THREE.Clock()
      const cometScheduler = createCometScheduler(scene, { shellRadius: 18, minDelay: 10, maxDelay: 22, duration: 1.4 })
      const resizeObserver = new ResizeObserver(() => this.onResize())
      resizeObserver.observe(host)

      const state: ThreeState = { renderer, scene, camera, animationFrameId: 0, resizeObserver }
      this.three = markRaw(state)

      const renderLoop = () => {
        const delta = clock.getDelta()
        root.rotation.y += delta * 0.12
        cometScheduler.update(delta)
        renderer.render(scene, camera)
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
    },
  },
  mounted() {
    this.fetchAndBuild()
  },
  beforeUnmount() {
    const state = this.three
    if (!state) return
    cancelAnimationFrame(state.animationFrameId)
    state.resizeObserver.disconnect()
    state.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if ((mesh as any).geometry) (mesh as any).geometry.dispose()
      const material = (mesh as any).material
      if (Array.isArray(material)) material.forEach((m: THREE.Material) => m.dispose())
      else if (material) material.dispose()
    })
    state.renderer.dispose()
    state.renderer.domElement.remove()
  },
})
</script>

<style scoped>
.wcp-card {
  position: relative;
  display: block;
  width: 100%;
  height: 200px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-surface)) 0%,
    var(--color-bg-surface) 70%
  );
  cursor: pointer;
  overflow: hidden;
  text-align: left;
}

.wcp-card:hover {
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .wcp-card {
    height: 150px;
  }
}

.wcp-canvas-host {
  position: absolute;
  inset: 0;
}

.wcp-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wcp-empty-text {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.wcp-overlay {
  position: absolute;
  left: 12px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
}

.wcp-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-base);
}

.wcp-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
