# Feature: AR 바디 트래킹

MediaPipe Pose를 사용하여 사용자의 실시간 포즈를 추적하고, 카메라 피드 위에 3D 의류를 합성한다.

---

## Background

```gherkin
Given 사용자의 디바이스에 카메라가 있다
And 브라우저가 getUserMedia API를 지원한다
```

---

## 카메라 접근

### Scenario: 카메라 권한 요청

```gherkin
When 사용자가 "AR 피팅" 모드를 활성화한다
Then 브라우저의 카메라 권한 요청 다이얼로그가 표시된다

When 사용자가 카메라 접근을 허용한다
Then 카메라 피드가 캔버스 배경에 표시된다
And MediaPipe Pose 초기화가 시작된다
```

### Scenario: 카메라 권한 거부

```gherkin
When 사용자가 카메라 접근을 거부한다
Then "카메라 접근이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요." 메시지가 표시된다
And AR 피팅 모드가 비활성 상태를 유지한다
```

---

## 실시간 포즈 추적

### Scenario: MediaPipe Pose 초기화

```gherkin
Given 카메라 접근이 허용되었다
When MediaPipe Pose가 초기화된다
Then @mediapipe/tasks-vision 패키지의 PoseLandmarker가 생성된다
And 모델(pose_landmarker_full)이 로드된다
And GPU delegate가 활성화된다
And runningMode가 "VIDEO"로 설정된다
And numPoses가 1로 설정된다
```

### Scenario: 실시간 키포인트 추출

```gherkin
Given MediaPipe Pose가 초기화되어 있다
And 카메라 피드가 활성화되어 있다
When 각 비디오 프레임이 처리된다
Then 33개 키포인트가 추출된다 (2D 정규화 좌표 + 3D 월드 좌표)
And 포즈 추출이 30 FPS 이상으로 동작한다
And 키포인트에 visibility(신뢰도) 값이 포함된다
```

### Scenario: 사람이 감지되지 않음

```gherkin
Given AR 피팅 모드가 활성화되어 있다
When 카메라 프레임에 사람이 보이지 않는다
Then 키포인트 배열이 비어 있다 (landmarks.length === 0)
And "카메라 앞에 서주세요" 안내가 표시된다
And 이전 의류 오버레이가 숨겨진다
```

---

## 아바타 관절 매핑

### Scenario: 키포인트 → 관절 회전 변환

```gherkin
Given 33개 키포인트가 추출되었다
When Inverse Kinematics 변환이 수행된다
Then 부모-자식 관절 벡터 간 회전량이 쿼터니언으로 산출된다
And 아바타 스켈레톤의 각 본에 회전값이 적용된다
And 아바타가 사용자의 포즈를 실시간으로 미러링한다
```

### Scenario: 포즈 스무딩 적용

```gherkin
Given 키포인트가 프레임별로 추출되고 있다
When 관절 회전값이 계산된다
Then 1-Euro Filter 또는 Kalman Filter가 적용된다
And 키포인트 떨림(jitter)이 제거된다
And 자연스러운 포즈 추적이 유지된다
```

---

## 실시간 오버레이 렌더링

### Scenario: 카메라 배경 + 3D 의류 합성

```gherkin
Given 포즈 추적이 활성화되어 있다
And 의류가 아바타에 착용되어 있다
When 각 렌더 프레임에서
Then 카메라 피드가 캔버스 배경 레이어에 렌더링된다
And 의류 3D 메시가 포즈에 따라 변형된다
And 의류가 카메라 피드 위에 WebGL로 합성 렌더링된다
And 렌더링이 60 FPS로 동작한다
```

### Scenario: 포즈 추출과 렌더링 루프 분리

```gherkin
Given AR 피팅 모드가 활성화되어 있다
When 포즈 추출 속도가 20 FPS로 떨어진다
Then 렌더링은 여전히 60 FPS로 동작한다
And 최근 추출된 포즈 데이터를 기반으로 보간(interpolation)이 적용된다
And 의류 오버레이가 끊김 없이 유지된다
```

---

## WebXR 보강 (Android 선택적)

### Scenario: WebXR 조명 추정 활성화

```gherkin
Given 브라우저가 WebXR light-estimation을 지원한다 (Android Chrome)
When WebXR AR 세션이 시작된다
Then 주변 환경의 광원 방향/강도/색온도가 추정된다
And 의류 3D 렌더링의 조명이 실제 환경에 맞게 조정된다
And 의류가 주변 환경과 자연스럽게 조화된다
```

### Scenario: WebXR 미지원 시 폴백

```gherkin
Given 브라우저가 WebXR을 지원하지 않는다 (iOS Safari 등)
When AR 피팅 모드가 활성화된다
Then MediaPipe Pose + 자체 렌더링 조합으로 동작한다
And 기본 스튜디오 조명이 적용된다
And 기능 제한 안내 없이 정상 동작한다
```

---

## AR 모드 종료

### Scenario: AR 모드 비활성화

```gherkin
Given AR 피팅 모드가 활성화되어 있다
When 사용자가 "AR 종료" 버튼을 클릭한다
Then 카메라 스트림이 중지된다 (track.stop())
And MediaPipe Pose 리소스가 해제된다
And 일반 3D 뷰포트 모드로 전환된다
And 카메라 피드 배경이 제거되고 기본 배경(0xf0f0f0)이 복원된다
```

---

## 프라이버시

### Scenario: 온디바이스 처리 보장

```gherkin
Given AR 피팅 모드가 활성화되어 있다
When 카메라 프레임이 처리된다
Then 모든 포즈 추론이 브라우저 내에서 완료된다
And 카메라 프레임이 서버로 전송되지 않는다
And 추론 후 프레임 데이터가 즉시 폐기된다
And 키포인트 좌표만 후속 처리에 사용된다
```

---

## 성능 사양

| 항목 | 목표 값 |
|------|---------|
| 카메라 해상도 | 640x480 ~ 1280x720 |
| 포즈 추출 FPS | 30 FPS (lite 모델 on mobile) |
| 렌더링 FPS | 60 FPS |
| MediaPipe 모델 | full (AR 실시간용) |
| GPU 메모리 | 의류 메시당 10-50MB |
| 배터리 소모 | 15-25% / 시간 (연속 사용) |

## 관련 문서

- [06-ar-body-tracking.md](../06-ar-body-tracking.md)
- [08-poc-implementation.md — Post-PoC](../08-poc-implementation.md)
