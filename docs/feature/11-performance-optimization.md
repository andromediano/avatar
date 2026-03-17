# Feature: 성능 최적화

LOD, 텍스처 압축, 지연 로딩, 성능 모니터링을 적용하여 모바일에서도 30fps 이상을 유지한다.

---

## Background

```gherkin
Given 3D 씬이 초기화되어 있다
And 아바타와 의류가 렌더링 중이다
```

---

## LOD (Level of Detail)

### Scenario: 거리 기반 LOD 전환

```gherkin
Given 아바타/의류 메시에 LOD가 적용되어 있다
When 카메라가 메시로부터 0~3m 거리에 있다
Then High-poly 모델이 렌더링된다

When 카메라가 메시로부터 3~6m 거리에 있다
Then Mid-poly 모델이 렌더링된다

When 카메라가 메시로부터 6m 이상 거리에 있다
Then Low-poly 모델이 렌더링된다
And 폴리곤이 High-poly 대비 80% 절감된다
```

### Scenario: LOD 전환 시 시각적 끊김 없음

```gherkin
Given 카메라가 메시에 접근 중이다
When LOD 레벨이 전환된다
Then 전환이 즉각적으로 이루어진다
And 사용자가 인지할 수 있는 팝핑(popping) 현상이 최소화된다
```

---

## 텍스처 압축

### Scenario: KTX2 텍스처 로딩

```gherkin
Given KTX2 압축 텍스처가 CDN에 존재한다
When 텍스처가 로드된다
Then KTX2Loader가 Basis Universal 트랜스코더를 사용하여 디코딩한다
And GPU 네이티브 포맷(ETC2/ASTC/BC7)으로 변환된다
And VRAM 사용량이 비압축 대비 60-75% 절감된다
```

### Scenario: KTX2 트랜스코더 초기화

```gherkin
Given 3D 씬이 초기화되었다
When KTX2Loader가 생성된다
Then 트랜스코더 경로가 /basis/로 설정된다
And 현재 GPU의 지원 포맷이 자동 감지된다
```

---

## 지연 로딩

### Scenario: 뷰포트 진입 시 에셋 로딩

```gherkin
Given 의류 카탈로그의 썸네일이 표시되어 있다
And 하단 의류의 3D 모델이 아직 로드되지 않았다
When 사용자가 스크롤하여 해당 의류가 뷰포트에 진입한다
Then IntersectionObserver가 진입을 감지한다
And 해당 의류의 3D 에셋 로딩이 시작된다
And 로딩 완료 후 observer가 disconnect된다
```

### Scenario: 선제 로딩 (Preload)

```gherkin
Given 사용자가 의류 카탈로그를 탐색 중이다
When 특정 의류 카드에 마우스가 hover된다
Then 해당 의류의 glTF 모델이 백그라운드에서 선제 로딩된다 (useGLTF.preload)
And 실제 선택 시 즉시 착용된다
```

---

## 성능 모니터링

### Scenario: 실시간 FPS 모니터링

```gherkin
Given 성능 모니터가 활성화되어 있다
When 1초가 경과한다
Then 다음 메트릭이 콘솔에 출력된다:
  | 메트릭         | 설명                |
  | FPS           | 초당 프레임 수       |
  | Draw Calls    | 렌더 호출 수         |
  | Triangles     | 렌더링된 삼각형 수   |
  | Textures (GPU)| GPU 텍스처 수       |
  | Geometries    | GPU 지오메트리 수    |
```

### Scenario: 성능 저하 경고

```gherkin
Given 성능 모니터가 활성화되어 있다
When FPS가 30 미만으로 측정된다
Then 콘솔에 "[Perf] FPS 30 미만 — LOD 강제 하향 또는 시뮬레이션 비활성화 권장" 경고가 출력된다
```

### Scenario: 자동 품질 조정

```gherkin
Given FPS가 30 미만으로 3초 이상 유지된다
When 자동 품질 조정이 트리거된다
Then 다음 순서로 품질이 하향 조정된다:
  1. 그림자 비활성화
  2. LOD 강제 하향
  3. 천 시뮬레이션 비활성화 (프리베이크로 전환)
  4. 픽셀 비율을 1.0으로 하향
And FPS가 30 이상으로 안정화되면 조정이 중단된다
```

---

## 드로우 콜 최적화

### Scenario: 머티리얼 공유

```gherkin
Given 동일한 머티리얼을 사용하는 메시가 여러 개 있다
Then 머티리얼 인스턴스가 공유되어 드로우 콜이 절감된다
And 전체 드로우 콜이 50 이하를 유지한다
```

---

## 성능 예산

| 항목 | 모바일 | 데스크톱 |
|------|--------|---------|
| 타겟 FPS | 30 fps | 60 fps |
| 최대 삼각형 | 30K (총) | 120K (총) |
| 의류당 삼각형 | < 10K | < 50K |
| JS 번들 (gzip) | < 300KB | < 500KB |
| 총 에셋 | < 5MB | < 15MB |
| 드로우 콜 | < 30 | < 50 |
| 메모리 | < 200MB | < 300MB |
| FCP | < 2s | < 1.5s |
| 인터랙티브 | < 4s | < 3s |

## 관련 문서

- [08-poc-implementation.md — Phase 6](../08-poc-implementation.md)
- [03-rendering-frameworks.md](../03-rendering-frameworks.md)
