# PoC 구현 가이드

> 3D 아바타 가상 피팅 시스템의 Proof-of-Concept 구현 문서
> 최종 갱신: 2026-03-18

---

## 목차

| 번호 | 단계 | 핵심 기술 | 예상 소요 |
|------|------|-----------|-----------|
| 1 | Scene 초기화 | Three.js, WebGPU Renderer | 2일 |
| 2 | 아바타 로딩 | glTF, Morph Targets | 3일 |
| 3 | 의류 마운팅 | Skeleton Binding, glTF | 3일 |
| 4 | 천 시뮬레이션 | Ammo.js Soft Body | 5일 |
| 5 | UI 통합 | React Three Fiber | 4일 |
| 6 | 최적화 | LOD, Texture Compression | 3일 |
| | **합계** | | **20일 (4주)** |

---

## 기술 스택

| 분류 | 기술 | 버전 | 비고 |
|------|------|------|------|
| 3D 렌더링 | Three.js | r168+ | WebGPU 우선, WebGL 폴백 |
| 아바타 | makehuman-js 또는 glTF 바디 모델 | - | 파라메트릭 체형 |
| 물리 엔진 | Ammo.js (Bullet 포팅) | - | Soft Body 시뮬레이션 |
| UI 프레임워크 | React + React Three Fiber | 18+ / 8+ | 선언적 3D |
| 상태 관리 | Zustand | 4+ | 경량 스토어 |
| 빌드 | Vite | 5+ | ESM 네이티브 |

### package.json 의존성

```json
{
  "dependencies": {
    "three": "^0.168.0",
    "three-stdlib": "^2.30.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.114.0",
    "ammo.js": "github:nicovince/ammo.js",
    "zustand": "^4.5.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/three": "^0.168.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

---

## 1. Scene 초기화

**목표:** WebGPU 우선 렌더러로 기본 3D 씬을 구성하고, 미지원 브라우저에서 WebGL로 자동 폴백한다.

### 코드

```typescript
// src/scene/initScene.ts
import * as THREE from "three";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer | InstanceType<typeof WebGPURenderer>;
  controls: OrbitControls;
}

export async function initScene(canvas: HTMLCanvasElement): Promise<SceneContext> {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // 카메라 — 전신 아바타가 보이는 위치
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.2, 3);

  // 렌더러 — WebGPU 시도 후 실패 시 WebGL 폴백
  let renderer: SceneContext["renderer"];
  try {
    const gpuRenderer = new WebGPURenderer({ canvas, antialias: true });
    await gpuRenderer.init();
    renderer = gpuRenderer;
    console.info("[Renderer] WebGPU 활성화");
  } catch {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    console.warn("[Renderer] WebGPU 미지원 — WebGL 폴백");
  }
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // 조명
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(2, 4, 3);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const hemi = new THREE.HemisphereLight(0xbde0fe, 0x444444, 0.4);
  scene.add(hemi);

  // 바닥 그리드
  const grid = new THREE.GridHelper(10, 20, 0xcccccc, 0xe0e0e0);
  scene.add(grid);

  // OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1.0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.update();

  return { scene, camera, renderer, controls };
}
```

### 예상 결과

- 빈 3D 씬에 바닥 그리드, 조명, 카메라가 배치된다.
- Chrome 등 WebGPU 지원 브라우저에서 GPU 렌더러가 동작하고, Safari/Firefox에서는 WebGL로 폴백된다.
- 마우스 드래그로 궤도 카메라 조작이 가능하다.

---

## 2. 아바타 로딩

**목표:** glTF 바디 모델을 로딩하고, morph target을 통해 체형 파라미터(키, 허리, 가슴 등)를 실시간 조절한다.

### 코드

```typescript
// src/avatar/loadAvatar.ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export interface AvatarHandle {
  model: THREE.Group;
  skeleton: THREE.Skeleton;
  morphMeshes: THREE.SkinnedMesh[];
  setBodyParam: (name: string, value: number) => void;
}

/**
 * morph target 이름 → 인덱스 매핑
 * glTF 모델 제작 시 Blender에서 Shape Key 이름을 아래와 일치시킨다.
 */
