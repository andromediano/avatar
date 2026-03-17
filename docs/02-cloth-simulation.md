# 천(Cloth) 시뮬레이션 기술 조사

> 웹 기반 가상 피팅에서 의류의 물리적 거동을 시뮬레이션하기 위한 기술 옵션을 조사한다.

---

## 1. 물리 시뮬레이션 기초

천 시뮬레이션은 연속체를 이산화하여 수치적으로 풀어야 한다. 주요 접근법 세 가지를 비교한다.

### 1.1 Mass-Spring 시스템

- 메시 정점을 질량 입자(particle)로, 간선을 스프링으로 모델링
- 구조(structural), 전단(shear), 굽힘(bend) 스프링 세 종류로 구성
- 구현이 단순하지만 스프링 상수에 민감하고, stiffness가 높으면 시간 적분이 불안정

### 1.2 Position-Based Dynamics (PBD / XPBD)

- 위치(position) 단위로 제약 조건(constraint)을 직접 풀어 안정성이 높음
- XPBD는 compliance 파라미터를 도입하여 물리적 단위와 일치하는 강성 제어 가능
- 게임 엔진(Unreal, Unity)에서 사실상 표준으로 채택
- 반복 횟수(iteration count)로 품질-성능 트레이드오프 조절

### 1.3 유한요소법 (Finite Element Method)

- 삼각형/사면체 요소로 연속체 역학 방정식을 이산화
- 가장 정확하지만 계산 비용이 높아 실시간 웹 환경에는 부적합
- 오프라인 시뮬레이션(Blender, Marvelous Designer)에서 주로 사용

| 방법 | 정확도 | 안정성 | 실시간 적합성 | 구현 난이도 |
|------|--------|--------|--------------|------------|
| Mass-Spring | 중 | 낮음 | 가능 | 낮음 |
| PBD/XPBD | 중~상 | 높음 | 가능 | 중간 |
| FEM | 최상 | 높음 | 불가(웹) | 높음 |

---

## 2. Ammo.js (Bullet Physics WebAssembly 포트)

Ammo.js는 C++로 작성된 Bullet Physics를 Emscripten으로 WebAssembly로 컴파일한 라이브러리이다.

- **Soft Body 지원**: `btSoftBody`를 통해 천 시뮬레이션 직접 가능
- **성능**: 단순 천(~1K 노드) 기준 약 **30FPS** 달성 가능
- **WASM 바이너리 크기**: ~1.5MB (gzip 후 ~400KB)
- **Three.js 연동**: Soft body 메시 정점을 매 프레임 Three.js geometry에 복사

### Ammo.js Soft Body 설정 코드

```javascript
// Ammo.js 초기화 후 soft body 생성 예시
function createClothSoftBody(physicsWorld, width, height, segments) {
  const softBodyHelpers = new Ammo.btSoftBodyHelpers();

  // 천의 네 꼭짓점 정의
  const corner00 = new Ammo.btVector3(-width / 2, height, -width / 2);
  const corner10 = new Ammo.btVector3(width / 2, height, -width / 2);
  const corner01 = new Ammo.btVector3(-width / 2, height, width / 2);
  const corner11 = new Ammo.btVector3(width / 2, height, width / 2);

  // soft body 패치 생성
  const softBody = softBodyHelpers.CreatePatch(
    physicsWorld.getWorldInfo(),
    corner00, corner10, corner01, corner11,
    segments + 1,  // x 방향 해상도
    segments + 1,  // y 방향 해상도
    0,             // 고정할 코너 비트마스크 (0 = 없음)
    true           // 대각선 링크 생성
  );

  // 재질 속성 설정
  const sbConfig = softBody.get_m_cfg();
  sbConfig.set_viterations(10);  // 속도 반복
  sbConfig.set_piterations(10);  // 위치 반복 (품질에 직결)
  sbConfig.set_kDF(0.2);         // 동적 마찰 계수
  sbConfig.set_kDP(0.01);        // 감쇠 계수
  sbConfig.set_kLF(0.02);        // 양력 계수

  // 질량 설정 (총 질량)
  softBody.setTotalMass(0.9, false);

  // 물리 월드에 추가
  physicsWorld.addSoftBody(softBody, 1, -1);

  return softBody;
}

// 매 프레임 Three.js 메시와 동기화
function syncClothMesh(softBody, threeMesh) {
  const nodes = softBody.get_m_nodes();
  const positions = threeMesh.geometry.attributes.position.array;

  for (let i = 0; i < nodes.size(); i++) {
    const node = nodes.at(i);
    const pos = node.get_m_x();
    positions[i * 3] = pos.x();
    positions[i * 3 + 1] = pos.y();
    positions[i * 3 + 2] = pos.z();
  }

  threeMesh.geometry.attributes.position.needsUpdate = true;
  threeMesh.geometry.computeVertexNormals();
}
```

---

## 3. Cannon.js / cannon-es

cannon-es는 Cannon.js의 유지보수 포크로, 순수 JavaScript로 작성된 경량 물리 엔진이다.

