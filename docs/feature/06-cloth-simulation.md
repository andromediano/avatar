# Feature: 천 시뮬레이션

의류에 물리 기반 천 시뮬레이션을 적용하여 자연스러운 드레이프와 움직임을 구현한다.
Pre-baked morph target(기본)과 Ammo.js 실시간 시뮬레이션(선택)을 지원한다.

---

## Background

```gherkin
Given 3D 씬이 초기화되어 있다
And 의류가 아바타에 마운팅되어 있다
```

---

## Pre-Baked Morph Target (기본 — 모든 디바이스)

### Scenario: 프리베이크 천 애니메이션 재생

```gherkin
Given 의류 glTF에 프레임별 morph target이 포함되어 있다
When 천 시뮬레이션이 시작된다
Then 프리베이크 모드가 활성화된다
And morph target이 30fps로 순차 재생된다
And 매 프레임 이전 morph target weight가 0으로 리셋된다
And 현재 프레임의 morph target weight가 1.0으로 설정된다
And 자연스러운 천의 흔들림/드레이프가 표현된다
```

### Scenario: 프리베이크 애니메이션 정지

```gherkin
Given 프리베이크 천 애니메이션이 재생 중이다
When stop()이 호출된다
Then setInterval이 해제된다
And 마지막 프레임 상태가 유지된다
```

### Scenario: morph target이 없는 의류

```gherkin
Given 의류 glTF에 morph target이 없다
When 프리베이크 모드로 천 시뮬레이션이 시작된다
Then "morph target이 없는 메시입니다" 에러가 발생한다
And 의류는 정적 상태로 유지된다
```

---

## Ammo.js Soft Body (선택 — 데스크톱)

### Scenario: 물리 엔진 초기화

```gherkin
Given 사용자의 디바이스가 데스크톱이다
When 실시간 천 시뮬레이션 모드가 활성화된다
Then Ammo.js WASM 모듈이 동적으로 로드된다 (~1.5MB)
And btSoftRigidDynamicsWorld가 생성된다
And 중력이 (0, -9.8, 0)으로 설정된다
And 콘솔에 물리 엔진 초기화 완료 로그가 출력된다
```

### Scenario: Soft Body 생성

```gherkin
Given 물리 엔진이 초기화되어 있다
And 의류 메시에 인덱스 버퍼가 있다
When createClothSoftBody()가 호출된다
Then 의류 메시의 삼각형 배열로 btSoftBody가 생성된다
And 다음 물성이 설정된다:
  | 속성               | 값   | 설명        |
  | viterations       | 10   | 속도 반복    |
  | piterations       | 10   | 위치 반복    |
  | kDF               | 0.5  | 동적 마찰    |
  | kDP               | 0.01 | 감쇠        |
  | kLF               | 0.02 | 양력 계수    |
  | totalMass         | 0.5  | 전체 질량(kg)|
  | kLST              | 0.4  | 선형 강성    |
  | kAST              | 0.4  | 면적 강성    |
And soft body가 물리 월드에 추가된다
```

### Scenario: 매 프레임 정점 동기화

```gherkin
Given soft body가 물리 월드에 존재한다
When 렌더 루프에서 update()가 호출된다
Then physicsWorld.stepSimulation(1/60, 2)가 실행된다
And soft body의 각 노드 위치가 Three.js position 버퍼에 복사된다
And position.needsUpdate가 true로 설정된다
And vertex normal이 재계산된다
And 의류가 중력과 관성에 따라 자연스럽게 드레이프된다
```

### Scenario: Web Worker에서 물리 연산

```gherkin
Given 실시간 천 시뮬레이션이 활성화되어 있다
When 물리 연산이 시작된다
Then Ammo.js 물리 시뮬레이션이 Web Worker에서 실행된다
And 정점 데이터가 SharedArrayBuffer로 메인 스레드에 전달된다
And 메인 스레드의 렌더링이 물리 연산에 의해 블로킹되지 않는다
```

### Scenario: Soft Body 해제

```gherkin
Given soft body가 물리 월드에 존재한다
When dispose()가 호출된다
Then soft body가 물리 월드에서 제거된다
And Ammo 객체가 destroy된다
And 관련 메모리가 해제된다
```

---

## 시뮬레이션 모드 전환

### Scenario: 디바이스 기반 자동 모드 선택

```gherkin
Given 사용자가 가상 피팅 페이지에 접속한다
When 디바이스가 모바일(터치 디바이스)이다
Then 프리베이크 모드가 자동 선택된다
And Ammo.js WASM이 로드되지 않는다

When 디바이스가 데스크톱이다
Then 실시간 시뮬레이션 모드가 기본 선택된다
And 사용자가 프리베이크 모드로 전환할 수 있는 토글이 표시된다
```

### Scenario: 성능 저하 시 자동 폴백

```gherkin
Given 실시간 시뮬레이션 모드가 활성화되어 있다
When FPS가 30 미만으로 3초 이상 유지된다
Then 콘솔에 "[Perf] FPS 30 미만 — 프리베이크 모드로 전환을 권장합니다" 경고가 출력된다
And 사용자에게 "성능이 낮습니다. 경량 모드로 전환하시겠습니까?" 안내가 표시된다
```

---

## 기술 사양

| 항목 | Pre-Baked | Ammo.js Soft Body |
|------|-----------|-------------------|
| 성능 부하 | 매우 낮음 (zero runtime) | 높음 (~30fps for ~1K nodes) |
| 브라우저 | 모든 브라우저 | 모든 브라우저 (WASM) |
| 디바이스 | 모바일 + 데스크톱 | 데스크톱 권장 |
| 체형 연동 | 제한적 (프리셋별 베이크) | 실시간 갱신 가능 |
| WASM 크기 | 없음 | ~1.5MB (gzip ~400KB) |
| 구현 복잡도 | 낮음 | 높음 |

## 관련 문서

- [08-poc-implementation.md — Phase 4](../08-poc-implementation.md)
- [02-cloth-simulation.md](../02-cloth-simulation.md)
