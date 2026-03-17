# Feature: 의류 마운팅 및 색상 변경

선택한 의류 glTF 모델을 아바타 스켈레톤에 바인딩하고, 색상을 실시간 변경한다.

---

## Background

```gherkin
Given 3D 씬이 초기화되어 있다
And 아바타 모델이 로드되어 A-Pose 상태이다
And 아바타의 스켈레톤이 추출되어 있다
```

---

## 의류 마운팅

### Scenario: 의류 모델 로딩 및 스켈레톤 바인딩

```gherkin
When 의류 glTF 모델이 로드된다
Then 의류의 SkinnedMesh가 탐색된다
And 의류 스켈레톤의 각 본 이름이 아바타 스켈레톤의 본 이름과 매칭된다
And skinIndex 버퍼가 아바타 본 인덱스로 리매핑된다
And 의류 메시의 skeleton이 아바타 스켈레톤으로 교체된다
And 의류가 아바타 위에 올바르게 착용되어 렌더링된다
```

### Scenario: 아바타 포즈 변경 시 의류 연동

```gherkin
Given 의류가 아바타 스켈레톤에 바인딩되어 있다
When 아바타의 포즈(관절 회전)가 변경된다
Then 의류 메시가 아바타의 포즈에 따라 동일하게 변형된다
And Linear Blend Skinning이 적용되어 자연스러운 변형이 렌더링된다
```

### Scenario: 아바타 체형 변경 시 의류 반응

```gherkin
Given 의류가 아바타에 착용되어 있다
When 아바타의 체형 파라미터(morph target)가 변경된다
Then 의류에 체형 연동 morph target이 있으면 함께 변형된다
And 의류가 변경된 체형에 맞게 조정된다
```

### Scenario: 본 이름 매칭 실패 시 경고

```gherkin
Given 의류 모델의 일부 본 이름이 아바타와 다르다
When 스켈레톤 바인딩이 수행된다
Then 매칭 실패한 본에 대해 콘솔 경고가 출력된다: "[Garment] 매칭 실패 본: {boneName}"
And 매칭 가능한 본들은 정상적으로 바인딩된다
```

### Scenario: 의류 해제 (dispose)

```gherkin
Given 의류가 아바타에 착용되어 있다
When 의류 해제(dispose)가 호출된다
Then 의류 모델이 씬에서 제거된다
And 의류의 geometry가 해제된다
And 의류의 material이 해제된다
And GPU 메모리가 반환된다
```

### Scenario: 의류 교체

```gherkin
Given 의류 A가 아바타에 착용되어 있다
When 의류 B가 새로 선택된다
Then 의류 A의 dispose가 먼저 호출된다
And 의류 B가 로드되어 아바타에 바인딩된다
And 교체 전환이 1초 이내에 완료된다
```

---

## 색상 변경

### Scenario: 프리셋 색상 선택

```gherkin
Given 의류가 아바타에 착용되어 있다
And 색상 선택 UI가 표시되어 있다
When 사용자가 빨간색(#ef4444) 프리셋을 클릭한다
Then 의류 material의 color가 #ef4444로 변경된다
And 변경이 실시간으로 렌더링에 반영된다
```

### Scenario: 커스텀 색상 선택

```gherkin
Given 의류가 아바타에 착용되어 있다
When 사용자가 color picker에서 커스텀 색상을 선택한다
Then 의류 material의 color가 선택된 색상으로 변경된다
```

### Scenario: 색상 프리셋 목록

```gherkin
Given 색상 선택 UI가 표시되어 있다
Then 다음 프리셋 색상 버튼이 표시된다:
  | 색상   | HEX     |
  | 파랑   | #3b82f6 |
  | 빨강   | #ef4444 |
  | 초록   | #22c55e |
  | 노랑   | #f59e0b |
  | 보라   | #8b5cf6 |
  | 검정   | #111111 |
  | 흰색   | #ffffff |
And 커스텀 color input이 표시된다
And 현재 선택된 색상에 굵은 테두리가 표시된다
```

---

## 그림자 설정

### Scenario: 의류 그림자

```gherkin
Given 의류가 아바타에 착용되어 있다
Then 의류 SkinnedMesh에 castShadow가 활성화된다
And frustumCulled가 비활성화된다
```

---

## 기술 사양

| 항목 | 값 |
|------|-----|
| 스켈레톤 바인딩 | 본 이름 기준 매칭 + skinIndex 리매핑 |
| 스키닝 | Linear Blend Skinning (max 4 bones/vertex) |
| 색상 변경 | MeshStandardMaterial.color 직접 변경 |
| 의류 포맷 | glTF 2.0 / GLB |

## 관련 문서

- [08-poc-implementation.md — Phase 3](../08-poc-implementation.md)
- [05-garment-modeling.md](../05-garment-modeling.md)
