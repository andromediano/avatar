# 신체 치수 → 아바타 파라미터 매핑

신체 측정값을 3D 아바타의 형상 파라미터로 변환하는 기술 문서.
측정 표준, 입력 방식, 변환 알고리즘, 검증 방법을 다룬다.

---

## 1. ISO 8559 신체 측정 기준점

ISO 8559는 의류 설계를 위한 신체 측정 위치와 방법을 정의하는 국제 표준이다.

| 측정 항목 | ISO 8559 기준점 | 설명 |
|-----------|----------------|------|
| 키 (stature) | 머리 꼭대기 → 바닥 | 맨발 직립 자세 수직 거리 |
| 가슴둘레 (chest girth) | 겨드랑이 바로 아래 수평면 | 유두점 높이에서 수평 측정 |
| 허리둘레 (waist girth) | 자연 허리선 | 가장 가느다란 수평면 |
| 엉덩이둘레 (hip girth) | 엉덩이 최대 돌출부 | 수평 측정 |
| 어깨너비 (shoulder width) | 좌우 어깨끝점(acromion) | 등 쪽 표면 거리 |
| 팔길이 (arm length) | 어깨끝점 → 손목점 | 팔꿈치 약간 굽힌 상태 |
| 안쪽다리길이 (inseam) | 가랑이점 → 바닥 | 다리 안쪽 직선 거리 |
| 목둘레 (neck girth) | 목 기저부 수평면 | 갑상연골 바로 아래 |

> ISO 8559-1:2017(Part 1)은 측정 위치 정의, ISO 8559-2:2017(Part 2)은 사이즈 체계 기초를 규정한다.

---

## 2. 한국 의류 치수 체계 (KS K 0051)

KS K 0051은 한국산업표준으로 의류의 호칭 및 치수 체계를 규정한다.

### 2.1 호칭 체계

상의는 **가슴둘레** 기준, 하의는 **허리둘레** 기준으로 호칭을 부여한다.
호칭 표기: `가슴둘레 / 키` 또는 `허리둘레 / 키` (예: 95/170)

### 2.2 남성 상의 사이즈 범위

| 호칭 | 가슴둘레 (cm) | 허리둘레 (cm) | 키 범위 (cm) | 대응 레터 |
|------|-------------|-------------|-------------|----------|
| 85 | 82–87 | 68–73 | 160–170 | XS |
| 90 | 87–92 | 73–78 | 165–175 | S |
| 95 | 92–97 | 78–83 | 165–175 | M |
| 100 | 97–102 | 83–88 | 170–180 | L |
| 105 | 102–107 | 88–93 | 170–180 | XL |
| 110 | 107–112 | 93–98 | 175–185 | XXL |

### 2.3 여성 상의 사이즈 범위

| 호칭 | 가슴둘레 (cm) | 허리둘레 (cm) | 키 범위 (cm) |
|------|-------------|-------------|-------------|
| 80 | 77–82 | 61–66 | 150–160 |
| 85 | 82–87 | 66–71 | 155–165 |
| 90 | 87–92 | 71–76 | 155–165 |
| 95 | 92–97 | 76–81 | 160–170 |
| 100 | 97–102 | 81–86 | 160–170 |

---

## 3. 신체 치수 입력 방식

### 3.1 직접 입력

사용자가 줄자로 측정하거나 알고 있는 값을 직접 입력한다.

**필수 항목:** 키, 몸무게, 가슴둘레, 허리둘레, 엉덩이둘레
**선택 항목:** 어깨너비, 팔길이, 안쪽다리길이

### 3.2 사이즈 테이블 조회

KS K 0051 호칭으로부터 대표 치수를 역산한다.

```
입력: 성별=남, 사이즈=100
→ 가슴둘레=99.5, 허리둘레=85.5, 키=175
→ 나머지 항목은 Size Korea 통계 기반 추정
```

### 3.3 사진 기반 추정 (MediaPipe Pose)

