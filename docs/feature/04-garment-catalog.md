# Feature: 의류 카탈로그 및 선택

사용자가 의류 목록을 탐색하고, 원하는 의류를 선택하여 아바타에 착용한다.

---

## Background

```gherkin
Given 사용자가 가상 피팅 페이지에 있다
And 아바타 모델이 로드되어 있다
And 백엔드(Supabase)에 의류 메타데이터가 등록되어 있다
```

---

## 카탈로그 조회

### Scenario: 의류 목록 로딩

```gherkin
When 의류 카탈로그 패널이 마운트된다
Then GET /api/garments API가 호출된다
And 의류 목록이 썸네일 그리드 형태로 표시된다
And 각 의류 카드에 이름, 카테고리, 브랜드가 표시된다
```

### Scenario: 카테고리별 필터링

```gherkin
Given 의류 카탈로그가 로드되어 있다
When 사용자가 "상의" 카테고리 필터를 선택한다
Then GET /api/garments?category=top API가 호출된다
And 상의 카테고리에 해당하는 의류만 목록에 표시된다
```

### Scenario: 키워드 검색

```gherkin
Given 의류 카탈로그가 로드되어 있다
When 사용자가 검색창에 "오버핏 티셔츠"를 입력한다
Then GET /api/garments/search?q=오버핏+티셔츠 API가 호출된다
And 검색 결과에 해당하는 의류만 목록에 표시된다
```

### Scenario: 검색 결과 없음

```gherkin
Given 의류 카탈로그가 로드되어 있다
When 사용자가 검색창에 매칭되지 않는 키워드를 입력한다
Then "검색 결과가 없습니다" 메시지가 표시된다
```

### Scenario: 페이지네이션

```gherkin
Given 의류가 20개 이상 등록되어 있다
When 첫 번째 페이지가 로드된다
Then 최대 20개의 의류가 표시된다
And 페이지 네비게이션이 표시된다
When 사용자가 다음 페이지를 클릭한다
Then GET /api/garments?page=2&limit=20 API가 호출된다
And 다음 20개 의류가 표시된다
```

---

## 의류 선택

### Scenario: 의류 카드 선택

```gherkin
Given 의류 카탈로그가 표시되어 있다
When 사용자가 "기본 티셔츠" 카드를 클릭한다
Then 해당 카드에 선택 표시(파란 테두리)가 활성화된다
And 의류 glTF 모델이 CDN에서 로드된다
And 의류가 아바타에 착용된다
```

### Scenario: 의류 교체

```gherkin
Given 아바타에 "기본 티셔츠"가 착용되어 있다
When 사용자가 "집업 후디" 카드를 클릭한다
Then 기존 "기본 티셔츠"의 GPU 리소스가 해제된다 (dispose)
And "집업 후디" glTF 모델이 로드된다
And 의류가 교체되어 아바타에 착용된다
And 의류 전환 시간이 1초 이내이다 (캐시 히트 시)
```

### Scenario: 의류 상세 정보 조회

```gherkin
Given 의류 카탈로그가 표시되어 있다
When 사용자가 의류 카드의 상세 보기 버튼을 클릭한다
Then GET /api/garments/:id API가 호출된다
And 의류 상세 정보(이름, 브랜드, 사이즈 옵션, 소재, 태그)가 표시된다
```

---

## 오프라인 대응

### Scenario: 카탈로그 오프라인 캐시

```gherkin
Given 의류 카탈로그를 온라인에서 한 번 로드한 적이 있다
When 네트워크가 오프라인이 된다
And 사용자가 카탈로그를 다시 조회한다
Then IndexedDB에 캐시된 카탈로그 데이터가 표시된다
And "오프라인 모드 — 캐시된 데이터를 표시합니다" 안내가 표시된다
```

---

## API 응답 형식

```json
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

## 관련 문서

- [07-architecture-design.md — REST API](../07-architecture-design.md)
- [05-garment-modeling.md](../05-garment-modeling.md)
