# AR 및 바디 트래킹 기술 조사

---

## 1. 개요

가상 피팅 서비스에서 AR(증강현실)과 바디 트래킹은 사용자의 실시간 신체를 인식하고, 그 위에 3D 의류를 합성하는 핵심 기술이다. 본 문서에서는 웹 환경에서 활용 가능한 주요 기술 스택과 구현 시 고려사항을 정리한다.

---

## 2. MediaPipe Pose

Google의 MediaPipe Pose는 단일 카메라 입력으로 33개의 신체 키포인트를 실시간 추출한다.

| 항목 | 상세 |
|------|------|
| 키포인트 수 | 33개 (코, 어깨, 팔꿈치, 손목, 골반, 무릎, 발목 등) |
| 프레임 레이트 | 모바일 기기에서 30+ FPS |
| 브라우저 지원 | `@mediapipe/tasks-vision` 패키지를 통해 웹 브라우저에서 직접 실행 |
| 추론 방식 | on-device (클라이언트 사이드, GPU 가속) |
| 출력 형식 | 2D 정규화 좌표 + 3D 월드 좌표 (미터 단위) |

### 브라우저 기본 설정 코드

```typescript
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

async function initPoseTracker(videoElement: HTMLVideoElement) {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  function detect(timestamp: number) {
    const result = poseLandmarker.detectForVideo(videoElement, timestamp);
    if (result.landmarks.length > 0) {
      const landmarks = result.landmarks[0]; // 33 keypoints
      const worldLandmarks = result.worldLandmarks[0]; // 3D 좌표
      renderOverlay(landmarks, worldLandmarks);
    }
    requestAnimationFrame(detect);
  }

  requestAnimationFrame(detect);
}
```

> 모델은 `lite`, `full`, `heavy` 세 가지 변형이 있으며, 정확도와 성능 간 트레이드오프를 조절할 수 있다.

---

## 3. MediaPipe Holistic

MediaPipe Holistic은 얼굴(468 랜드마크), 양손(각 21 랜드마크), 포즈(33 랜드마크)를 단일 파이프라인에서 동시에 추출한다.

| 항목 | 상세 |
|------|------|
| 얼굴 랜드마크 | 468개 (얼굴 메시 구성 가능) |
| 양손 랜드마크 | 각 21개 (총 42개) |
| 포즈 랜드마크 | 33개 |
| 활용 시나리오 | 상의 + 액세서리(안경, 모자, 장갑) 가상 피팅 |
| 주의사항 | Holistic은 legacy API로, 최신 Tasks API에서는 개별 task 조합 방식 권장 |

가상 피팅에서는 포즈 단독 사용으로 충분한 경우가 많으나, 장갑이나 시계 등 손 부위 아이템 피팅 시에는 Hand Landmark 병합이 필요하다.

---

## 4. WebXR Device API

WebXR Device API는 브라우저에서 AR/VR 세션을 직접 제공하는 W3C 표준 API이다.

| 기능 | 설명 |
|------|------|
| `immersive-ar` 세션 | 카메라 피드 위에 3D 콘텐츠를 합성하는 AR 모드 |
| Hit Testing | 실제 평면(바닥, 벽)을 감지하여 3D 객체 배치 |
| Anchors | 감지된 위치에 가상 객체를 고정 |
| 지원 브라우저 | Chrome(Android), Samsung Internet, Meta Quest Browser |
| iOS 제한 | Safari는 WebXR 미지원 (WebKit 정책) |

```javascript
// WebXR AR 세션 요청
const session = await navigator.xr.requestSession("immersive-ar", {
  requiredFeatures: ["hit-test", "anchors"],
  optionalFeatures: ["light-estimation", "depth-sensing"],
});
```

---

## 5. WebXR Body Tracking

WebXR Body Tracking은 실험적(experimental) 단계의 확장 기능이다.

| 항목 | 상세 |
|------|------|
| 상태 | 실험적 (비표준, 사양 변경 가능) |
| 지원 디바이스 | Meta Quest Pro, Meta Quest 3 |
| 관절 수 | 최대 70+ 관절 (전신 골격) |
| 접근 방식 | `XRFrame.body` 속성으로 관절 포즈 배열 취득 |
| 제약 | 일반 모바일/데스크톱 브라우저에서는 사용 불가 |

