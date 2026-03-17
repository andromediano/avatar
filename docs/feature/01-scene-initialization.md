# Feature: 3D 씬 초기화

3D 가상 피팅 뷰포트의 기본 렌더링 환경을 구성한다.
WebGPU를 우선 사용하고, 미지원 브라우저에서는 WebGL로 자동 폴백한다.

---

## Background

```gherkin
Given 사용자가 가상 피팅 페이지에 접속한다
```

---

## Scenario: WebGPU 지원 브라우저에서 씬 초기화

```gherkin
Given 브라우저가 WebGPU를 지원한다
When 3D 캔버스가 마운트된다
Then WebGPURenderer가 초기화된다
And 콘솔에 "[Renderer] WebGPU 활성화" 로그가 출력된다
And 캔버스에 빈 3D 씬이 렌더링된다
```

## Scenario: WebGPU 미지원 브라우저에서 WebGL 폴백

```gherkin
Given 브라우저가 WebGPU를 지원하지 않는다
When 3D 캔버스가 마운트된다
Then WebGLRenderer가 초기화된다
And 콘솔에 "[Renderer] WebGPU 미지원 — WebGL 폴백" 경고가 출력된다
And 캔버스에 빈 3D 씬이 정상적으로 렌더링된다
```

## Scenario: 기본 조명 구성

```gherkin
Given 3D 씬이 초기화되었다
Then AmbientLight(intensity: 0.6)가 씬에 추가된다
And DirectionalLight(intensity: 1.2, position: [2, 4, 3])가 씬에 추가된다
And HemisphereLight(sky: 0xbde0fe, ground: 0x444444, intensity: 0.4)가 씬에 추가된다
```

## Scenario: 카메라 및 컨트롤 설정

```gherkin
Given 3D 씬이 초기화되었다
Then PerspectiveCamera(fov: 45)가 position [0, 1.2, 3]에 배치된다
And OrbitControls의 target이 [0, 1.0, 0]으로 설정된다
And 마우스 드래그로 궤도 카메라 조작이 가능하다
And damping이 활성화된다 (dampingFactor: 0.08)
And 카메라 상단 회전이 maxPolarAngle(0.85π)로 제한된다
```

## Scenario: 바닥 그리드 표시

```gherkin
Given 3D 씬이 초기화되었다
Then 10x10 크기의 GridHelper가 씬에 추가된다
And 그리드가 XZ 평면에 수평으로 배치된다
```

## Scenario: 캔버스 리사이즈 대응

```gherkin
Given 3D 씬이 렌더링 중이다
When 브라우저 창 크기가 변경된다
Then 렌더러의 크기가 캔버스 컨테이너에 맞게 갱신된다
And 카메라의 aspect ratio가 새 크기에 맞게 업데이트된다
And 렌더링이 끊김 없이 유지된다
```

## Scenario: 렌더 루프 실행

```gherkin
Given 3D 씬이 초기화되었다
When 렌더 루프가 시작된다
Then requestAnimationFrame 기반으로 60fps 목표 렌더링이 실행된다
And OrbitControls.update()가 매 프레임 호출된다
And ACESFilmicToneMapping이 적용된다
```

---

## 기술 사양

| 항목 | 값 |
|------|-----|
| 렌더러 | WebGPURenderer (primary) / WebGLRenderer (fallback) |
| 톤매핑 | ACESFilmicToneMapping |
| 픽셀 비율 | window.devicePixelRatio |
| 타겟 FPS | 60fps (최소 30fps) |
| 배경색 | 0xf0f0f0 |

## 관련 문서

- [08-poc-implementation.md — Phase 1](../08-poc-implementation.md)
- [03-rendering-frameworks.md](../03-rendering-frameworks.md)
