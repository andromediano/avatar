# 오픈소스 프로젝트 및 참고자료

> 3D 아바타 가상 피팅 시스템 구축에 활용 가능한 오픈소스 프로젝트, 표준 규격, 학습 자료를 정리한다.

---

## 1. 인체 모델 (Body Models)

3D 아바타 생성과 파라메트릭 바디 모델링을 위한 프로젝트들이다.

| 프로젝트 | URL | 라이선스 | 설명 | 비고 |
|----------|-----|----------|------|------|
| **SMPL / SMPL-X** | https://smpl-x.is.tue.mpg.de | 연구 목적 무료 | Max Planck Institute 개발. 파라메트릭 인체 모델의 사실상 표준. shape/pose 파라미터로 다양한 체형 표현 | 논문 인용 10,000+ |
| **makehuman-js** | https://github.com/makehuman-js/makehuman-js | AGPL-3.0 | MakeHuman의 JavaScript 포팅. 브라우저에서 파라메트릭 인체 모델 생성 가능 | 웹 기반 |
| **MB-Lab** | https://github.com/animate1978/MB-Lab | GPL-3.0 | Blender 애드온. 해부학적으로 정확한 인체 모델 생성. 다양한 인종/체형 프리셋 제공 | Blender 3.x 지원 |
| **MakeHuman** | https://www.makehumancommunity.org | AGPL-3.0 | 독립 실행형 파라메트릭 인체 모델링 도구. GUI 기반으로 비개발자도 접근 가능 | 커뮤니티 활발 |
| **Ready Player Me Web SDK** | https://github.com/readyplayerme/rpm-web-sdk | MIT | 사진 기반 3D 아바타 자동 생성 API. glTF 포맷 출력. 상반신/전신 아바타 지원 | 상용 API (무료 티어 有) |

SMPL 모델 로드 예시 (Python):

```python
import smplx
import torch

model = smplx.create(
    model_path='./models',
    model_type='smplx',
    gender='neutral',
    num_betas=10,
)

betas = torch.randn(1, 10)   # 체형 파라미터
body_pose = torch.zeros(1, 63)  # 관절 포즈

output = model(betas=betas, body_pose=body_pose)
vertices = output.vertices.detach().numpy()
```

---

## 2. 천 시뮬레이션 (Cloth Simulation)

실시간 의류 물리 시뮬레이션을 위한 물리 엔진 및 유틸리티이다.

| 프로젝트 | URL | 라이선스 | 설명 | 비고 |
|----------|-----|----------|------|------|
| **Ammo.js** | https://github.com/kripken/ammo.js | zlib | Bullet Physics의 Emscripten 포팅. soft body dynamics로 천 시뮬레이션 가능 | Stars 4,000+ |
| **cannon-es** | https://github.com/pmndrs/cannon-es | MIT | 경량 3D 물리 엔진. ES 모듈 지원. Three.js 생태계와 통합 용이 | pmndrs 유지보수 |
| **Oimo.js** | https://github.com/nicoptere/oimo.js | MIT | 경량 rigid body 물리 엔진. 파일 크기가 작아 모바일 웹 적합 | 약 100KB |
| **gpu-curtains** | https://github.com/martinlaxenaire/gpu-curtains | MIT | WebGPU 기반 렌더링/컴퓨팅 라이브러리. GPU compute shader로 천 시뮬레이션 가속 가능 | WebGPU 필수 |
| **Verlet.js** | https://github.com/subprotocol/verlet-js | MIT | Verlet 적분 기반 2D/3D 파티클 시뮬레이션. 천 시뮬레이션의 기초 원리 학습에 적합 | 교육용 |

Verlet 기반 천 시뮬레이션 핵심 알고리즘:

```javascript
// 거리 제약 조건 (Distance Constraint)
function solveConstraint(p1, p2, restLength) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const diff = (restLength - dist) / dist * 0.5;

  p1.x -= dx * diff;
  p1.y -= dy * diff;
  p1.z -= dz * diff;
  p2.x += dx * diff;
  p2.y += dy * diff;
  p2.z += dz * diff;
}
```

---

## 3. 렌더링 (Rendering)

WebGL/WebGPU 기반 3D 렌더링 및 관련 도구이다.