**MediaPipe Pose**를 사용하여 정면/측면 2장의 사진에서 신체 비율을 추출한다.
MediaPipe Pose는 Google의 오픈소스(Apache 2.0)로, 온디바이스 처리(브라우저 WASM)이므로 서버 비용이 발생하지 않으며 프라이버시도 보장된다.

```
입력: 정면 사진 + 측면 사진 + 키(참조값)
→ MediaPipe Pose로 33개 키포인트 추출
→ 키포인트 간 비율 계산 (어깨 너비, 팔 길이 등)
→ 실루엣 분할(MediaPipe Selfie Segmentation)
→ 비율 → 절대 치수 변환(키 기준)
```

**MediaPipe Pose 모델 선택:**
| 모델 | 정확도 | 속도 | 용도 |
|------|--------|------|------|
| lite | 낮음 | 빠름 | 실시간 AR 트래킹 |
| full | 중간 | 중간 | 일반 용도 |
| heavy | 높음 | 느림 | 사진 기반 치수 추정 (권장) |

> 사진 기반 추정은 실시간이 아니므로 heavy 모델을 사용하여 정확도를 최대화한다.

### 3.4 입력 방식 비교

| 항목 | 직접 입력 | 사이즈 조회 | 사진 추정 |
|------|----------|-----------|----------|
| 정확도 | 높음 (측정 기술 의존) | 중간 (이산적 근사) | 중간~높음 (MediaPipe Pose heavy) |
| 사용자 부담 | 높음 (줄자 필요) | 낮음 (사이즈만 선택) | 낮음 (사진 2장) |
| 구현 복잡도 | 낮음 | 낮음 | 중간 (MediaPipe SDK 활용) |
| 필요 데이터 | 없음 | 사이즈 테이블 | MediaPipe Pose 모델 (온디바이스, 무료) |
| 추정 가능 항목 수 | 사용자가 입력한 만큼 | 제한적 (5~6개) | 많음 (10개 이상) |
| 권장 용도 | 고정밀 피팅 | 빠른 프로토타입 | 일반 소비자 서비스 |

---

## 4. 측정값 → 형상 파라미터 변환 방식

### 4.1 PCA 기반 선형 매핑 (SMPL 스타일)

SMPL 모델은 신체 형상을 주성분(shape coefficient) β로 표현한다.
측정값 벡터 **m**에서 β로의 선형 회귀를 구성한다.

```
β = W · m + b

여기서:
  m ∈ R^k  : 정규화된 측정값 벡터 (k = 측정 항목 수)
  W ∈ R^n×k : 회귀 가중치 행렬 (n = shape coefficient 수, 보통 10)
  b ∈ R^n  : 바이어스
  β ∈ R^n  : shape coefficient 벡터
```

**장점:** 연속적 보간이 자연스러움, 적은 파라미터
**단점:** 비선형 체형 차이 표현에 한계, SMPL 학습 데이터 필요

### 4.2 조회 테이블 (Lookup Table)

이산적 사이즈별로 미리 제작한 바디 메시를 매핑한다.

```
사이즈 호칭 → 사전 제작된 메시 선택 → 미세 조정(스케일링)

테이블 구조:
  { "95/170/M": mesh_id_001, "100/175/L": mesh_id_002, ... }
```

**장점:** 구현이 단순, 결과 예측 가능
**단점:** 메시 수만큼만 체형 표현, 중간 사이즈 보간 부자연스러움

### 4.3 회귀 모델 (ML Regression)

측정값에서 정점(vertex) 좌표 또는 형상 파라미터로의 비선형 회귀.
딥러닝이 아닌 전통 ML 모델을 사용한다.

```
학습 데이터: { (m_i, v_i) } (측정값-정점 쌍, Size Korea 3D 스캔)

모델 후보:
  - Ridge Regression: 과적합 방지, 선형에 가까운 관계에 적합
  - Random Forest Regression: 비선형 관계 포착 가능
  - SVR (Support Vector Regression): 소규모 데이터에서 일반화 양호

파이프라인:
  측정값 정규화 → PCA 차원 축소(선택) → 회귀 모델 → 형상 파라미터
```

