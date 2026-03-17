# Feature: 피팅 히스토리

사용자의 가상 피팅 기록을 저장하고 조회한다.
로컬(IndexedDB) 저장을 기본으로 하고, 로그인 시 서버 동기화를 지원한다.

---

## Background

```gherkin
Given 사용자가 가상 피팅 페이지에 있다
And 아바타에 의류가 착용되어 있다
```

---

## 피팅 기록 저장

### Scenario: 피팅 기록 자동 저장

```gherkin
Given 아바타에 의류가 착용되어 있다
When 사용자가 "저장" 버튼을 클릭한다
Then 다음 정보가 피팅 기록으로 저장된다:
  | 필드          | 내용                      |
  | garmentId    | 착용 중인 의류 ID          |
  | measurements | 현재 체형 파라미터         |
  | garmentColor | 현재 의류 색상             |
  | timestamp    | 저장 시각                  |
  | thumbnail    | 3D 뷰포트 스크린샷 (선택)  |
And IndexedDB에 기록이 저장된다
And "피팅이 저장되었습니다" 확인 메시지가 표시된다
```

### Scenario: 스크린샷 캡처

```gherkin
Given 사용자가 피팅 저장을 요청했다
When 3D 캔버스에서 스크린샷이 캡처된다
Then renderer.domElement.toDataURL()로 현재 렌더링 상태가 이미지로 변환된다
And 스크린샷이 피팅 기록에 첨부된다
And 썸네일 크기(320x240)로 리사이즈되어 저장된다
```

---

## 피팅 기록 조회

### Scenario: 히스토리 목록 표시

```gherkin
Given 사용자에게 저장된 피팅 기록이 있다
When 피팅 히스토리 패널을 열면
Then 저장된 기록이 최신순으로 목록 표시된다
And 각 기록에 의류 이름, 날짜, 썸네일이 표시된다
```

### Scenario: 피팅 기록 없음

```gherkin
Given 사용자에게 저장된 피팅 기록이 없다
When 피팅 히스토리 패널을 열면
Then "저장된 피팅 기록이 없습니다" 메시지가 표시된다
```

### Scenario: 피팅 기록 복원

```gherkin
Given 피팅 히스토리 목록이 표시되어 있다
When 사용자가 특정 기록을 클릭한다
Then 해당 기록의 체형 파라미터가 아바타에 적용된다
And 해당 기록의 의류가 로드되어 착용된다
And 해당 기록의 색상이 적용된다
And 저장 시점의 피팅 상태가 재현된다
```

### Scenario: 피팅 기록 삭제

```gherkin
Given 피팅 히스토리 목록이 표시되어 있다
When 사용자가 특정 기록의 삭제 버튼을 클릭한다
Then "이 피팅 기록을 삭제하시겠습니까?" 확인 다이얼로그가 표시된다

When 사용자가 확인한다
Then IndexedDB에서 해당 기록이 삭제된다
And 목록에서 해당 항목이 제거된다
```

---

## 서버 동기화 (로그인 사용자)

### Scenario: 서버에 피팅 기록 동기화

```gherkin
Given 사용자가 로그인되어 있다
And 새 피팅 기록이 IndexedDB에 저장되었다
When 네트워크가 온라인 상태이다
Then POST /api/fitting/history API가 호출된다
And 서버에 피팅 기록이 동기화된다
```

### Scenario: 오프라인 시 로컬 저장 후 동기화

```gherkin
Given 사용자가 로그인되어 있다
And 네트워크가 오프라인이다
When 피팅 기록을 저장한다
Then IndexedDB에만 기록이 저장된다
And 기록에 "미동기화" 플래그가 설정된다

When 네트워크가 온라인으로 복구된다
Then 미동기화 기록들이 서버에 자동 동기화된다
And "미동기화" 플래그가 해제된다
```

### Scenario: 다른 기기에서 히스토리 조회

```gherkin
Given 사용자가 로그인되어 있다
And 다른 기기에서 피팅 기록을 저장한 적이 있다
When 피팅 히스토리를 조회한다
Then GET /api/fitting/history API가 호출된다
And 서버에 저장된 기록과 로컬 기록이 병합되어 표시된다
And 중복 기록은 제거된다
```

---

## API

```
POST /api/fitting/history
  Body: { garmentId, measurements, garmentColor, screenshotUrl?, fitScore? }
  Response: { id, createdAt }

GET /api/fitting/history
  Query: ?page=1&limit=20
  Response: { data: FittingRecord[], pagination }
```

## 관련 문서

- [07-architecture-design.md — REST API](../07-architecture-design.md)