현시점에서 범용 웹 가상 피팅에는 적합하지 않으며, VR 커머스 전용 시나리오에서만 고려할 수 있다.

---

## 6. 카메라 입력에서 3D 아바타 파라미터 변환

단일 카메라의 2D 키포인트를 3D 관절 각도로 변환하는 파이프라인이다.

```
카메라 프레임 → MediaPipe Pose (2D/3D 키포인트)
    → Inverse Kinematics 변환
    → 3D 아바타 관절 회전값 (쿼터니언)
    → 스켈레탈 메시 적용
```

| 단계 | 처리 내용 |
|------|-----------|
| 키포인트 추출 | MediaPipe의 worldLandmarks (3D 좌표, 미터 단위) |
| 관절 각도 계산 | 부모-자식 관절 벡터 간 회전량 산출 |
| IK 적용 | 33개 키포인트를 SMPL/아바타 리그의 관절 회전으로 매핑 |
| 스무딩 | 1-Euro Filter 또는 Kalman Filter로 떨림 제거 |

---

## 7. 실시간 오버레이 렌더링

카메라 피드 위에 3D 의류를 합성하는 과정은 다음과 같다.

1. **카메라 피드 획득**: `getUserMedia()`로 영상 스트림 취득
2. **포즈 추출**: MediaPipe로 프레임별 키포인트 산출
3. **3D 의류 변형**: 키포인트 기반으로 의류 메시 변형 (Linear Blend Skinning)
4. **렌더링 합성**: Three.js 또는 WebGL로 카메라 배경 + 3D 의류를 동일 캔버스에 렌더링

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│ Camera Feed  │───▶│ Pose Detect  │───▶│ Garment Deform │
└─────────────┘    └──────────────┘    └────────────────┘
       │                                        │
       ▼                                        ▼
