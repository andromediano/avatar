# 3D 인체 모델 기술 조사

## 1. 기술 개요

가상 피팅에서 사용자 체형을 표현하기 위한 3D 인체 모델 기술.
**파라메트릭 모델**(체형/포즈 파라미터로 메쉬 생성)이 핵심이며, 웹 환경 지원 여부가 프로젝트 선택의 관건.

---

## 2. 주요 기술 상세

### 2.1 SMPL / SMPL-X (Max Planck Institute)

학술 분야 표준 인체 모델. 통계적 체형 공간을 학습하여 소수 파라미터로 사실적인 인체 메쉬 생성.

| 항목 | SMPL | SMPL-X |
|------|------|--------|
| Shape 파라미터 | 10 (PCA) | 10 |
| Pose 파라미터 | 72 (24 joints x 3) | 55 joints + 손/표정 |
| 정점 수 | 6,890 | 10,475 |
| 라이선스 | 학술 전용 (MPI) | 학술 전용 (MPI) |
| 상업적 사용 | **불가** (별도 라이선스 협상) | **불가** |
| 구현 | Python / PyTorch | Python / PyTorch |
| 웹 지원 | 직접 불가 (서버에서 메쉬 생성 후 전송) | 직접 불가 |

```python
# SMPL 기본 사용 예시 (서버 사이드)
import torch
from smplx import SMPL

model = SMPL(model_path='./models/smpl', gender='neutral')
betas = torch.zeros(1, 10)   # shape 파라미터 (체형)
poses = torch.zeros(1, 72)   # pose 파라미터 (관절 회전)

output = model(betas=betas, body_pose=poses[:, 3:], global_orient=poses[:, :3])
vertices = output.vertices    # (1, 6890, 3)
```

> **주의**: SMPL 가중치 다운로드 시 학술 목적 동의 필수. 상업적 사용은 별도 라이선스 협의 필요.

### 2.2 makehuman-js

MakeHuman 프로젝트의 JavaScript 포팅. 브라우저에서 직접 파라메트릭 인체 모델을 생성/조작 가능.

| 항목 | 내용 |
|------|------|
| 라이선스 | **AGPL-3.0** |
| 플랫폼 | 브라우저 네이티브 (JavaScript) |
| 파라미터 | MakeHuman 파라메트릭 슬라이더 (성별, 나이, 체중, 근육 등) |
| 메쉬 품질 | 중상 (MakeHuman 기반, 의류 시뮬레이션 가능 수준) |
| 상업적 사용 | **AGPL 조건 충족 시 가능** (소스 공개 의무) |

> AGPL-3.0이므로 서버 사이드 사용 시 전체 소스 공개 의무 발생. SaaS에서는 주의 필요.

### 2.3 MB-Lab (Blender Addon)

Blender용 파라메트릭 인체 생성 애드온. 오프라인 에셋 파이프라인에 적합.

| 항목 | 내용 |
|------|------|
| 라이선스 | **GPL-3.0** |
| 플랫폼 | Blender (오프라인) |
| 용도 | 사전 메쉬 생성, 에셋 파이프라인 |
| 메쉬 품질 | 높음 (Blender 렌더링 활용 가능) |
| 상업적 사용 | GPL 조건 하 가능 (생성된 에셋은 자유) |

> **활용 시나리오**: 다양한 체형의 기본 메쉬를 사전 생성 → glTF 익스포트 → 웹에서 로드

### 2.4 gltf-avatar-threejs

glTF 기반 모듈형 아바타 시스템. Three.js에서 부위별 메쉬 교체/조합 가능.

| 항목 | 내용 |
|------|------|
| 라이선스 | MIT |
| 플랫폼 | 웹 (Three.js) |
| 방식 | glTF 모듈형 조합 (머리/몸통/팔/다리) |
| 파라미터 | 부위별 메쉬 교체 방식 (연속 파라미터 아님) |
| 상업적 사용 | **가능** |

### 2.5 ReadyPlayerMe

상용 아바타 플랫폼. 사진에서 아바타 자동 생성, 크로스 플랫폼 SDK 제공.

| 항목 | 내용 |
|------|------|
| 라이선스 | **상용** (무료 티어 있음) |
| 플랫폼 | Unity / Unreal / Web SDK |
| 방식 | 사진 → 아바타 자동 생성, API 기반 |
| 메쉬 품질 | 높음 (게임/메타버스급) |
| 상업적 사용 | **가능** (유료 플랜) |
| 제약 | 외부 API 의존, 커스텀 체형 파라미터 제한적 |

---

## 3. 비교 테이블