| 프로젝트 | URL | 라이선스 | 설명 | 비고 |
|----------|-----|----------|------|------|
| **Three.js** | https://github.com/mrdoob/three.js | MIT | 웹 3D 렌더링의 사실상 표준. glTF 로더, PBR 렌더링, 포스트프로세싱 내장 | Stars 100k+ |
| **Babylon.js** | https://github.com/BabylonJS/Babylon.js | Apache-2.0 | Microsoft 후원 웹 3D 엔진. 물리 엔진 통합, WebGPU 지원, GUI 에디터 제공 | Stars 23k+ |
| **React Three Fiber** | https://github.com/pmndrs/react-three-fiber | MIT | Three.js의 React 렌더러. 선언적 API로 3D 씬 구성. 상태 관리와 자연스럽게 통합 | React 생태계 |
| **drei** | https://github.com/pmndrs/drei | MIT | React Three Fiber용 헬퍼 컴포넌트 모음. OrbitControls, Environment, useGLTF 등 제공 | 필수 동반 라이브러리 |
| **react-three-rapier** | https://github.com/pmndrs/react-three-rapier | MIT | Rapier 물리 엔진의 R3F 바인딩. rigid/soft body 시뮬레이션을 선언적으로 구성 | Rapier(Rust) 기반 |
| **glTF-Transform** | https://github.com/donmccurdy/glTF-Transform | MIT | glTF 파일 읽기/쓰기/최적화 CLI 및 라이브러리. 메시 압축, 텍스처 리사이즈 등 | Don McCurdy 개발 |
| **KTX2 Encoder (Basis Universal)** | https://github.com/BinomialLLC/basis_universal | Apache-2.0 | GPU 텍스처 압축 포맷. glTF에서 KTX2로 텍스처를 압축하면 VRAM 사용량 75% 절감 | Binomial 개발 |

glTF 모델 로드 및 렌더링 (React Three Fiber):

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function AvatarModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function Viewer() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={0.4} />
      <Environment preset="studio" />
      <AvatarModel url="/models/avatar.glb" />
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  );
}
```

---

## 4. AR / 신체 추적 (AR / Body Tracking)

카메라 기반 신체 인식 및 AR 오버레이 기술이다.

| 프로젝트 | URL | 라이선스 | 설명 | 비고 |
|----------|-----|----------|------|------|
| **MediaPipe** | https://github.com/google-ai-edge/mediapipe | Apache-2.0 | Google 개발. Pose/Holistic/Face 등 다양한 ML 파이프라인. 33개 신체 랜드마크 실시간 추출 | 모바일/웹 모두 지원 |
| **TensorFlow.js Pose Detection** | https://github.com/tensorflow/tfjs-models | Apache-2.0 | MoveNet/BlazePose 등 포즈 추정 모델. 브라우저에서 실시간 추론 가능 | WebGL 가속 |
| **WebXR Samples** | https://github.com/nicokosi/nicokosi.github.io | - | WebXR Device API 활용 예제 모음. AR 세션 생성, hit test, anchor 등 기능 시연 | Immersive Web WG |
| **AR.js** | https://github.com/AR-js-org/AR.js | MIT | 마커 기반 / 이미지 추적 / GPS 기반 웹 AR. Three.js 및 A-Frame과 통합 | 경량, 플러그인 불필요 |
| **MindAR** | https://github.com/nicokosi/nicokosi.github.io | MIT | 이미지 추적 및 얼굴 추적 웹 AR 라이브러리. TensorFlow.js 기반 얼굴 메시 추출 | 광고 없음 |

MediaPipe Pose로 신체 랜드마크 추출:

```javascript
import { Pose } from '@mediapipe/pose';

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults((results) => {
  if (results.poseLandmarks) {
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    console.log('어깨 너비 (정규화):', shoulderWidth);
  }
});
```

---

## 5. 의류 모델링 도구 (Garment Modeling Tools)

3D 의류 패턴 제작 및 시뮬레이션 도구이다.

| 프로젝트 | URL | 라이선스 | 설명 | 비고 |
|----------|-----|----------|------|------|
| **Blender** | https://www.blender.org | GPL-2.0 | 범용 3D 모델링/애니메이션 도구. Cloth 시뮬레이션 모듈 내장. Python 스크립팅으로 자동화 가능 | 오픈소스 |
| **CLO3D** | https://www.clo3d.com | 상용 (구독) | 패션 업계 표준 3D 의류 시뮬레이션 도구. 2D 패턴 → 3D 시뮬레이션 워크플로 | 교육용 라이선스 有 |
| **Marvelous Designer** | https://www.marvelousdesigner.com | 상용 (구독) | 게임/영화 업계에서 널리 사용. 직관적 패턴 드래핑. OBJ/FBX 내보내기 지원 | Steam 판매 |
| **Seamly2D** | https://github.com/FashionFreedom/Seamly2D | GPL-3.0 | 오픈소스 패턴 메이킹 소프트웨어. 파라메트릭 패턴 설계. 치수 변경 시 자동 재계산 | 커뮤니티 주도 |

Blender Python 스크립트로 Cloth 시뮬레이션 설정:

```python
import bpy