- **장점**: 번들 크기 작음(~120KB), TypeScript 지원, 설치 간편
- **한계**: 네이티브 soft body / cloth 지원 없음
- **우회 방법**: 파티클 + 거리 제약(distance constraint)으로 천을 수동 구현 가능하지만, 성능과 품질 모두 Ammo.js 대비 열위
- **적합 용도**: 의류 물리보다는 rigid body 충돌(버튼, 액세서리 등)에 적합

---

## 4. WebGPU Compute Shader 접근

WebGPU의 Compute Shader를 활용하면 GPU에서 병렬로 파티클 시뮬레이션을 수행할 수 있다.

- **병렬 처리**: 각 파티클의 제약 조건 풀이를 GPU 스레드에 매핑
- **성능 잠재력**: **640K+ 노드에서 60FPS** 달성 가능 (PBD/XPBD 기반)
- **파이프라인**: Compute Shader로 시뮬레이션 → 결과를 Vertex Buffer로 직접 전달 (CPU-GPU 복사 없음)
- **브라우저 지원**: Chrome 113+, Edge 113+, Firefox/Safari는 미지원 또는 실험적 (2026년 3월 기준)

```
[Compute Shader: PBD Solver] → [Storage Buffer: 파티클 위치]
        ↓ (zero-copy)
[Render Pipeline: Vertex Shader] → [Fragment Shader] → 화면 출력
```

핵심 제약: 브라우저 호환성이 아직 불충분하여 프로덕션 MVP에는 부적합하다.

---

## 5. Pre-baked 시뮬레이션

Blender 등의 오프라인 도구에서 천 시뮬레이션을 수행하고, 결과를 glTF morph target(shape key)으로 익스포트하는 방식이다.

- **워크플로우**: Blender Cloth Sim → Shape Key로 베이크 → glTF 2.0 익스포트
- **런타임 비용**: 사실상 **제로** (GPU에서 morph target 보간만 수행)
- **파일 크기**: 30프레임 애니메이션 기준 ~2~5MB (Draco 압축 적용 시)
- **제약**: 미리 정해진 체형/포즈에만 대응 가능, 동적 상호작용 불가

```
Blender Cloth Sim → Bake to Shape Keys → Export glTF
                                            ↓
                            Three.js morphTargetInfluences[]로 재생
```

---

## 6. 하이브리드 접근: Pre-baked + 실시간 보정

pre-baked 베이스 위에 실시간 보정을 더하여 체형 변화에 대응하는 전략이다.

1. **베이스 레이어**: 표준 체형에 대한 pre-baked morph target 애니메이션
2. **보정 레이어**: 사용자 체형과 표준 체형의 차이(delta)를 계산
3. **적용**: delta를 정점 변위(vertex displacement)로 변환하여 실시간 적용
4. **성능**: 전체 시뮬레이션 대비 계산량 90% 이상 절감

| 단계 | 처리 위치 | 비용 |
|------|----------|------|
| 기본 드레이프 | Pre-baked (오프라인) | 없음 |
| 체형 보정 | Vertex Shader (실시간) | 극히 낮음 |
| 충돌 보정 | CPU/GPU (실시간) | 낮음 |

---

## 7. 기술 옵션 비교표

| 항목 | Pre-baked | Ammo.js | Cannon-es (수동) | WebGPU Compute |
|------|-----------|---------|-----------------|----------------|
| **성능 (FPS)** | 60+ | ~30 (1K 노드) | ~20 (1K 노드) | 60+ (640K 노드) |
| **사실성** | 높음 (오프라인 품질) | 중간 | 낮음 | 높음 |
| **개발 난이도** | 낮음 (DCC 도구 의존) | 중간 | 높음 (수동 구현) | 높음 (WGSL 필요) |
| **브라우저 호환성** | 모든 WebGL 브라우저 | 모든 WASM 브라우저 | 모든 브라우저 | Chrome/Edge만 |
| **런타임 비용** | 거의 없음 | 중간 (WASM) | 높음 (JS) | 낮음 (GPU) |
| **동적 상호작용** | 불가 | 가능 | 제한적 | 가능 |
| **체형 대응** | 사전 정의만 | 실시간 가능 | 실시간 가능 | 실시간 가능 |

---

## 8. 추천 전략

| 단계 | 전략 | 근거 |
|------|------|------|
| **MVP** | Pre-baked 시뮬레이션 | 런타임 비용 제로, 빠른 개발, 모든 브라우저 지원 |
| **인터랙티브 기능 추가** | Ammo.js Soft Body | 검증된 물리 엔진, WASM 성능, soft body 네이티브 지원 |
| **차세대 고품질** | WebGPU Compute Shader | 대규모 메시 실시간 처리, GPU 네이티브 파이프라인 |

MVP 단계에서는 pre-baked + 하이브리드 보정으로 시작하고, 사용자 인터랙션(드래그, 바람 효과 등)이 필요한 시점에서 Ammo.js를 도입한다. WebGPU는 브라우저 지원이 충분해지는 시점에 맞춰 전환을 준비한다.