| 기술 | 라이선스 | 웹 지원 | 파라미터 수 | 상업적 사용 | 메쉬 품질 | 비고 |
|------|---------|---------|------------|------------|----------|------|
| **SMPL/SMPL-X** | 학술 전용 | 불가 (서버) | 10 shape + 72 pose | **불가** | 높음 | 학술 표준, 논문 호환 |
| **makehuman-js** | AGPL-3.0 | **브라우저 네이티브** | 다수 (슬라이더) | 조건부 | 중상 | 소스 공개 의무 |
| **MB-Lab** | GPL-3.0 | 불가 (Blender) | 다수 | 조건부 | 높음 | 에셋 파이프라인용 |
| **gltf-avatar-threejs** | MIT | **Three.js** | 모듈형 | **가능** | 중 | 자유도 높음 |
| **ReadyPlayerMe** | 상용 | Web SDK | API 기반 | **가능** (유료) | 높음 | 외부 의존성 |

---

## 4. Three.js glTF 아바타 로딩 예시

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(2, 3, 2);
scene.add(dirLight);

// glTF 아바타 로드
const loader = new GLTFLoader();
loader.load('/models/avatar-body.glb', (gltf) => {
  const avatar = gltf.scene;
  avatar.position.set(0, 0, 0);
  scene.add(avatar);

  // 본(bone) 접근 — 포즈 조작
  avatar.traverse((node) => {
    if (node.isBone && node.name === 'Spine') {
      node.rotation.x = 0.1; // 약간 앞으로 숙임
    }
  });

  // 모프 타겟으로 체형 조절 (메쉬에 블렌드셰이프가 있는 경우)
  avatar.traverse((node) => {
    if (node.isMesh && node.morphTargetInfluences) {
      // 예: 0번 모프타겟 = 체중, 1번 = 근육량
      node.morphTargetInfluences[0] = 0.5; // 체중 50%
      node.morphTargetInfluences[1] = 0.3; // 근육 30%
    }
  });
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

> **핵심**: glTF 파일에 morph target(블렌드셰이프)을 미리 베이킹해두면 브라우저에서 실시간 체형 변환 가능.

---

## 5. 추천 전략

### 웹 퍼스트 (프론트엔드 중심)

| 우선순위 | 방안 | 이유 |
|---------|------|------|
| 1순위 | **커스텀 glTF 아바타** | MIT 라이선스, Three.js 완벽 호환, morph target으로 체형 조절 |
| 2순위 | **makehuman-js** | 브라우저 네이티브 파라메트릭 모델, AGPL 감수 가능 시 |
| 3순위 | **gltf-avatar-threejs** 참고 구현 | 모듈형 구조 레퍼런스로 활용 |

### 백엔드 처리 (AI 파이프라인)

| 용도 | 기술 | 이유 |
|------|------|------|
| 체형 추정 | **SMPL** (서버) | 사진→체형 파라미터 추출, 학술 표준 |
| 메쉬 사전 생성 | **MB-Lab** (Blender) | 다양한 체형 에셋 배치 생성 |
| 프론트 전달 | **glTF 익스포트** | SMPL/MB-Lab 결과를 glTF로 변환 후 브라우저 전송 |

### 실용적 파이프라인

```
[사용자 사진] → [SMPL 체형 추정 (서버)] → shape 파라미터 (10개)
                                              ↓
                        [파라미터 → glTF morph target 매핑]
                                              ↓
                        [Three.js에서 아바타 체형 실시간 조절]
                                              ↓
                        [가상 의류 피팅 렌더링]
```

---

## 6. 제약사항

- **SMPL 라이선스**: 상업적 사용 시 Max Planck과 별도 협의 필수 (비용 발생 가능)
- **makehuman-js AGPL**: SaaS 서비스에서는 전체 소스 공개 의무 발생
- **체형 정확도**: 사진 1장에서 정확한 3D 체형 복원은 한계 있음 (정면+측면 2장 권장)
- **메쉬 호환성**: VTON 모델과 3D 아바타의 통합은 아직 연구 단계
- **브라우저 성능**: 고폴리곤 메쉬는 모바일에서 프레임 드랍 (10K 정점 이하 권장)

---

## 7. 참고 리소스

- SMPL: https://smpl.is.tue.mpg.de/
- SMPL-X: https://smpl-x.is.tue.mpg.de/
- makehuman-js: https://github.com/makehumancommunity/makehuman-js
- MB-Lab: https://github.com/animate1978/MB-Lab
- gltf-avatar-threejs: https://github.com/nickyvanurk/3d-avatar-threejs
- ReadyPlayerMe: https://readyplayer.me/
- Three.js GLTFLoader: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