**장점:** 비선형 체형 포착, SMPL 의존성 없음
**단점:** 3D 스캔 학습 데이터 필요, 모델 관리 비용

### 4.4 변환 방식 비교

| 항목 | PCA 선형 매핑 | 조회 테이블 | ML 회귀 |
|------|-------------|-----------|---------|
| 체형 표현력 | 중간 | 낮음 | 높음 |
| 구현 난이도 | 중간 | 낮음 | 중간~높음 |
| 필요 데이터 | SMPL 모델 | 사전 제작 메시 | 3D 스캔 데이터셋 |
| 실시간 성능 | 빠름 (행렬 곱) | 빠름 (조회) | 보통 (추론) |
| 보간 품질 | 자연스러움 | 부자연스러움 | 자연스러움 |

---

## 5. 구현 예시: 측정값 → 아바타 파라미터 변환

```javascript
/**
 * 신체 측정값으로부터 아바타 형상 파라미터를 계산한다.
 * PCA 기반 선형 매핑 방식 사용.
 */

// Size Korea 평균 기반 정규화 상수 (남성)
const MEAN = {
  height: 172.5, weight: 71.3, chest: 95.2,
  waist: 82.0, hip: 95.8, shoulder: 43.5,
  armLength: 58.2, inseam: 77.5
};
const STD = {
  height: 5.8, weight: 10.2, chest: 6.1,
  waist: 7.8, hip: 5.4, shoulder: 2.9,
  armLength: 3.1, inseam: 4.2
};

// 회귀 가중치 (10개 shape coefficient × 8개 측정값)
// 실제로는 학습 데이터로부터 산출
const W = [
  [ 0.42, 0.31, 0.18, 0.12, 0.15, 0.08, 0.22, 0.19],
  [-0.05, 0.28, 0.35, 0.41, 0.33, 0.02, 0.01, 0.03],
  [ 0.01, 0.03, 0.11,-0.08, 0.22, 0.38, 0.05, 0.02],
  // ... (총 10행)
];
const BIAS = [0.0, 0.0, 0.0 /* ... */];

/**
 * 측정값을 정규화한다.
 * @param {Object} measurements - 원시 측정값 (cm, kg)
 * @returns {number[]} 정규화된 벡터
 */
function normalize(measurements) {
  const keys = Object.keys(MEAN);
  return keys.map(k => {
    const val = measurements[k] ?? MEAN[k]; // 누락 시 평균 대체
    return (val - MEAN[k]) / STD[k];
  });
}

/**
 * 정규화된 측정 벡터를 shape coefficient로 변환한다.
 * β = W · m + b
 * @param {number[]} m - 정규화된 측정값 벡터
 * @returns {number[]} shape coefficient 배열
 */
function measurementsToShapeCoeffs(m) {
  return W.map((row, i) => {
    const dot = row.reduce((sum, w, j) => sum + w * m[j], 0);
    return dot + BIAS[i];
  });
}

/**
 * 전체 파이프라인: 원시 측정값 → 아바타 파라미터
 * @param {Object} raw - { height, weight, chest, waist, hip, shoulder, armLength, inseam }
 * @returns {Object} 아바타 설정 객체
 */
function convertToAvatarParams(raw) {
  // 1. 입력 검증
  if (!raw.height || raw.height < 140 || raw.height > 200) {
    throw new Error('키는 140~200cm 범위여야 합니다.');
  }

  // 2. 누락 항목 추정 (BMI 기반 간이 추정)
  if (!raw.weight && raw.chest && raw.waist) {
    raw.weight = estimateWeightFromGirths(raw);
  }

  // 3. 정규화 및 변환
  const normalized = normalize(raw);
  const shapeCoeffs = measurementsToShapeCoeffs(normalized);

  // 4. 전역 스케일 계산 (키 기준)
  const globalScale = raw.height / MEAN.height;

  return {
    shapeCoefficients: shapeCoeffs,
    globalScale,
    inputMeasurements: { ...raw },
    method: 'pca-linear'
  };
}

/**
 * 사이즈 호칭으로부터 아바타 파라미터를 생성한다.
 * @param {string} gender - 'M' | 'F'
 * @param {number} sizeLabel - KS K 0051 호칭 (85, 90, 95, ...)
 * @returns {Object} 아바타 설정 객체
 */
function convertFromSizeLabel(gender, sizeLabel) {
  const table = SIZE_TABLE[gender];
  const entry = table[sizeLabel];
  if (!entry) throw new Error(`지원하지 않는 사이즈: ${sizeLabel}`);

  return convertToAvatarParams({
    height: entry.height,
    weight: entry.weight,
    chest: entry.chest,
    waist: entry.waist,
    hip: entry.hip,
    shoulder: entry.shoulder,
    armLength: entry.armLength,
    inseam: entry.inseam
  });
}

// 사이즈 테이블 (KS K 0051 + Size Korea 평균)
const SIZE_TABLE = {
  M: {
    85:  { height: 165, weight: 58, chest: 84.5, waist: 70.5, hip: 89, shoulder: 40, armLength: 55, inseam: 74 },
    90:  { height: 170, weight: 64, chest: 89.5, waist: 75.5, hip: 92, shoulder: 42, armLength: 57, inseam: 76 },
    95:  { height: 172, weight: 70, chest: 94.5, waist: 80.5, hip: 95, shoulder: 43, armLength: 58, inseam: 77 },
    100: { height: 175, weight: 76, chest: 99.5, waist: 85.5, hip: 98, shoulder: 45, armLength: 59, inseam: 79 },
    105: { height: 177, weight: 82, chest: 104.5, waist: 90.5, hip: 101, shoulder: 46, armLength: 60, inseam: 80 },
    110: { height: 178, weight: 88, chest: 109.5, waist: 95.5, hip: 104, shoulder: 47, armLength: 61, inseam: 80 },
  }
};
```