const BODY_PARAMS = [
  "height",       // 키
  "chest",        // 가슴둘레
  "waist",        // 허리둘레
  "hip",          // 엉덩이둘레
  "shoulder",     // 어깨너비
  "armLength",    // 팔길이
  "legLength",    // 다리길이
  "weight",       // 체중 (전체 볼륨)
] as const;

export type BodyParamName = (typeof BODY_PARAMS)[number];

export async function loadAvatar(
  scene: THREE.Scene,
  url = "/models/avatar_base.glb",
): Promise<AvatarHandle> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.name = "avatar";

  // SkinnedMesh 수집 및 스켈레톤 추출
  const morphMeshes: THREE.SkinnedMesh[] = [];
  let skeleton: THREE.Skeleton | null = null;

  model.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
      if (child.morphTargetDictionary) {
        morphMeshes.push(child);
      }
      if (!skeleton && child.skeleton) {
        skeleton = child.skeleton;
      }
    }
  });

  if (!skeleton) throw new Error("아바타 모델에 스켈레톤이 없습니다.");

  // 초기 포즈: T-Pose → A-Pose 변환 (자연스러운 착장 시뮬레이션용)
  applyAPose(skeleton);

  scene.add(model);

  // morph target 제어 함수
  function setBodyParam(name: string, value: number) {
    const clamped = THREE.MathUtils.clamp(value, 0, 1);
    for (const mesh of morphMeshes) {
      const idx = mesh.morphTargetDictionary?.[name];
      if (idx !== undefined && mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[idx] = clamped;
      }
    }
  }

  return { model, skeleton, morphMeshes, setBodyParam };
}

function applyAPose(skeleton: THREE.Skeleton) {
  const leftUpperArm = skeleton.getBoneByName("LeftUpperArm");
  const rightUpperArm = skeleton.getBoneByName("RightUpperArm");
  if (leftUpperArm) leftUpperArm.rotation.z = THREE.MathUtils.degToRad(30);
  if (rightUpperArm) rightUpperArm.rotation.z = THREE.MathUtils.degToRad(-30);
}
```

### 예상 결과

- glTF 바디 모델이 씬 중앙에 로딩되고 A-Pose로 서 있는 상태가 된다.
- `setBodyParam("chest", 0.7)` 호출 시 가슴둘레 morph target이 70%로 적용된다.
- 스켈레톤 본 구조가 추출되어 다음 단계(의류 마운팅)에서 사용 가능하다.

---

## 3. 의류 마운팅

**목표:** glTF 의류 모델을 아바타 스켈레톤에 바인딩하고, 아바타 포즈에 연동되도록 한다.

### 코드

```typescript
// src/garment/mountGarment.ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { AvatarHandle } from "../avatar/loadAvatar";

export interface GarmentHandle {
  model: THREE.Group;
  meshes: THREE.SkinnedMesh[];
  dispose: () => void;
}

/**
 * 의류 glTF는 아바타와 동일한 스켈레톤 기준으로 리깅되어 있어야 한다.
 * Blender에서 Armature Modifier → 동일 본 이름 사용.
 */
export async function mountGarment(
  scene: THREE.Scene,
  avatar: AvatarHandle,
  garmentUrl: string,
): Promise<GarmentHandle> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(garmentUrl);
  const model = gltf.scene;
  model.name = "garment";

  const meshes: THREE.SkinnedMesh[] = [];

  model.traverse((child) => {
    if (!(child instanceof THREE.SkinnedMesh)) return;

    // 아바타 스켈레톤으로 교체 바인딩
    rebindToAvatarSkeleton(child, avatar.skeleton);

    child.castShadow = true;
    child.frustumCulled = false;
    meshes.push(child);
  });

  scene.add(model);

  function dispose() {
    scene.remove(model);
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  return { model, meshes, dispose };
}

/**
 * 의류 메시의 스켈레톤을 아바타 스켈레톤으로 교체한다.
 * 본 이름 기준 매칭 후, bone index 리매핑.
 */