# 의류 오브젝트에 Cloth 모디파이어 추가
garment = bpy.data.objects['Garment']
bpy.context.view_layer.objects.active = garment

bpy.ops.object.modifier_add(type='CLOTH')
cloth = garment.modifiers['Cloth']

# 면 소재 프리셋 설정
cloth.settings.quality = 12
cloth.settings.mass = 0.3          # kg/m²
cloth.settings.tension_stiffness = 15.0
cloth.settings.compression_stiffness = 15.0
cloth.settings.bending_stiffness = 0.5

# 충돌 설정
cloth.collision_settings.use_collision = True
cloth.collision_settings.distance_min = 0.005
```

---

## 6. 관련 가상 피팅 프로젝트 (Virtual Fitting Projects)

GitHub에서 찾을 수 있는 오픈소스 가상 피팅 / 가상 탈의실 프로젝트들이다.

| 프로젝트 | URL | 설명 | 기술 스택 |
|----------|-----|------|-----------|
| **VITON-HD** | https://github.com/shadow2496/VITON-HD | 고해상도(1024x768) 이미지 기반 가상 의류 착용. GAN 활용 | PyTorch, GAN |
| **HR-VITON** | https://github.com/sangyun884/HR-VITON | 고해상도 가상 피팅. 왜곡 방지 기법 적용 | PyTorch |
| **GP-VTON** | https://github.com/xiezhy6/GP-VTON | General Purpose Virtual Try-On. 다양한 의류 카테고리 지원 | PyTorch, Diffusion |
| **OOTDiffusion** | https://github.com/levihsu/OOTDiffusion | Diffusion 기반 가상 피팅. 고품질 결과물 생성 | PyTorch, Stable Diffusion |
| **IDM-VTON** | https://github.com/yisol/IDM-VTON | Diffusion 모델 기반 고품질 가상 시착. 텍스처 보존력 우수 | PyTorch, IP-Adapter |
| **TryOnDiffusion** | (Google Research, 논문 공개) | 두 장의 이미지에서 가상 시착 결과 합성. 포즈 변환 포함 | Diffusion Model |

> **참고**: 이미지 기반 VTON(Virtual Try-On) 프로젝트는 2D 결과물을 생성한다. 3D 실시간 피팅과는 접근 방식이 다르지만, 텍스처 전이나 의류 세그멘테이션 기법은 3D 파이프라인에도 응용할 수 있다.

---

## 7. 학습 자료 (Learning Resources)

### 7.1 핵심 논문

| 논문 | 연도 | 내용 |
|------|------|------|
| *SMPL: A Skinned Multi-Person Linear Model* | 2015 | 파라메트릭 인체 모델의 기초. shape/pose 분리 표현 |
| *Learning to Dress 3D People in Generative Clothing* (CAPE) | 2020 | 의류 변형을 인체 모델 위에 학습 |
| *TailorNet: Predicting Clothing in 3D* | 2020 | 체형/포즈/스타일에 따른 의류 변형 예측 네트워크 |
| *CLOTH3D: Clothed 3D Humans* | 2020 | 대규모 합성 의류 데이터셋 |
| *Self-Supervised Collision Handling via Generative 3D Garment Models* | 2021 | 자기 충돌 처리를 학습한 의류 생성 모델 |
| *DiffCloth: Differentiable Cloth Simulation* | 2022 | 미분 가능 천 시뮬레이션. 역문제 풀이 가능 |

### 7.2 튜토리얼 및 강좌

| 자료 | 유형 | 내용 |
|------|------|------|
| Three.js Journey (threejs-journey.com) | 유료 강좌 | Three.js 기초부터 고급 셰이더까지. 물리 시뮬레이션 챕터 포함 |
| Discover three.js (discoverthreejs.com) | 무료 웹북 | Three.js 체계적 입문서 |
| The Coding Train — Cloth Simulation | YouTube | Daniel Shiffman의 Verlet 기반 천 시뮬레이션 코딩 튜토리얼 |
| Sebastian Lague — Cloth Simulation | YouTube | GPU 기반 천 시뮬레이션 구현 과정을 시각적으로 설명 |
| Ten Minute Physics | YouTube | Matthias Muller(NVIDIA)의 물리 시뮬레이션 미니 강의. XPBD 기반 천 시뮬레이션 포함 |
| Blender Guru — Cloth Simulation | YouTube | Blender Cloth 모디파이어 실습 |
| CS 184 (UC Berkeley) | 대학 강좌 | Computer Graphics 기초. 천 시뮬레이션 수학적 기초 |

### 7.3 기술 블로그 및 아티클

- **NVIDIA GameWorks — FleX**: GPU 기반 통합 파티클 물리 엔진 기술 문서
- **Inria SMPL tutorials**: SMPL 모델 활용 실습 가이드
- **Google AI Blog — MediaPipe**: 포즈 추정 모델 아키텍처 해설

---

## 8. 표준 규격 (Standards)

가상 피팅의 정확도와 호환성을 위해 참조해야 할 표준 규격이다.

| 표준 | 관리 기관 | 설명 | 활용 |
|------|-----------|------|------|
| **glTF 2.0** | Khronos Group | 3D 모델 전송 포맷 표준. PBR 재질, 스키닝, 모프 타겟 지원 | 아바타/의류 모델 포맷 |
| **ISO 8559-1:2017** | ISO | 의류 치수 체계 — 인체 측정 정의 및 절차 | 신체 치수 측정 기준 |
| **ISO 8559-2:2017** | ISO | 의류 치수 체계 — 1차 및 2차 치수 지정 | 의류 사이즈 기준점 |
| **KS K 0051** | 한국산업표준 | 한국인 체형 기반 의류 치수 체계. 성별/연령별 표준 치수 규정 | 국내 사이즈 매핑 |
| **KS K 0050** | 한국산업표준 | 인체 측정 방법 및 측정 부위 정의 | 신체 측정 포인트 매핑 |

glTF 2.0에서 의류 메시에 모프 타겟 적용 구조:

```json
{
  "meshes": [{
    "primitives": [{
      "attributes": { "POSITION": 0, "NORMAL": 1 },
      "targets": [
        { "POSITION": 2, "NORMAL": 3 },
        { "POSITION": 4, "NORMAL": 5 }
      ]
    }]
  }],
  "accessors": [
    { "bufferView": 0, "componentType": 5126, "count": 1024, "type": "VEC3" }
  ]
}
```

---

## 9. 커뮤니티 (Community Resources)

기술 문제 해결과 최신 동향 파악에 유용한 커뮤니티이다.

| 커뮤니티 | URL | 특징 |
|----------|-----|------|
| **Three.js Discourse** | https://discourse.threejs.org | Three.js 공식 포럼. 렌더링, 성능, glTF 관련 질문 활발 |
| **r/threejs** | https://reddit.com/r/threejs | Three.js 작품 공유 및 기술 토론 |
| **r/webgl** | https://reddit.com/r/webgl | WebGL/WebGPU 전반 기술 토론 |
| **Blender Stack Exchange** | https://blender.stackexchange.com | Blender 관련 Q&A. Cloth 시뮬레이션 설정 문제 해결에 유용 |
| **Blender Artists** | https://blenderartists.org | Blender 사용자 커뮤니티. 의류 모델링 워크플로 공유 |
| **Khronos glTF GitHub** | https://github.com/KhronosGroup/glTF | glTF 스펙 이슈/토론. 확장 제안 및 호환성 문제 논의 |
| **WebXR Discord** | Immersive Web Community Group | WebXR API 관련 토론 및 최신 브라우저 지원 현황 |

---

## 10. 기술 스택 선정 가이드

프로젝트 요구사항별 권장 조합이다.

| 시나리오 | 프론트엔드 | 물리 엔진 | 바디 모델 | 비고 |
|----------|-----------|-----------|-----------|------|
| **MVP / 프로토타입** | R3F + drei | cannon-es | Ready Player Me | 빠른 구현, 낮은 진입장벽 |
| **고품질 렌더링** | Three.js 직접 사용 | Ammo.js (soft body) | SMPL-X + 커스텀 | PBR + 포스트프로세싱 최적화 |
| **모바일 최적화** | Three.js (경량 빌드) | Oimo.js | MakeHuman (저폴리) | 텍스처 KTX2 압축 필수 |
| **WebGPU 차세대** | gpu-curtains / Babylon.js | GPU compute shader | SMPL-X | 브라우저 지원 확인 필요 |
| **AR 피팅** | R3F + MindAR | react-three-rapier | MediaPipe 포즈 기반 | 카메라 권한 필요 |

---

> **마지막 업데이트**: 2026-03-18 — 각 프로젝트의 최신 버전 및 활성 상태는 해당 저장소에서 직접 확인할 것.
