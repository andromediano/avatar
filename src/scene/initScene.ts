import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export interface SceneContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
}

export interface SceneConfig {
  background: number
  cameraFov: number
  cameraPosition: [number, number, number]
  cameraNear: number
  cameraFar: number
  controlsTarget: [number, number, number]
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  background: 0xf0f0f0,
  cameraFov: 45,
  cameraPosition: [0, 1.2, 3],
  cameraNear: 0.1,
  cameraFar: 100,
  controlsTarget: [0, 1.0, 0],
}

/**
 * 3D 씬의 비렌더링 요소(씬, 카메라, 조명, 그리드)를 구성한다.
 * 렌더러 생성 없이 테스트 가능.
 */
export function createScene(config: SceneConfig = DEFAULT_SCENE_CONFIG) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(config.background)

  // Camera
  const camera = new THREE.PerspectiveCamera(
    config.cameraFov,
    1, // aspect는 렌더러 연결 시 갱신
    config.cameraNear,
    config.cameraFar,
  )
  camera.position.set(...config.cameraPosition)

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(2, 4, 3)
  dirLight.castShadow = true
  scene.add(dirLight)

  const hemi = new THREE.HemisphereLight(0xbde0fe, 0x444444, 0.4)
  scene.add(hemi)

  // Grid
  const grid = new THREE.GridHelper(10, 20, 0xcccccc, 0xe0e0e0)
  scene.add(grid)

  return { scene, camera }
}

/**
 * 렌더러를 생성한다. WebGPU 시도 후 WebGL 폴백.
 */
export async function createRenderer(
  canvas: HTMLCanvasElement,
): Promise<THREE.WebGLRenderer> {
  try {
    const webgpu = await import('three/webgpu')
    const gpuRenderer = new webgpu.WebGPURenderer({ canvas, antialias: true })
    await gpuRenderer.init()
    console.info('[Renderer] WebGPU 활성화')
    return gpuRenderer as unknown as THREE.WebGLRenderer
  } catch {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    console.warn('[Renderer] WebGPU 미지원 — WebGL 폴백')
    return renderer
  }
}

/**
 * OrbitControls를 생성한다.
 */
export function createControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  target: [number, number, number] = [0, 1.0, 0],
): OrbitControls {
  const controls = new OrbitControls(camera, domElement)
  controls.target.set(...target)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI * 0.85
  controls.update()
  return controls
}

/**
 * 전체 SceneContext를 조립한다.
 */
export async function createSceneContext(
  canvas: HTMLCanvasElement,
  config: SceneConfig = DEFAULT_SCENE_CONFIG,
): Promise<SceneContext> {
  const { scene, camera } = createScene(config)

  const renderer = await createRenderer(canvas)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()

  const controls = createControls(camera, canvas, config.controlsTarget)

  return { scene, camera, renderer, controls }
}