function rebindToAvatarSkeleton(
  garmentMesh: THREE.SkinnedMesh,
  avatarSkeleton: THREE.Skeleton,
) {
  const garmentSkeleton = garmentMesh.skeleton;
  const avatarBonesByName = new Map<string, number>();

  avatarSkeleton.bones.forEach((bone, idx) => {
    avatarBonesByName.set(bone.name, idx);
  });

  // 본 인덱스 리매핑 테이블
  const remap = new Map<number, number>();
  garmentSkeleton.bones.forEach((bone, gIdx) => {
    const aIdx = avatarBonesByName.get(bone.name);
    if (aIdx !== undefined) {
      remap.set(gIdx, aIdx);
    } else {
      console.warn(`[Garment] 매칭 실패 본: ${bone.name}`);
    }
  });

  // skinIndex 버퍼 업데이트
  const skinIndexAttr = garmentMesh.geometry.getAttribute("skinIndex");
  if (skinIndexAttr) {
    const arr = skinIndexAttr.array as Uint16Array;
    for (let i = 0; i < arr.length; i++) {
      const newIdx = remap.get(arr[i]);
      if (newIdx !== undefined) arr[i] = newIdx;
    }
    skinIndexAttr.needsUpdate = true;
  }

  // 스켈레톤 교체
  garmentMesh.skeleton = avatarSkeleton;
  garmentMesh.bind(avatarSkeleton);
}
```

### 예상 결과

- 의류 메시가 아바타 스켈레톤에 바인딩되어 아바타의 포즈 변경 시 의류도 따라 움직인다.
- 본 이름이 일치하지 않는 경우 콘솔에 경고가 출력되어 디버깅 가능하다.
- `dispose()` 호출로 GPU 리소스를 포함한 정리가 된다.

---

## 4. 천 시뮬레이션

**목표:** Ammo.js Soft Body를 활용해 기본적인 천 물리를 적용한다. 성능이 부족할 경우 pre-baked morph target 애니메이션으로 대체한다.

### 방안 A: Ammo.js Soft Body

```typescript
// src/physics/clothSim.ts
import Ammo from "ammo.js";

export interface ClothSimHandle {
  softBody: Ammo.btSoftBody;
  update: () => void;
  dispose: () => void;
}

let ammoReady: Promise<void> | null = null;
let physicsWorld: Ammo.btSoftRigidDynamicsWorld;
let softBodyHelper: Ammo.btSoftBodyHelpers;

export async function initPhysics(): Promise<void> {
  if (ammoReady) return ammoReady;
  ammoReady = Ammo().then((ammo: typeof Ammo) => {
    const collisionConfig = new ammo.btSoftBodyRigidBodyCollisionConfiguration();
    const dispatcher = new ammo.btCollisionDispatcher(collisionConfig);
    const broadphase = new ammo.btDbvtBroadphase();
    const solver = new ammo.btSequentialImpulseConstraintSolver();
    const softSolver = new ammo.btDefaultSoftBodySolver();

    physicsWorld = new ammo.btSoftRigidDynamicsWorld(
      dispatcher, broadphase, solver, collisionConfig, softSolver,
    );
    physicsWorld.setGravity(new ammo.btVector3(0, -9.8, 0));

    softBodyHelper = new ammo.btSoftBodyHelpers();
  });
  return ammoReady;
}

/**
 * Three.js 메시로부터 Ammo soft body를 생성한다.
 */
