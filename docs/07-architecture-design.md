# 시스템 아키텍처 설계

## 1. 개요

이 문서는 Non-AI 3D 아바타 가상 피팅 시스템의 전체 아키텍처를 정의한다.
핵심 원칙은 **클라이언트 중심 연산**, **CDN-first 에셋 배포**, **최소 백엔드**이다.

---

## 2. 전체 데이터 플로우

```
┌─────────────────────────────────────────────────────────────────────┐
│                        클라이언트 (브라우저 PWA)                       │
│                                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────────┐  │
│  │ React UI │───→│ Zustand      │───→│ React Three Fiber (R3F)   │  │
│  │ 치수입력  │    │ 3D Scene     │    │ @react-three/fiber        │  │
│  │ 사진추정  │    │ State Store  │    │ @react-three/drei         │  │
│  │ 카탈로그  │    │              │    │                           │  │
│  └──────────┘    └──────┬───────┘    └────────────┬──────────────┘  │
│        │                                                            │
│  ┌─────▼────────────────┐                                          │
│  │ MediaPipe Pose       │ ← 사진 기반 신체 추정 (온디바이스)         │
│  │ @mediapipe/tasks-vision                                         │
│  └──────────────────────┘                                          │
│                         │                         │                 │
│              ┌──────────┴─────────┐    ┌──────────┴──────────┐     │
│              │ Web Worker         │    │ Main Thread          │     │
│              │ ┌────────────────┐ │    │ ┌──────────────────┐ │     │
│              │ │ Cloth Physics  │ │    │ │ Three.js Render  │ │     │
│              │ │ (Ammo.js)      │ │    │ │ Loop (60fps)     │ │     │
│              │ └────────────────┘ │    │ └──────────────────┘ │     │
│              └────────────────────┘    └──────────────────────┘     │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐    │
│  │ Service Worker       │  │ IndexedDB                        │    │
│  │ - 3D 에셋 캐싱       │  │ - 사용자 치수 데이터              │    │
│  │ - 오프라인 지원       │  │ - 피팅 히스토리                   │    │
│  │ - Cache-first 전략   │  │ - 즐겨찾기 의류 목록              │    │
│  └──────────────────────┘  └──────────────────────────────────┘    │
└───────────────────────┬─────────────────────┬───────────────────────┘
                        │ REST API            │ 에셋 로딩
                        ▼                     ▼
         ┌──────────────────────┐  ┌──────────────────────┐
         │ Backend API (최소)   │  │ CDN (R2 / S3)        │
         │ ┌──────────────────┐ │  │                      │
         │ │ /api/catalog     │ │  │ ┌──────────────────┐ │
         │ │ /api/users       │ │  │ │ glTF/GLB 모델    │ │
         │ │ /api/fitting     │ │  │ │ 텍스처 (KTX2)    │ │
         │ └──────────────────┘ │  │ │ HDRI 환경맵      │ │
         │                      │  │ │ Draco 압축 에셋  │ │
         └──────────┬───────────┘  │ └──────────────────┘ │
                    │              └──────────────────────┘
                    ▼
         ┌──────────────────────┐
         │ Database             │
         │ (Supabase/PlanetScale)│
         │                      │
         │ - user_profiles      │
         │ - measurements       │
         │ - garments (메타)    │
         │ - fitting_history    │
         └──────────────────────┘
```

---

## 3. 프론트엔드 스택

### 3.1 핵심 기술

| 기술 | 역할 | 버전/비고 |
|------|------|-----------|
| React 18+ | UI 프레임워크 | Concurrent Mode 활용 |
| @react-three/fiber | Three.js React 바인딩 | 선언적 3D 씬 구성 |
| @react-three/drei | R3F 유틸리티 | OrbitControls, Environment, useGLTF 등 |
| Zustand | 3D 씬 상태 관리 | 렌더 루프 외부에서 상태 변경 |
| React state | UI 상태 관리 | 폼 입력, 모달, 탭 등 |
| TypeScript | 타입 안전성 | 전 프로젝트 적용 |

### 3.2 상태 관리 구조

