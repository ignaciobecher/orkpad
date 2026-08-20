import * as THREE from 'three'

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function projectColor(projectId: string): THREE.Color {
  const hue = hashString(projectId) % 360
  return new THREE.Color().setHSL(hue / 360, 0.62, 0.55)
}

// Deterministic PRNG (Park-Miller) so the decorative starfield/asteroid belt
// don't reshuffle on every reload.
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function buildRing(radius: number, tiltSin: number, tiltCos: number, colorHex: string, opacity: number): THREE.LineLoop {
  const segments = 72
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    points.push(
      new THREE.Vector3(radius * Math.cos(a), radius * Math.sin(a) * tiltSin, radius * Math.sin(a) * tiltCos),
    )
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity })
  return new THREE.LineLoop(geometry, material)
}

export function buildStarfield(count: number, minRadius = 45, maxRadius = 75): THREE.Points {
  const rand = seededRandom(1337)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const radius = minRadius + rand() * (maxRadius - minRadius)
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.12,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
  })
  return new THREE.Points(geometry, material)
}

export function buildAsteroidBelt(count: number, innerRadius: number, outerRadius: number): THREE.InstancedMesh {
  const rand = seededRandom(2024)
  const geometry = new THREE.IcosahedronGeometry(0.045, 0)
  const material = new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 0.95, metalness: 0.05 })
  const belt = new THREE.InstancedMesh(geometry, material, count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2
    const radius = innerRadius + rand() * (outerRadius - innerRadius)
    dummy.position.set(radius * Math.cos(angle), (rand() - 0.5) * 0.5, radius * Math.sin(angle))
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI)
    dummy.scale.setScalar(0.4 + rand() * 1.3)
    dummy.updateMatrix()
    belt.setMatrixAt(i, dummy.matrix)
  }
  return belt
}

export function buildShip(colorHex: string): THREE.Group {
  const ship = new THREE.Group()

  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.055, 0.2, 8),
    new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.35,
      metalness: 0.5,
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: 0.2,
    }),
  )
  body.rotation.x = Math.PI / 2
  ship.add(body)

  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.014, 0.09),
    new THREE.MeshStandardMaterial({ color: 0xcfd3da, roughness: 0.5, metalness: 0.35 }),
  )
  wing.position.z = -0.02
  ship.add(wing)

  const engineGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x7ecbff }),
  )
  engineGlow.position.z = 0.11
  ship.add(engineGlow)

  return ship
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if ((mesh as any).geometry) (mesh as any).geometry.dispose()
    const material = (mesh as any).material
    if (Array.isArray(material)) material.forEach((m: THREE.Material) => m.dispose())
    else if (material) material.dispose()
  })
}

function buildCometMesh(): THREE.Group {
  const group = new THREE.Group()

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xd7f1ff, transparent: true, opacity: 0.95 }),
  )
  head.userData.baseOpacity = 0.95
  group.add(head)

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 1.6, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x8fd6ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
  )
  tail.userData.baseOpacity = 0.35
  tail.rotation.x = -Math.PI / 2
  tail.position.z = 0.85
  group.add(tail)

  return group
}

export interface CometScheduler {
  update(delta: number): void
  disposeAll(): void
}

/** Spawns an occasional shooting star that streaks across the starfield shell and fades out. */
export function createCometScheduler(
  scene: THREE.Scene,
  options: { shellRadius?: number; minDelay?: number; maxDelay?: number; duration?: number } = {},
): CometScheduler {
  const shellRadius = options.shellRadius ?? 40
  const minDelay = options.minDelay ?? 18
  const maxDelay = options.maxDelay ?? 38
  const duration = options.duration ?? 2.2

  let elapsed = 0
  let nextAt = minDelay + Math.random() * (maxDelay - minDelay)
  let active: { group: THREE.Group; from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null

  const randomShellPoint = () => {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    return new THREE.Vector3(
      shellRadius * Math.sin(phi) * Math.cos(theta),
      shellRadius * Math.sin(phi) * Math.sin(theta) * 0.5,
      shellRadius * Math.cos(phi),
    )
  }

  const dispose = (handle: { group: THREE.Group }) => {
    scene.remove(handle.group)
    disposeObject3D(handle.group)
  }

  return {
    update(delta: number) {
      elapsed += delta

      if (active) {
        active.t += delta / duration
        if (active.t >= 1) {
          dispose(active)
          active = null
          nextAt = elapsed + minDelay + Math.random() * (maxDelay - minDelay)
          return
        }
        active.group.position.lerpVectors(active.from, active.to, active.t)
        const fade = active.t < 0.15 ? active.t / 0.15 : active.t > 0.85 ? (1 - active.t) / 0.15 : 1
        active.group.children.forEach((child) => {
          const material = (child as THREE.Mesh).material as THREE.Material & { opacity: number }
          if (material) material.opacity = fade * (child.userData.baseOpacity ?? 1)
        })
        return
      }

      if (elapsed >= nextAt) {
        const from = randomShellPoint()
        const to = randomShellPoint().multiplyScalar(-0.6)
        const group = buildCometMesh()
        group.position.copy(from)
        group.lookAt(to)
        scene.add(group)
        active = { group, from, to, t: 0 }
      }
    },
    disposeAll() {
      if (active) {
        dispose(active)
        active = null
      }
    },
  }
}