export function createClothSoftBody(
  mesh: THREE.SkinnedMesh,
  margin = 0.05,
): ClothSimHandle {
  const geom = mesh.geometry;
  const pos = geom.getAttribute("position");
  const idx = geom.getIndex();
  if (!idx) throw new Error("인덱스 버퍼 필요");

  const worldInfo = physicsWorld.getWorldInfo();
  worldInfo.set_m_gravity(new Ammo.btVector3(0, -9.8, 0));

  // 삼각형 배열로 soft body 생성
  const softBody = softBodyHelper.CreateFromTriMesh(
    worldInfo,
    pos.array as Float32Array,
    idx.array as Int32Array,
    idx.count / 3,
    true,
  );

  // 물성 설정
  const sbConfig = softBody.get_m_cfg();
  sbConfig.set_viterations(10);   // 속도 반복
  sbConfig.set_piterations(10);   // 위치 반복
  sbConfig.set_kDF(0.5);          // 동적 마찰
  sbConfig.set_kDP(0.01);         // 감쇠
  sbConfig.set_kLF(0.02);         // 양력 계수

  softBody.setTotalMass(0.5, false);
  softBody.get_m_materials().at(0).set_m_kLST(0.4);  // 선형 강성
  softBody.get_m_materials().at(0).set_m_kAST(0.4);  // 면적 강성

  physicsWorld.addSoftBody(softBody, 1, -1);

  function update() {
    physicsWorld.stepSimulation(1 / 60, 2);

    // soft body 노드 위치 → Three.js 버텍스 동기화
    const nodes = softBody.get_m_nodes();
    const posArr = pos.array as Float32Array;
    for (let i = 0; i < nodes.size(); i++) {
      const node = nodes.at(i);
      const p = node.get_m_x();
      posArr[i * 3] = p.x();
      posArr[i * 3 + 1] = p.y();
      posArr[i * 3 + 2] = p.z();
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }

  function dispose() {
    physicsWorld.removeSoftBody(softBody);
    Ammo.destroy(softBody);
  }

  return { softBody, update, dispose };
}
```

### 방안 B: Pre-Baked Morph Target (경량 대안)

```typescript
// src/physics/bakedCloth.ts
import * as THREE from "three";

/**
 * Blender에서 시뮬레이션 결과를 프레임별 Shape Key로 베이크한 glTF를 재생한다.
 * 실시간 물리 연산 없이 유사한 시각 효과를 낸다.
 */
export function playBakedClothAnimation(
  mesh: THREE.SkinnedMesh,
  fps = 30,
): { stop: () => void } {
  if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
    throw new Error("morph target이 없는 메시입니다.");
  }

  const frameCount = mesh.morphTargetInfluences.length;
  let currentFrame = 0;
  let intervalId: number;

  function tick() {
    // 이전 프레임 0으로
    if (mesh.morphTargetInfluences) {
      mesh.morphTargetInfluences.fill(0);
      // 현재 프레임 활성화
      mesh.morphTargetInfluences[currentFrame] = 1.0;
    }
    currentFrame = (currentFrame + 1) % frameCount;
  }

  intervalId = window.setInterval(tick, 1000 / fps);

  return {
    stop: () => window.clearInterval(intervalId),
  };
}
```

### 예상 결과

| 항목 | 방안 A (Ammo.js) | 방안 B (Baked) |
|------|------------------|----------------|
| 시각 품질 | 실시간 드레이프, 충돌 반응 | 사전 녹화된 고품질 |
| 성능 부하 | 높음 (모바일 주의) | 매우 낮음 |
| 체형 연동 | 가능 (런타임 갱신) | 제한적 (프리셋별 베이크 필요) |
| 구현 난이도 | 높음 | 낮음 |

> PoC에서는 **방안 B를 기본**으로 사용하고, 데스크톱 환경에서 방안 A를 선택적으로 활성화하는 전략을 권장한다.

---

## 5. UI 통합

**목표:** React Three Fiber를 사용해 3D 뷰포트와 측정값 입력, 의류 선택, 색상 변경 UI를 통합한다.

### 코드

```tsx
// src/App.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useState } from "react";
import { AvatarScene } from "./components/AvatarScene";
import { MeasurementForm } from "./components/MeasurementForm";
import { GarmentSelector } from "./components/GarmentSelector";
import { ColorPicker } from "./components/ColorPicker";

export interface BodyMeasurements {
  height: number;   // 0-1
  chest: number;
  waist: number;
  hip: number;
  weight: number;
}

const DEFAULT_MEASUREMENTS: BodyMeasurements = {
  height: 0.5, chest: 0.5, waist: 0.5, hip: 0.5, weight: 0.5,
};

export default function App() {
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS);
  const [garmentId, setGarmentId] = useState("tshirt_basic");
  const [garmentColor, setGarmentColor] = useState("#3b82f6");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 3D 뷰포트 */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 1.2, 3], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 4, 3]} intensity={1.2} castShadow />
            <Environment preset="studio" />
            <AvatarScene
              measurements={measurements}
              garmentId={garmentId}
              garmentColor={garmentColor}
            />
            <OrbitControls target={[0, 1, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* 사이드 패널 */}
      <aside style={{ width: 320, padding: 16, overflowY: "auto" }}>
        <h2>체형 설정</h2>
        <MeasurementForm
          values={measurements}
          onChange={setMeasurements}
        />

        <hr />

        <h2>의류 선택</h2>
        <GarmentSelector
          selected={garmentId}
          onSelect={setGarmentId}
        />

        <hr />

        <h2>색상</h2>
        <ColorPicker
          color={garmentColor}
          onChange={setGarmentColor}
        />
      </aside>
    </div>
  );
}
```

```tsx
// src/components/MeasurementForm.tsx
import type { BodyMeasurements } from "../App";