```typescript
// Zustand — 3D 씬 전용 상태
interface SceneStore {
  // 아바타
  bodyParams: BodyMeasurements;
  avatarModelUrl: string;
  pose: PoseType;

  // 의류
  currentGarment: GarmentMeta | null;
  garmentModelUrl: string;
  garmentColor: string;

  // 시뮬레이션
  physicsState: ClothSimState;
  isSimulating: boolean;

  // 액션
  updateBodyParams: (params: Partial<BodyMeasurements>) => void;
  loadGarment: (garment: GarmentMeta) => void;
  resetPose: () => void;
}

// React state — UI 전용
// - 카탈로그 필터, 검색어, 모달 열림/닫힘
// - 서버 데이터 fetch 상태 (React Query / SWR)
```

### 3.3 컴포넌트 트리

```
<App>
  ├── <Header />
  ├── <MeasurementPanel />        ← React state (폼)
  ├── <GarmentCatalog />          ← React Query + REST API
  ├── <Canvas>                    ← R3F 진입점
  │   ├── <Environment />         ← drei: HDRI 환경맵
  │   ├── <OrbitControls />       ← drei: 카메라 컨트롤
  │   ├── <AvatarModel />         ← useGLTF, Zustand body params
  │   ├── <GarmentModel />        ← useGLTF, cloth sim 결과 반영
  │   └── <Lights />
  └── <FittingHistory />
```

---

## 4. 백엔드 설계

### 4.1 설계 원칙

백엔드는 **최소한의 역할**만 수행한다. 3D 연산, 물리 시뮬레이션, 렌더링은 모두 클라이언트에서 처리한다.

| 백엔드 역할 | 설명 |
|-------------|------|
| 에셋 서빙 | CDN을 통한 glTF/텍스처 배포 |
| 사용자 프로필 | 로그인, 치수 저장/불러오기 |
| 의류 카탈로그 | 메타데이터 목록, 검색, 필터 |
| 피팅 히스토리 | 사용자별 피팅 기록 저장 |

> **참고:** 사진 기반 신체 추정은 MediaPipe Pose(온디바이스)로 처리하므로 백엔드 연산이 불필요하다.

### 4.2 기술 선택

| 항목 | 선택지 | 이유 |
|------|--------|------|
| API | Supabase Edge Functions / Vercel Serverless | 서버리스, 관리 부담 최소 |
| 인증 | Supabase Auth | 소셜 로그인, JWT |
| 파일 저장 | Cloudflare R2 / AWS S3 | CDN 통합, 저비용 |
| DB | Supabase (PostgreSQL) / PlanetScale (MySQL) | 관계형, 서버리스 스케일링 |

---

## 5. 데이터베이스 스키마

```sql
-- 사용자 프로필
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  nickname    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 신체 치수 (민감 데이터 — 가능하면 클라이언트에만 저장)
CREATE TABLE measurements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES user_profiles(id),
  height_cm   REAL NOT NULL,
  chest_cm    REAL,
  waist_cm    REAL,
  hip_cm      REAL,
  shoulder_cm REAL,
  arm_len_cm  REAL,
  leg_len_cm  REAL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 의류 메타데이터
CREATE TABLE garments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,  -- 'top', 'bottom', 'outer', 'dress'
  brand         TEXT,
  size_spec     JSONB,          -- {"S": {...}, "M": {...}, "L": {...}}
  model_url     TEXT NOT NULL,  -- CDN 경로 (glTF/GLB)
  thumbnail_url TEXT,
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 피팅 히스토리
CREATE TABLE fitting_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES user_profiles(id),
  garment_id  UUID REFERENCES garments(id),
  fit_score   REAL,             -- 핏 적합도 (0-100)
  screenshot  TEXT,             -- 저장된 스크린샷 URL (선택)
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. 에셋 파이프라인

### 6.1 의류 모델 제작 → 배포 흐름

```
Blender (CLO3D)
    │
    │  .blend / .fbx 내보내기
    ▼
glTF 2.0 변환 (blender-gltf-exporter)
    │
    ▼
gltf-transform 최적화
    │
    ├── gltf-transform dedup      ← 중복 데이터 제거
    ├── gltf-transform draco      ← Draco 메시 압축
    ├── gltf-transform resize     ← 텍스처 리사이즈 (max 1024px)
    ├── gltf-transform ktx        ← KTX2 텍스처 압축 (GPU 압축)
    └── gltf-transform prune      ← 미사용 리소스 제거
    │
    ▼
최적화된 .glb 파일 (목표: 의류당 < 2MB)
    │
    ▼
