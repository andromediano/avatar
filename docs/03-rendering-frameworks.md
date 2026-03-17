# 웹 3D 렌더링 프레임워크 조사

> 가상 피팅 서비스에 적합한 웹 3D 렌더링 프레임워크를 비교·분석한다.

---

## 1. Three.js

Three.js는 현재 웹 3D 분야에서 가장 큰 생태계를 보유한 라이브러리다.

| 항목 | 수치 / 현황 |
|------|-------------|
| npm 주간 다운로드 | ~4,500,000+ |
| GitHub Stars | ~103k |
| 커뮤니티 | Discord, Stack Overflow, 포럼 활발 |
| 릴리스 주기 | 월 1회 이상 |

### 1-1. React Three Fiber (R3F) 통합

React Three Fiber는 Three.js를 React 선언적 패러다임으로 래핑한다. 가상 피팅처럼 UI 상태가 복잡한 앱에서 특히 유리하다.

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

function FittingScene({ garmentUrl }: { garmentUrl: string }) {
  return (
    <Canvas shadows gl={{ antialias: true }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} castShadow />
      <GarmentModel url={garmentUrl} />
      <OrbitControls enablePan={false} />
      <Environment preset="studio" />
    </Canvas>
  )
}
```

### 1-2. WebGPURenderer

Three.js r160+부터 `WebGPURenderer`가 실험적으로 지원된다. 기존 `WebGLRenderer`를 대체하는 방식으로, 렌더 파이프라인 코드 변경 없이 백엔드만 교체할 수 있다.

```ts
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js'

const renderer = new WebGPURenderer({ antialias: true })
await renderer.init()
```

---

## 2. Babylon.js

Babylon.js는 Microsoft가 공식 지원하는 풀스택 3D 엔진이다.

| 항목 | 특징 |
|------|------|
| 지원사 | Microsoft (Azure 연동) |
| 물리 엔진 | Havok 내장 (v6+) |
| Inspector | 브라우저 내장 디버그 도구 제공 |
| PBR | 기본 머티리얼이 PBR (`PBRMaterial`) |
| Node Material Editor | GUI 기반 셰이더 편집기 |

Babylon.js는 올인원 솔루션에 가깝지만, 번들 크기가 크고 React 생태계 통합이 Three.js 대비 약하다.

---

## 3. 프레임워크 비교표

| 기준 | Three.js | Babylon.js |
|------|----------|------------|
| 커뮤니티 규모 | 매우 큼 (GitHub 103k+) | 큼 (GitHub 23k+) |
| 번들 크기 (min+gzip) | ~160KB (코어) | ~800KB+ (풀 패키지) |
| 학습 곡선 | 중간 (저수준 API) | 중간~높음 (API 범위 넓음) |
| TypeScript 지원 | 내장 타입 제공 | 네이티브 TS로 작성됨 |
| 물리 엔진 통합 | 외부 라이브러리 (cannon-es, rapier) | Havok 내장 |
| 모바일 성능 | 우수 (경량 코어) | 보통 (번들 크기 영향) |
| React 통합 | React Three Fiber (성숙) | react-babylonjs (제한적) |

---

## 4. WebGL 2.0 vs WebGPU

| 기능 | WebGL 2.0 | WebGPU |
|------|-----------|--------|
| Compute Shader | 미지원 | 지원 |
| 멀티스레드 렌더링 | 미지원 | 지원 |
| 파이프라인 상태 관리 | 암시적 (글로벌 상태) | 명시적 (파이프라인 객체) |
| 셰이더 언어 | GLSL ES 3.0 | WGSL |
| GPU 메모리 관리 | 드라이버 의존 | 애플리케이션 제어 가능 |
| Draw Call 오버헤드 | 높음 | 낮음 (배칭 최적화) |

### 4-1. 브라우저 지원 현황

| 브라우저 | WebGL 2.0 | WebGPU |
|----------|-----------|--------|
| Chrome | 56+ (안정) | 113+ (안정) |
| Firefox | 51+ (안정) | Nightly (플래그) |
| Safari | 15+ (안정) | Technology Preview |
| 모바일 Chrome | 안정 | Android 113+ (제한적) |
| iOS Safari | 15+ | 미지원 (TP 제외) |

> WebGPU는 Compute Shader 활용 시 의류 시뮬레이션(천 물리) 연산을 GPU에서 직접 처리할 수 있어 가상 피팅에 유리하다. 다만 폴백 전략은 필수다.

---

## 5. PBR 머티리얼 — 패브릭 렌더링

의류 소재를 사실적으로 표현하려면 PBR(Physically Based Rendering) 파라미터를 정밀하게 조정해야 한다.

### 5-1. 핵심 파라미터

| 파라미터 | 용도 | 패브릭 권장값 |
|----------|------|---------------|
| `roughness` | 표면 거칠기 | 0.7~0.95 (면: 0.9, 실크: 0.3) |
| `metalness` | 금속성 | 0.0 (비금속 소재) |
| `normalMap` | 직물 질감 표현 | 고해상도 법선맵 필수 |
| `aoMap` | 주름·접힘 음영 | Ambient Occlusion 맵 적용 |

### 5-2. Subsurface Scattering (SSS)

얇은 원단(쉬폰, 실크)은 빛이 투과하므로 SSS 효과가 필요하다.

```ts
// Three.js MeshPhysicalMaterial SSS 설정
const fabricMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.4,
  metalness: 0.0,
  transmission: 0.3,        // 빛 투과율
  thickness: 0.5,           // 소재 두께
  color: new THREE.Color('#e8d5c4'),
  normalMap: normalTexture,
  normalScale: new THREE.Vector2(1.0, 1.0),
})
```

---

## 6. 환경 조명 (Environment Lighting)

### 6-1. HDR 환경맵

스튜디오 조명을 재현하려면 HDR 환경맵을 사용한다. `.hdr` 또는 `.exr` 포맷을 PMREM(Prefiltered Mipmap Radiance Environment Map)으로 변환하여 적용한다.

```ts
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const pmremGenerator = new THREE.PMREMGenerator(renderer)
new RGBELoader().load('/env/studio_small.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture
  scene.environment = envMap
  texture.dispose()
  pmremGenerator.dispose()
})
```

### 6-2. Image-Based Lighting (IBL)

IBL은 환경맵에서 Diffuse Irradiance와 Specular Radiance를 분리 추출하여 적용하는 기법이다. Three.js의 `MeshStandardMaterial`은 `scene.environment` 설정 시 자동으로 IBL을 적용한다.

| IBL 구성 요소 | 역할 |
|---------------|------|
| Diffuse Irradiance Map | 전체적인 간접광 색조 |
| Specular Prefiltered Map | 반사 하이라이트 |
| BRDF LUT | 프레넬 항 근사 |

---

## 7. 그림자 기법

| 기법 | 설명 | 품질 | 비용 |
|------|------|------|------|
| PCF (Percentage Closer Filtering) | 셰도우맵 주변 샘플 평균 | 중 | 낮음 |
| VSM (Variance Shadow Maps) | 분산 기반 소프트 셰도우 | 중~상 | 중간 |
| Contact Shadows | 화면 공간 기반 밀착 그림자 | 상 | 높음 |

가상 피팅에서는 의류와 신체 접촉부의 **Contact Shadow**가 사실감에 큰 영향을 준다. R3F에서는 `@react-three/drei`의 `<ContactShadows>` 컴포넌트로 간편하게 적용 가능하다.

```tsx
<ContactShadows
  position={[0, -0.01, 0]}
  opacity={0.5}
  scale={10}
  blur={2.5}
  far={4}