interface Props {
  values: BodyMeasurements;
  onChange: (v: BodyMeasurements) => void;
}

const LABELS: Record<keyof BodyMeasurements, string> = {
  height: "키",
  chest: "가슴둘레",
  waist: "허리둘레",
  hip: "엉덩이둘레",
  weight: "체중",
};

export function MeasurementForm({ values, onChange }: Props) {
  function handleChange(key: keyof BodyMeasurements, raw: string) {
    const num = Math.min(1, Math.max(0, parseFloat(raw) || 0));
    onChange({ ...values, [key]: num });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {(Object.keys(LABELS) as (keyof BodyMeasurements)[]).map((key) => (
        <label key={key} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{LABELS[key]}</span>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ width: 160 }}
          />
        </label>
      ))}
    </div>
  );
}
```

```tsx
// src/components/GarmentSelector.tsx
const GARMENTS = [
  { id: "tshirt_basic", label: "기본 티셔츠", thumb: "/thumbs/tshirt.png" },
  { id: "hoodie_zip",   label: "집업 후디",   thumb: "/thumbs/hoodie.png" },
  { id: "pants_slim",   label: "슬림 팬츠",   thumb: "/thumbs/pants.png" },
  { id: "jacket_bomber", label: "봄버 재킷",  thumb: "/thumbs/jacket.png" },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function GarmentSelector({ selected, onSelect }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {GARMENTS.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          style={{
            padding: 8,
            border: selected === g.id ? "2px solid #3b82f6" : "1px solid #ddd",
            borderRadius: 8,
            background: selected === g.id ? "#eff6ff" : "#fff",
            cursor: "pointer",
          }}
        >
          <img src={g.thumb} alt={g.label} style={{ width: "100%" }} />
          <div style={{ fontSize: 12, marginTop: 4 }}>{g.label}</div>
        </button>
      ))}
    </div>
  );
}
```

```tsx
// src/components/ColorPicker.tsx
const PRESETS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#111111", "#ffffff"];

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {PRESETS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 32, height: 32,
            borderRadius: "50%",
            background: c,
            border: color === c ? "3px solid #000" : "1px solid #ccc",
            cursor: "pointer",
          }}
        />
      ))}
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 32, height: 32, padding: 0, border: "none" }}
      />
    </div>
  );
}
```

### 예상 결과

- 좌측 3D 뷰포트에 아바타와 의류가 렌더링된다.
- 우측 패널의 슬라이더로 체형을 실시간 조절할 수 있다.
- 의류 선택 시 즉시 교체되고, 색상 변경이 material에 반영된다.

---

## 6. 최적화

**목표:** LOD, 텍스처 압축, 지연 로딩, 성능 모니터링을 적용해 모바일에서도 30fps 이상을 유지한다.

### 코드

```typescript
// src/optim/lod.ts
import * as THREE from "three";

/**
 * 아바타/의류 메시에 LOD를 적용한다.
 * 거리별로 다른 디테일 모델을 전환한다.
 */
export function createLOD(
  highPoly: THREE.Object3D,
  midPoly: THREE.Object3D,
  lowPoly: THREE.Object3D,
): THREE.LOD {
  const lod = new THREE.LOD();
  lod.addLevel(highPoly, 0);    // 0~3m
  lod.addLevel(midPoly, 3);     // 3~6m
  lod.addLevel(lowPoly, 6);     // 6m 이상
  return lod;
}
```

```typescript
// src/optim/textureCompression.ts
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import * as THREE from "three";

/**
 * KTX2 (Basis Universal) 압축 텍스처를 로드한다.
 * GPU 네이티브 포맷으로 디코딩되어 VRAM 사용량 60-75% 절감.
 */
export function createKTX2Loader(renderer: THREE.WebGLRenderer): KTX2Loader {
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath("/basis/");
  ktx2Loader.detectSupport(renderer);
  return ktx2Loader;
}