---

## 6. Size Korea 인체 측정 통계 참조

국가기술표준원이 주관하는 Size Korea(한국인 인체치수조사)는 직접 측정 및 3D 스캔 데이터를 제공한다. 제8차 조사(2020~2023) 기준.

### 6.1 남성 주요 항목 통계 (20~39세)

| 항목 | 평균 | 표준편차 | 5th 백분위 | 95th 백분위 |
|------|------|---------|-----------|------------|
| 키 (cm) | 174.2 | 5.7 | 164.8 | 183.6 |
| 몸무게 (kg) | 74.1 | 12.3 | 55.2 | 95.0 |
| 가슴둘레 (cm) | 97.3 | 7.1 | 86.0 | 109.0 |
| 허리둘레 (cm) | 83.5 | 9.2 | 69.5 | 99.0 |
| 엉덩이둘레 (cm) | 97.1 | 5.8 | 88.0 | 106.5 |
| 어깨너비 (cm) | 44.2 | 2.4 | 40.2 | 48.2 |
| 팔길이 (cm) | 59.1 | 2.9 | 54.3 | 63.9 |
| 안쪽다리길이 (cm) | 78.5 | 4.0 | 72.0 | 85.0 |

### 6.2 여성 주요 항목 통계 (20~39세)

| 항목 | 평균 | 표준편차 | 5th 백분위 | 95th 백분위 |
|------|------|---------|-----------|------------|
| 키 (cm) | 161.5 | 5.3 | 152.8 | 170.2 |
| 몸무게 (kg) | 57.8 | 9.5 | 44.0 | 74.5 |
| 가슴둘레 (cm) | 87.2 | 6.8 | 76.5 | 98.5 |
| 허리둘레 (cm) | 71.8 | 8.1 | 60.0 | 86.0 |
| 엉덩이둘레 (cm) | 94.5 | 5.6 | 85.5 | 103.5 |
| 어깨너비 (cm) | 38.8 | 2.1 | 35.3 | 42.3 |

### 6.3 활용 시 유의사항