CDN 업로드 (R2 / S3)
    │
    ▼
garments 테이블에 model_url 등록
```

### 6.2 gltf-transform CLI 예시

```bash
# 전체 최적화 파이프라인 (단일 명령)
npx @gltf-transform/cli optimize input.glb output.glb \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024
```

### 6.3 에셋 크기 목표

| 에셋 유형 | 최적화 전 | 최적화 후 목표 |
|-----------|----------|---------------|
| 아바타 바디 | 10-30 MB | 2-5 MB |
| 의류 모델 | 5-15 MB | 0.5-2 MB |
| 텍스처 (개당) | 2-8 MB | 0.1-0.5 MB (KTX2) |
| HDRI 환경맵 | 10-20 MB | 1-2 MB (HDR → KTX2) |

---

## 7. PWA 오프라인 지원

### 7.1 캐싱 전략

| 리소스 유형 | 캐싱 전략 | 저장 위치 |
|-------------|----------|----------|
| 앱 셸 (HTML, JS, CSS) | Cache-first, 백그라운드 업데이트 | Cache Storage |
| 3D 에셋 (glTF, 텍스처) | Cache-first, 필요 시 네트워크 | Cache Storage |
| API 응답 (카탈로그) | Network-first, 캐시 폴백 | Cache Storage |
| 사용자 치수 데이터 | 로컬 저장 우선 | IndexedDB |
| 피팅 히스토리 | 로컬 저장 + 동기화 | IndexedDB |

### 7.2 Service Worker 등록

```typescript
// sw.ts — Workbox 기반
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 앱 셸 프리캐싱
precacheAndRoute(self.__WB_MANIFEST);