/>
```

---

## 8. 모바일 최적화

### 8-1. LOD (Level of Detail)

카메라 거리에 따라 메시 해상도를 전환하여 폴리곤 수를 절감한다.

```ts
const lod = new THREE.LOD()
lod.addLevel(highDetailMesh, 0)    // 0~2m
lod.addLevel(midDetailMesh, 2)     // 2~5m
lod.addLevel(lowDetailMesh, 5)     // 5m+
scene.add(lod)
```

### 8-2. 텍스처 압축 (KTX2 / Basis Universal)

| 포맷 | 압축률 | GPU 디코딩 | 비고 |
|------|--------|-----------|------|
| KTX2 + Basis Universal | 4~8x | ASTC, ETC2, BC7 자동 변환 | 권장 |
| PNG | 1x (기준) | 미지원 | 메모리 비효율 |
| JPEG | 2~3x | 미지원 | 알파 채널 없음 |

```ts
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/libs/basis/')
  .detectSupport(renderer)
```

### 8-3. Instanced Rendering

동일 의류 아이템 목록 렌더링 시 인스턴싱으로 Draw Call을 1회로 줄인다.

```ts
const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
for (let i = 0; i < count; i++) {
  matrix.setPosition(i * 2, 0, 0)
  instancedMesh.setMatrixAt(i, matrix)
}
```

### 8-4. Draw Call 절감 전략

- 머티리얼 공유: 동일 셰이더 파라미터의 오브젝트는 하나의 머티리얼 인스턴스 사용
- 지오메트리 병합: `BufferGeometryUtils.mergeGeometries()`로 정적 메시 통합
- 텍스처 아틀라스: 여러 텍스처를 하나의 대형 텍스처로 합침
- Frustum Culling: Three.js 기본 활성화 — 비활성화하지 않도록 주의

---

## 9. 성능 예산 (Performance Budget)

| 항목 | 목표값 |
|------|--------|
| 프레임 레이트 | 60 FPS (중급 모바일 기준) |
| 초기 로딩 시간 | < 3초 (3G: < 5초) |
| JS 번들 크기 | < 300KB (gzip) |
| 총 에셋 크기 | < 5MB (초기 로드) |
| 폴리곤 수 | < 100K (의류 단일 모델) |
| 텍스처 메모리 | < 50MB (모바일 VRAM 기준) |
| Draw Calls | < 50 / 프레임 |

> 중급 모바일 기준: Snapdragon 6 시리즈 또는 동급 GPU. 저사양 기기에서는 그림자·후처리 효과를 자동 비활성화하는 품질 티어 시스템을 구성한다.

---

## 10. 최종 권장 스택

```
Three.js + React Three Fiber + WebGPU (WebGL 2.0 폴백)
```

### 선정 근거

1. **생태계**: Three.js는 npm 다운로드, 커뮤니티, 서드파티 도구 면에서 압도적이다
2. **React 통합**: R3F + drei + zustand 조합으로 상태 관리가 깔끔하다
3. **번들 크기**: 코어 ~160KB로 모바일 로딩 제약을 충족한다
4. **WebGPU 전환**: `WebGPURenderer`로 점진 전환이 가능하며, Compute Shader를 활용한 천 시뮬레이션에 대비할 수 있다
5. **폴백 안정성**: WebGPU 미지원 환경에서 WebGL 2.0으로 자동 폴백하여 호환성을 확보한다

### 폴백 전략 구현

```ts
async function createRenderer(canvas: HTMLCanvasElement) {
  if (navigator.gpu) {
    const { default: WebGPURenderer } = await import(
      'three/addons/renderers/webgpu/WebGPURenderer.js'
    )
    const renderer = new WebGPURenderer({ canvas, antialias: true })
    await renderer.init()
    return renderer
  }

  // WebGL 2.0 폴백
  return new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  })
}
```

---

> 작성일: 2026-03-18