- Size Korea 원시 데이터는 [sizekorea.kr](https://sizekorea.kr) 에서 신청 후 이용 가능
- 3D 스캔 데이터(약 6,000명)는 PCA 학습, 회귀 모델 훈련에 직접 활용 가능
- 연령대별 체형 차이가 크므로 연령 세분화 필요 (20대 vs 40대 허리둘레 평균 약 10cm 차이)
- 측정 방법이 ISO 8559와 일부 다를 수 있으므로 정의 대조 필수

---

## 7. 검증 (Validation)

생성된 아바타가 입력 측정값을 충실히 재현하는지 확인하는 절차.

### 7.1 역측정 검증 (Round-trip Measurement)

```
입력 측정값 m → 아바타 생성 → 아바타 메시에서 측정값 m' 추출 → 오차 계산

오차 = |m - m'| / m × 100 (%)
```

메시에서 측정값을 추출하는 방법:

1. **둘레 측정:** 해당 높이의 수평 단면(cross-section)을 잘라 둘레 계산
2. **길이 측정:** 랜드마크 정점 간 직선 또는 표면 거리 계산
3. **키:** 메시 bounding box의 Y축 최대-최소값

### 7.2 허용 오차 기준

| 항목 | 허용 오차 | 근거 |
|------|----------|------|
| 키 | ±1 cm | 전역 스케일 직접 제어 가능 |
| 가슴둘레 | ±2 cm | 의류 허용 오차(KS K 0051) |
| 허리둘레 | ±2 cm | 의류 허용 오차 |
| 엉덩이둘레 | ±2 cm | 의류 허용 오차 |
| 어깨너비 | ±1.5 cm | 재킷 피팅 민감도 높음 |
| 팔길이 | ±1.5 cm | 소매길이 영향 |
| 안쪽다리길이 | ±1.5 cm | 바지길이 영향 |

### 7.3 검증 구현 예시

```javascript
/**
 * 아바타 메시에서 측정값을 역추출하여 입력과 비교한다.
 * @param {Object} mesh - 아바타 3D 메시 (정점, 면 데이터)
 * @param {Object} inputMeasurements - 원본 입력 측정값
 * @returns {Object} 항목별 오차율과 통과 여부
 */
function validateAvatar(mesh, inputMeasurements) {
  const TOLERANCE = {
    height: 1.0, chest: 2.0, waist: 2.0,
    hip: 2.0, shoulder: 1.5, armLength: 1.5, inseam: 1.5
  };

  const extracted = extractMeasurements(mesh); // 메시 → 측정값

  const results = {};
  for (const key of Object.keys(TOLERANCE)) {
    if (!inputMeasurements[key]) continue;
    const error = Math.abs(extracted[key] - inputMeasurements[key]);
    results[key] = {
      input: inputMeasurements[key],
      extracted: extracted[key],
      errorCm: error.toFixed(1),
      pass: error <= TOLERANCE[key]
    };
  }

  results.allPass = Object.values(results)
    .filter(v => typeof v === 'object')
    .every(v => v.pass);

  return results;
}
```

### 7.4 오차 초과 시 보정

역측정 오차가 허용 범위를 초과하면 반복 보정을 수행한다.

```
반복 보정 루프:
  1. shape coefficient β로 아바타 생성
  2. 아바타에서 측정값 m' 추출
  3. 잔차 Δm = m_target - m'
  4. β_new = β + W · normalize(Δm) × learning_rate
  5. |Δm| < 허용 오차 또는 최대 반복 횟수 도달 시 종료
```

보통 3~5회 반복으로 수렴한다.

---

## 8. 참고 자료

- ISO 8559-1:2017 — Size designation of clothes: Anthropometric definitions for body measurement
- KS K 0051 — 의류의 치수 체계 및 호칭
- Size Korea (sizekorea.kr) — 제8차 한국인 인체치수조사
- SMPL: A Skinned Multi-Person Linear Model (Loper et al., 2015)
- CAESAR (Civilian American and European Surface Anthropometry Resource) 데이터셋