┌─────────────────────────────────────────────────────┐
│              WebGL Compositing Canvas                │
└─────────────────────────────────────────────────────┘
```

---

## 8. 조명 추정 (Lighting Estimation)

가상 의류의 사실감을 높이기 위해 실제 환경의 조명 조건을 추정하여 3D 렌더링에 반영한다.

| 방식 | 설명 |
|------|------|
| WebXR Light Estimation | `light-estimation` feature로 주변광 방향/강도/색온도 취득 |
| 카메라 프레임 분석 | 프레임의 평균 밝기, 하이라이트 위치로 광원 방향 추정 |
| 스피리컬 하모닉스 | 환경광을 구면 조화 함수로 근사하여 IBL에 활용 |

WebXR Light Estimation은 Android Chrome에서 지원되며, iOS에서는 카메라 프레임 기반 자체 추정이 필요하다.

---

## 9. 깊이 추정 및 오클루전 처리

사용자의 신체 일부가 가상 의류 앞에 와야 하는 경우(예: 팔이 상의 위로 보이는 상황) 깊이 정보가 필요하다.

| 기술 | 활용 |
|------|------|
| WebXR Depth Sensing | `depth-sensing` feature로 깊이 맵 취득 (Android Chrome) |
| 단안 깊이 추정 모델 | MiDaS 등 경량 모델로 프레임별 상대 깊이 추정 |
| 세그멘테이션 마스크 | MediaPipe Selfie Segmentation으로 전경/배경 분리 |

깊이 기반 오클루전은 자연스러운 합성의 핵심이나, 실시간 처리 부하가 크므로 해상도를 낮춰 처리하는 전략이 일반적이다.

---

## 10. 기술 비교표

| 항목 | MediaPipe Pose | WebXR (AR) | ARKit/ARCore (via WebXR) |
|------|---------------|------------|--------------------------|
| 플랫폼 | 웹, Android, iOS | Android Chrome, Quest | Android(ARCore), iOS(ARKit)* |
| 바디 트래킹 | 33 키포인트 (2D+3D) | 실험적 (Quest만) | ARKit Body (네이티브만) |
| 환경 인식 | 없음 | 평면 감지, 깊이 | 평면, 깊이, 메시 |
| 조명 추정 | 없음 (자체 구현 필요) | 지원 | 지원 |
| iOS 웹 지원 | 지원 (`@mediapipe/tasks-vision`) | 미지원 (Safari WebXR 없음) | 미지원* |
| 정확도 | 중간 (단일 카메라 한계) | 높음 (센서 퓨전) | 높음 (LiDAR 포함 시) |
| 초기 설정 난이도 | 낮음 | 중간 | 높음 (네이티브 브리지 필요) |
| 배터리 소모 | 중간 | 높음 | 높음 |

> *ARKit/ARCore의 전체 기능은 네이티브 앱에서만 접근 가능하며, WebXR을 통해 노출되는 범위는 제한적이다.

---

## 11. 성능 고려사항

| 항목 | 권장 값 | 비고 |
|------|---------|------|
| 카메라 해상도 | 640x480 ~ 1280x720 | 높을수록 정확하나 처리 비용 증가 |
| 포즈 추출 FPS | 30 FPS 목표 | 모바일에서 `lite` 모델 사용 시 달성 가능 |
| 렌더링 FPS | 60 FPS 목표 | 포즈 추출과 렌더링 루프 분리 권장 |
| GPU 메모리 | 의류 메시당 10-50MB | LOD 적용으로 최적화 |
| 배터리 영향 | 연속 사용 시 15-25% 소모/시간 | 비활성 탭 자동 중지 처리 필요 |
| 발열 관리 | 3분 이상 연속 사용 시 스로틀링 발생 가능 | 프레임 레이트 자동 조절 로직 구현 |

포즈 추출과 3D 렌더링 루프를 별도로 관리하여, 포즈 추출이 느려지더라도 렌더링이 끊기지 않도록 설계해야 한다.

---

## 12. 프라이버시

| 원칙 | 구현 |
|------|------|
| on-device 처리 | MediaPipe는 클라이언트에서 추론, 서버 전송 불필요 |
| 카메라 데이터 비저장 | 프레임은 추론 후 즉시 폐기, 로컬 저장 없음 |
| 키포인트만 활용 | 원본 이미지 대신 추출된 좌표만 후속 처리에 사용 |
| 사용자 동의 | `getUserMedia()` 호출 시 브라우저 레벨 카메라 권한 요청 |
| 서버 업로드 불필요 | 모든 처리가 클라이언트에서 완결되므로 개인 영상 유출 위험 없음 |

---

## 13. 한계 및 제약

- **단일 카메라 신체 치수 측정의 정확도 한계**: 단안 카메라로는 깊이 정보가 부족하여 절대적인 신체 치수(둘레, 너비 등)를 정밀하게 측정하기 어렵다. cm 단위 정확도가 필요한 사이즈 추천에는 별도 보정 로직이나 사용자 입력 보완이 필요하다.
- **의류 재질 표현 한계**: 실시간 렌더링에서 얇은 천의 투명도, 주름, 드레이프를 완벽히 재현하기 어렵다.
- **빠른 동작 시 트래킹 손실**: 급격한 움직임이나 모션 블러 상황에서 키포인트 정확도가 저하된다.
- **iOS 웹 AR 제약**: Safari의 WebXR 미지원으로 인해 iOS에서는 MediaPipe 기반 포즈 추출 + 자체 렌더링 조합만 가능하다.
- **다중 사용자 미지원**: 대부분의 파이프라인이 단일 사용자 기준으로 최적화되어 있다.

---

## 14. 결론

웹 기반 가상 피팅의 AR 바디 트래킹은 현실적으로 **MediaPipe Pose + Three.js(또는 WebGL) 조합**이 가장 범용적인 접근 방식이다. iOS를 포함한 크로스 브라우저 지원이 가능하며, on-device 처리로 프라이버시 문제도 해결된다. WebXR은 Android 환경에서 환경 인식(조명, 깊이)을 보강하는 용도로 병행 활용할 수 있다. 단, 단일 카메라 기반 신체 치수 측정의 정확도 한계는 명확히 인지하고, 사용자 입력 보완이나 통계 기반 추정을 병행해야 한다.
