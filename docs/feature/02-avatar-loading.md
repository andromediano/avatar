# Feature: 아바타 로딩 및 체형 조절

glTF 바디 모델을 로딩하고, morph target을 통해 체형 파라미터를 실시간 조절한다.

---

## Background

```gherkin
Given 3D 씬이 초기화되어 있다
And 아바타 glTF 모델(/models/avatar_base.glb)이 CDN에 존재한다
```

---

## Scenario: 아바타 모델 로딩 성공

```gherkin
When 아바타 로딩 함수가 호출된다
Then GLTFLoader + DRACOLoader로 glTF 모델이 로드된다
And 아바타 모델이 씬 중앙(origin)에 배치된다
And SkinnedMesh에서 스켈레톤이 추출된다
And morph target을 가진 메시 목록이 수집된다
And 아바타가 A-Pose로 서 있는 상태가 된다
```

## Scenario: 아바타 모델 로딩 실패

```gherkin
Given 아바타 glTF 모델 URL이 잘못되었다
When 아바타 로딩 함수가 호출된다
Then 로딩 에러가 throw된다
And 사용자에게 "모델을 불러올 수 없습니다" 오류 메시지가 표시된다
```

## Scenario: A-Pose 자동 적용

```gherkin
Given 아바타 모델이 T-Pose로 로드되었다
When A-Pose 변환이 적용된다
Then LeftUpperArm 본이 Z축으로 +30° 회전한다
And RightUpperArm 본이 Z축으로 -30° 회전한다
And 자연스러운 착장 시뮬레이션이 가능한 포즈가 된다
```

## Scenario: 체형 파라미터 실시간 조절

```gherkin
Given 아바타 모델이 로드되어 있다
When setBodyParam("chest", 0.7)이 호출된다
Then "chest" morph target이 70%로 적용된다
And 아바타의 가슴 부위 형상이 실시간으로 변형된다
And 변형이 부드럽게 렌더링된다
```

## Scenario: 잘못된 체형 파라미터 값 클램핑

```gherkin
Given 아바타 모델이 로드되어 있다
When setBodyParam("waist", 1.5)가 호출된다
Then 값이 1.0으로 클램핑된다
And "waist" morph target이 100%로 적용된다

When setBodyParam("hip", -0.3)이 호출된다
Then 값이 0.0으로 클램핑된다
And "hip" morph target이 0%로 적용된다
```

## Scenario: 존재하지 않는 파라미터 무시

```gherkin
Given 아바타 모델이 로드되어 있다
When setBodyParam("unknownParam", 0.5)가 호출된다
Then 에러가 발생하지 않는다
And 아바타 형상에 변화가 없다
```

## Scenario: 복수 체형 파라미터 동시 적용

```gherkin
Given 아바타 모델이 로드되어 있다
When 다음 파라미터들이 순차적으로 적용된다:
  | name      | value |
  | height    | 0.8   |
  | chest     | 0.6   |
  | waist     | 0.4   |
  | hip       | 0.5   |
  | weight    | 0.7   |
Then 모든 morph target이 해당 값으로 반영된다
And 아바타가 해당 체형으로 자연스럽게 변형된다
```

## Scenario: 그림자 설정

```gherkin
Given 아바타 모델이 로드되어 있다
Then 모든 SkinnedMesh에 castShadow가 활성화된다
And 모든 SkinnedMesh에 receiveShadow가 활성화된다
And frustumCulled가 비활성화된다
```

---

## 지원 체형 파라미터

| 파라미터 | morph target 이름 | 설명 | 범위 |
|---------|-------------------|------|------|
| 키 | height | 전체 키 | 0.0 ~ 1.0 |
| 가슴둘레 | chest | 흉부 볼륨 | 0.0 ~ 1.0 |
| 허리둘레 | waist | 복부 볼륨 | 0.0 ~ 1.0 |
| 엉덩이둘레 | hip | 골반부 볼륨 | 0.0 ~ 1.0 |
| 어깨너비 | shoulder | 어깨 폭 | 0.0 ~ 1.0 |
| 팔길이 | armLength | 상지 길이 | 0.0 ~ 1.0 |
| 다리길이 | legLength | 하지 길이 | 0.0 ~ 1.0 |
| 체중 | weight | 전체 볼륨 | 0.0 ~ 1.0 |

## 관련 문서

- [08-poc-implementation.md — Phase 2](../08-poc-implementation.md)
- [01-3d-body-models.md](../01-3d-body-models.md)