// 3D 에셋 — Cache-first (최대 500MB, 30일)
registerRoute(
  ({ url }) => url.pathname.match(/\.(glb|gltf|ktx2|hdr)$/),
  new CacheFirst({
    cacheName: '3d-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// API — Network-first
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);
```

### 7.3 IndexedDB 스키마

```typescript
// idb-keyval 또는 Dexie.js 사용
interface LocalDB {
  userMeasurements: BodyMeasurements;       // 클라이언트 전용 보관
  fittingHistory: FittingRecord[];          // 오프라인 시 로컬 저장 → 온라인 복귀 시 동기화
  favoriteGarments: string[];               // garment ID 목록
  cachedCatalog: GarmentMeta[];             // 오프라인 카탈로그 사본
}
```

---

## 8. 성능 아키텍처

### 8.1 스레드 분리

```
┌─────────────────────────────────────────────┐
│ Main Thread                                 │
│                                             │
│  React 렌더링 + Three.js 렌더 루프          │
│  - requestAnimationFrame 기반 60fps         │
│  - GPU 렌더링 (WebGPU / WebGL)              │
│  - UI 이벤트 처리                            │
│                                             │
│  ◄─── postMessage ───►                      │
│                                             │
├─────────────────────────────────────────────┤
│ Web Worker (물리 전용)                       │
│                                             │
│  Ammo.js Cloth Simulation                   │
│  - 매 프레임 정점 위치 계산                   │
│  - SharedArrayBuffer로 정점 데이터 전달      │
│  - 메인 스레드 블로킹 방지                    │
│                                             │
└─────────────────────────────────────────────┘
```

### 8.2 핵심 성능 지표 목표

| 지표 | 목표값 | 측정 방법 |
|------|--------|----------|
| 초기 로딩 (FCP) | < 1.5초 | Lighthouse |
| 3D 씬 인터랙티브 | < 3초 | 첫 에셋 로드 완료 시점 |
| 프레임 레이트 | 30-60 FPS | stats.js / Chrome DevTools |
| 의류 전환 시간 | < 1초 | 에셋 캐시 히트 시 |
| 메모리 사용량 | < 300 MB | Chrome Task Manager |

### 8.3 최적화 기법

```
1. 에셋 로딩
   - useGLTF.preload()로 다음 의류 선제 로딩
   - Draco + KTX2 압축으로 전송량 감소
   - <Suspense> 활용 로딩 UI

2. 렌더링
   - drei의 <BakeShadows />로 정적 그림자 베이크
   - LOD (Level of Detail): 거리 기반 메시 단순화
   - Instanced mesh: 동일 버튼/지퍼 등 반복 요소

3. 물리 시뮬레이션
   - Web Worker에서 Ammo.js 구동
   - SharedArrayBuffer + Atomics로 제로카피 전달
   - 시뮬레이션 step 수 동적 조절 (디바이스 성능 기반)
```

---

## 9. REST API 설계

### 9.1 엔드포인트 목록

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/garments` | 의류 카탈로그 목록 (필터, 페이지네이션) | 불필요 |
| GET | `/api/garments/:id` | 의류 상세 (메타데이터 + 모델 URL) | 불필요 |
| GET | `/api/garments/search?q=` | 의류 검색 | 불필요 |
| POST | `/api/users/profile` | 사용자 프로필 생성/수정 | 필요 |
| GET | `/api/users/profile` | 내 프로필 조회 | 필요 |
| PUT | `/api/users/measurements` | 치수 저장 (선택적 서버 동기화) | 필요 |
| GET | `/api/users/measurements` | 저장된 치수 조회 | 필요 |
| POST | `/api/fitting/history` | 피팅 기록 저장 | 필요 |
| GET | `/api/fitting/history` | 피팅 히스토리 조회 | 필요 |

### 9.2 응답 형식 예시

```json
// GET /api/garments?category=top&page=1&limit=20
{
  "data": [
    {
      "id": "gar_abc123",
      "name": "오버사이즈 크루넥 티셔츠",
      "category": "top",
      "brand": "BasicWear",
      "sizes": ["S", "M", "L", "XL"],
      "modelUrl": "https://cdn.example.com/garments/tshirt-crew-01.glb",
      "thumbnailUrl": "https://cdn.example.com/thumbs/tshirt-crew-01.webp",
      "tags": ["캐주얼", "오버핏", "면"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

---

## 10. AI 하이브리드 연동

3D 아바타 피팅을 주 기능으로 하되, 선택적으로 AI VTON 엔드포인트를 연결할 수 있다.

### 10.1 하이브리드 UX 흐름

```
사용자
  │
  ├─→ [3D 아바타 피팅] ← 메인 기능 (클라이언트)
  │     360° 회전, 포즈 변경, 실시간 피팅
  │
  └─→ [AI 사진 입어보기] ← 보조 기능 (서버)
        사용자 사진 업로드 → AI VTON → 결과 이미지
```

### 10.2 AI VTON 엔드포인트 (선택 구현)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/vton/try-on` | 사진 + 의류 ID → AI 합성 이미지 |
| GET | `/api/vton/result/:id` | 비동기 결과 조회 (폴링) |

```json
// POST /api/vton/try-on
{
  "userPhotoUrl": "https://...",
  "garmentId": "gar_abc123",
  "options": {
    "resolution": "512x768",
    "preserveBackground": true
  }
}

// Response
{
  "jobId": "vton_xyz789",
  "status": "processing",
  "estimatedSeconds": 15
}
```

> AI VTON 서버는 외부 서비스(Replicate, 자체 GPU 서버 등)로 분리하며, 메인 시스템과 느슨하게 결합한다.

---

## 11. 배포 아키텍처

### 11.1 인프라 구성

```
┌──────────────────────────────────────────────────┐
│                   사용자 브라우저                    │
└────────────┬──────────────────┬───────────────────┘
             │                  │
     ┌───────▼────────┐  ┌─────▼──────────────┐
     │ Vercel /        │  │ Cloudflare R2      │
     │ Cloudflare Pages│  │ (또는 AWS S3 +     │
     │                 │  │  CloudFront)        │
     │ - React SPA     │  │                    │
     │ - SSR/SSG 가능  │  │ - glTF/GLB 모델   │
     │ - Edge Functions│  │ - KTX2 텍스처     │
     └───────┬─────────┘  │ - HDRI 환경맵     │
             │             └────────────────────┘
             │ API 호출
     ┌───────▼─────────┐
     │ Supabase         │
     │ (또는 PlanetScale)│
     │                  │
     │ - PostgreSQL DB  │
     │ - Auth           │
     │ - Edge Functions │
     │ - Realtime (옵션)│
     └──────────────────┘
```

### 11.2 환경별 배포

| 환경 | 프론트엔드 | 에셋 CDN | DB | 용도 |
|------|-----------|---------|-----|------|
| dev | localhost:3000 | R2 dev bucket | Supabase dev | 개발 |
| staging | preview.vercel.app | R2 staging bucket | Supabase staging | QA |
| prod | fitting.example.com | R2 prod + 커스텀 도메인 | Supabase prod | 서비스 |

---

## 12. 보안 설계

### 12.1 원칙: 민감 데이터 클라이언트 우선 보관

신체 치수는 개인 민감 정보에 해당한다. 가능하면 서버에 저장하지 않는다.

| 데이터 | 저장 위치 | 이유 |
|--------|----------|------|
| 신체 치수 | IndexedDB (클라이언트) | 서버 유출 위험 제거 |
| 치수 서버 동기화 | 선택적, 암호화 후 저장 | 다기기 동기화 필요 시에만 |
| 로그인 토큰 | httpOnly 쿠키 / 메모리 | XSS 방지 |
| 의류 메타데이터 | 서버 DB | 공개 데이터 |

### 12.2 추가 보안 조치

```
1. API 보안
   - Rate limiting (Supabase / Cloudflare)
   - CORS: 허용 도메인만 API 접근
   - 입력 검증: Zod 스키마로 request body 검증

2. 에셋 보안
   - CDN signed URL (유료 에셋의 경우)
   - 핫링크 방지 (Referer 체크)

3. 클라이언트 보안
   - CSP (Content Security Policy) 헤더
   - Subresource Integrity (CDN 에셋)
   - 치수 데이터 암호화: Web Crypto API로 AES-GCM 암호화 후 IndexedDB 저장
```

---

## 13. 확장성 전략

### 13.1 CDN-first 아키텍처

```
트래픽 흐름:

  사용자 100명  → CDN 에셋 서빙      → 서버 부하: 거의 없음
  사용자 10,000명 → CDN 에셋 서빙    → 서버 부하: API 호출만 증가
  사용자 100,000명 → CDN 에셋 서빙   → 서버 부하: DB 쿼리 최적화 필요

  ※ 3D 연산은 전부 클라이언트에서 수행 → 사용자 수 증가해도 서버 컴퓨팅 비용 불변
```

### 13.2 비용 예측

| 사용자 규모 | CDN 비용 (월) | DB 비용 (월) | 합계 (월) |
|------------|-------------|-------------|----------|
| 1,000 MAU | ~$5 | $0 (무료 티어) | ~$5 |
| 10,000 MAU | ~$20 | ~$10 | ~$30 |
| 100,000 MAU | ~$100 | ~$50 | ~$150 |

> GPU 서버가 필요 없으므로 AI VTON 대비 운영비가 10-100배 저렴하다.

### 13.3 확장 포인트

| 단계 | 조치 |
|------|------|
| Phase 1 (MVP) | Supabase 무료 + R2 무료 + Vercel 무료 |
| Phase 2 (성장) | CDN 커스텀 도메인, DB 인덱스 최적화, 에셋 프리로딩 |
| Phase 3 (확장) | 멀티 리전 CDN, DB read replica, 에셋 버저닝 |

---

## 14. 기술 스택 요약

| 레이어 | 기술 | 비고 |
|--------|------|------|
| UI 프레임워크 | React 18+ | Next.js 또는 Vite 기반 |
| 3D 렌더링 | @react-three/fiber + @react-three/drei | Three.js 위에 선언적 래퍼 |
| 3D 씬 상태 | Zustand | subscribe + transient updates |
| UI 상태 | React useState/useReducer | 단순 UI에는 내장 상태 사용 |
| 서버 상태 | TanStack Query (React Query) | 캐싱, 재검증, 낙관적 업데이트 |
| 물리 엔진 | Ammo.js (Web Worker) | Bullet Physics 포트 |
| 에셋 최적화 | gltf-transform | Draco, KTX2, dedup |
| PWA | Workbox | Service Worker 생성 |
| 로컬 DB | Dexie.js (IndexedDB) | 오프라인 데이터 |
| 백엔드 | Supabase (Auth + DB + Edge Functions) | 서버리스 |
| 에셋 CDN | Cloudflare R2 | S3 호환, 이그레스 무료 |
| 프론트 배포 | Vercel / Cloudflare Pages | Edge 배포, 자동 프리뷰 |
| 사진 신체 추정 | MediaPipe Pose (@mediapipe/tasks-vision) | 온디바이스, Apache 2.0 |
| AI VTON (옵션) | 외부 서비스 (Replicate 등) | 느슨한 결합 |