export async function loadCompressedTexture(
  loader: KTX2Loader,
  url: string,
): Promise<THREE.CompressedTexture> {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}
```

```typescript
// src/optim/lazyLoader.ts
import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver 기반 지연 로딩 훅.
 * 뷰포트에 진입할 때만 3D 에셋을 로드한다.
 */
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
): { data: T | null; ref: React.RefObject<HTMLDivElement | null> } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadFn().then(setData);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [loadFn]);

  return { data, ref };
}
```

```typescript
// src/optim/perfMonitor.ts
import * as THREE from "three";

/**
 * 프레임 단위 성능 메트릭 수집 및 콘솔 리포트.
 */
export class PerfMonitor {
  private frames = 0;
  private lastTime = performance.now();
  private drawCalls = 0;
  private triangles = 0;

  update(renderer: THREE.WebGLRenderer) {
    this.frames++;
    this.drawCalls = renderer.info.render.calls;
    this.triangles = renderer.info.render.triangles;

    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      const fps = Math.round(this.frames / ((now - this.lastTime) / 1000));
      console.table({
        FPS: fps,
        "Draw Calls": this.drawCalls,
        Triangles: this.triangles.toLocaleString(),
        "Textures (GPU)": renderer.info.memory.textures,
        "Geometries (GPU)": renderer.info.memory.geometries,
      });

      if (fps < 30) {
        console.warn("[Perf] FPS 30 미만 — LOD 강제 하향 또는 시뮬레이션 비활성화 권장");
      }

      this.frames = 0;
      this.lastTime = now;
    }
  }
}
```

### 예상 결과

| 최적화 기법 | 개선 효과 |
|------------|-----------|
| LOD | 원거리 메시 폴리곤 80% 절감 |
| KTX2 텍스처 | VRAM 60-75% 절감 |
| 지연 로딩 | 초기 로드 시간 50% 단축 |
| 성능 모니터링 | 병목 실시간 감지 |

---

## 전체 타임라인

```
Week 1: [Phase 1 Scene 초기화] [Phase 2 아바타 로딩 ----]
Week 2: [Phase 2 ---] [Phase 3 의류 마운팅 -----------]
Week 3: [Phase 4 천 시뮬레이션 ----------------------]
Week 4: [Phase 5 UI 통합 --------] [Phase 6 최적화 ---]
```

---

## 알려진 제약사항

| 항목 | 제약 | 대응 방안 |
|------|------|-----------|
| WebGPU 지원 | Chrome 한정 (2026.03 기준) | WebGL 자동 폴백 구현 완료 |
| Ammo.js WASM 크기 | ~1.5MB gzip | 천 시뮬레이션 필요 시에만 동적 로드 |
| 의류 스켈레톤 호환 | 아바타와 동일 본 이름 필수 | 제작 파이프라인에 Blender 템플릿 제공 |
| morph target 수 | glTF 스펙상 단일 메시 최대 8개 권장 | 체형 파라미터 그룹핑으로 대응 |
| 모바일 성능 | Soft Body 실시간 연산 불가 | Baked morph 방안 B 사용 |
| 셀프 콜리전 | Ammo.js soft body 셀프 충돌 불안정 | PoC 범위에서 제외, 추후 Wasm cloth solver 검토 |

---

## 다음 단계 (Post-PoC)

1. **사진 기반 신체 추정** — MediaPipe Pose heavy 모델로 사진 2장에서 키포인트 추출 → 신체 치수 자동 변환 (온디바이스, 서버 비용 없음)
2. **사이즈 추천 엔진** — 체형 파라미터 + 의류 패턴 데이터 기반 ML 모델
3. **AI 텍스처 생성** — Stable Diffusion 기반 패턴/프린트 실시간 생성
4. **멀티 레이어 착장** — 이너웨어 + 아우터 동시 시뮬레이션
5. **AR 연동** — WebXR Device API를 통한 거울 모드
6. **서버 사이드 렌더링** — 저사양 기기용 클라우드 렌더링 스트리밍
7. **성능 벤치마크** — 실제 디바이스별 (iPhone, Galaxy, Desktop) FPS 측정 및 LOD 프리셋 자동화
