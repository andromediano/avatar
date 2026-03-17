# Feature: PWA 오프라인 지원

Progressive Web App으로 오프라인에서도 기본 기능을 사용할 수 있도록 한다.
3D 에셋 캐싱, 로컬 데이터 저장, 네트워크 복구 시 자동 동기화를 지원한다.

---

## Background

```gherkin
Given 사용자가 가상 피팅 웹앱에 한 번 이상 접속한 적이 있다
```

---

## Service Worker 등록

### Scenario: Service Worker 최초 등록

```gherkin
When 사용자가 웹앱에 처음 접속한다
Then Service Worker가 등록된다
And 앱 셸(HTML, JS, CSS)이 프리캐싱된다
And 콘솔에 Service Worker 등록 성공 로그가 출력된다
```

### Scenario: Service Worker 업데이트

```gherkin
Given Service Worker가 이미 등록되어 있다
When 새 버전의 앱이 배포된다
And 사용자가 웹앱에 재접속한다
Then 새 Service Worker가 백그라운드에서 설치된다
And "새 버전이 있습니다. 새로고침하시겠습니까?" 안내가 표시된다
```

---

## 3D 에셋 캐싱

### Scenario: glTF/GLB 모델 캐싱

```gherkin
Given 사용자가 의류 모델을 한 번 로드한 적이 있다
When 동일 의류를 다시 선택한다
Then Cache Storage에서 캐시된 .glb 파일이 반환된다 (Cache-first 전략)
And 네트워크 요청이 발생하지 않는다
And 의류 로딩이 즉각적으로 완료된다
```

### Scenario: KTX2 텍스처 캐싱

```gherkin
Given 3D 에셋이 로드될 때
Then .ktx2 텍스처 파일이 '3d-assets' 캐시에 저장된다
And 캐시 만료 기간은 30일이다
And 최대 200개 에셋이 캐시된다
```

### Scenario: HDRI 환경맵 캐싱

```gherkin
Given 3D 씬에 환경맵이 로드될 때
Then .hdr 파일이 '3d-assets' 캐시에 저장된다
And Cache-first 전략으로 재사용된다
```

### Scenario: 캐시 용량 초과

```gherkin
Given '3d-assets' 캐시에 200개 에셋이 저장되어 있다
When 새 에셋이 캐시에 추가된다
Then 가장 오래된 에셋이 자동 삭제된다 (LRU)
And 새 에셋이 캐시에 저장된다
```

---

## API 응답 캐싱

### Scenario: 카탈로그 API 캐싱 (Network-first)

```gherkin
Given 네트워크가 온라인이다
When GET /api/garments가 호출된다
Then 서버에서 최신 응답을 가져온다
And 응답이 'api-cache'에 저장된다

Given 네트워크가 오프라인이다
When GET /api/garments가 호출된다
Then 'api-cache'에서 캐시된 응답이 반환된다
```

---

## IndexedDB 로컬 저장

### Scenario: 사용자 치수 로컬 저장

```gherkin
Given 사용자가 체형 파라미터를 설정했다
When 저장이 요청된다
Then 치수 데이터가 Web Crypto API(AES-GCM)로 암호화된다
And 암호화된 데이터가 IndexedDB 'userMeasurements'에 저장된다
```

### Scenario: 오프라인 시 치수 데이터 접근

```gherkin
Given 사용자의 치수가 IndexedDB에 저장되어 있다
And 네트워크가 오프라인이다
When 사용자가 웹앱에 접속한다
Then IndexedDB에서 치수가 복호화되어 로드된다
And 아바타가 저장된 체형으로 설정된다
```

### Scenario: 즐겨찾기 의류 로컬 저장

```gherkin
Given 사용자가 의류를 즐겨찾기에 추가했다
Then 의류 ID가 IndexedDB 'favoriteGarments'에 저장된다
And 오프라인에서도 즐겨찾기 목록이 표시된다
```

---

## 네트워크 복구 시 동기화

### Scenario: 오프라인 데이터 자동 동기화

```gherkin
Given 사용자가 오프라인 상태에서 피팅 기록을 저장했다
And 기록에 "미동기화" 플래그가 설정되어 있다
When 네트워크가 온라인으로 복구된다
Then navigator.onLine 이벤트가 감지된다
And 미동기화 데이터가 서버 API로 전송된다
And 동기화 완료 후 "미동기화" 플래그가 해제된다
```

---

## 앱 설치

### Scenario: PWA 설치 프롬프트

```gherkin
Given 사용자가 웹앱을 2회 이상 방문했다
When 브라우저의 PWA 설치 조건이 충족된다
Then "홈 화면에 추가" 설치 배너가 표시된다

When 사용자가 설치를 수행한다
Then 웹앱이 독립 실행형(standalone)으로 설치된다
And 앱 아이콘이 홈 화면에 추가된다
```

---

## 캐싱 전략 요약

| 리소스 유형 | 전략 | 저장 위치 | 만료 |
|-------------|------|----------|------|
| 앱 셸 (HTML, JS, CSS) | Precache + 백그라운드 업데이트 | Cache Storage | 배포 시 갱신 |
| 3D 에셋 (.glb, .ktx2, .hdr) | Cache-first | Cache Storage | 30일, max 200 |
| API 응답 | Network-first, 캐시 폴백 | Cache Storage | 최신 응답 우선 |
| 사용자 치수 | 로컬 저장 우선 | IndexedDB (암호화) | 무기한 |
| 피팅 히스토리 | 로컬 + 동기화 | IndexedDB → 서버 | 무기한 |
| 즐겨찾기 | 로컬 저장 | IndexedDB | 무기한 |

## 관련 문서

- [07-architecture-design.md — PWA 오프라인 지원](../07-architecture-design.md)
