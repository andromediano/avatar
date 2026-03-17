# 의류 3D 모델링 파이프라인

가상 피팅 서비스에 사용되는 의류 3D 에셋의 제작, 최적화, 배포까지의 전체 워크플로우를 정리한다.

---

## 1. 프로덕션 파이프라인 개요

의류 에셋 하나가 서비스에 배포되기까지의 단계는 다음과 같다.

```
디자인 → 3D 모델링 → 리깅 → 텍스처링 → 익스포트 → 최적화 → 배포
```

| 단계 | 산출물 | 주요 도구 |
|------|--------|-----------|
| 디자인 | 2D 패턴, 테크팩 | Illustrator, CLO3D 패턴 에디터 |
| 3D 모델링 | 메시(.obj, .fbx) | CLO3D, Marvelous Designer, Blender |
| 리깅 | 스킨드 메시 + 블렌드셰이프 | Blender, Maya |
| 텍스처링 | PBR 텍스처 세트 | Substance Painter, Photoshop |
| 익스포트 | .glb 파일 | glTF exporter |
| 최적화 | 압축 텍스처, LOD | gltf-transform, KTX2 |
| 배포 | CDN URL | S3 + CloudFront |

---

## 2. 모델링 도구 비교

| 항목 | Blender | CLO3D | Marvelous Designer |
|------|---------|-------|---------------------|
| 가격 | 무료 (GPL) | 유료 (연 $500~) | 유료 (연 $300~) |
| 강점 | 범용 3D, 커스텀 파이프라인 구축 | 패션 산업 표준, 패턴 기반 시뮬레이션 | 직관적 드레이핑, 빠른 프로토타이핑 |
| 약점 | 의류 시뮬레이션 부재 | 높은 학습 곡선, 가격 | CLO3D 대비 기능 제한 |
| glTF 익스포트 | 네이티브 지원 | FBX → 변환 필요 | FBX → 변환 필요 |
| 추천 용도 | 리토폴로지, 리깅, 최종 최적화 | 패턴 기반 의류 제작 (메인) | 빠른 컨셉 모델링 |

**권장 워크플로우**: CLO3D로 패턴 기반 모델링 → Blender로 리토폴로지/리깅/익스포트

---

## 3. glTF/GLB 포맷

glTF(GL Transmission Format)는 웹 3D의 사실상 표준이다. three.js, Babylon.js, React Three Fiber 모두 네이티브 지원한다.

### 3.1 웹 표준인 이유

- Khronos Group 관리, 개방형 스펙
- JSON 기반 구조로 파싱이 빠름
- GPU 친화적 바이너리 데이터(GLB)
- PBR 머티리얼 내장 (metallic-roughness 모델)
- Draco/meshopt 메시 압축 지원

### 3.2 GLB 파일 구조

```
GLB (단일 바이너리)
├── meshes          # 정점, 인덱스, 노멀, UV
├── materials       # PBR 파라미터 + 텍스처 참조
├── textures        # baseColor, normal, roughness-metallic, occlusion
├── animations      # 스켈레탈 애니메이션 키프레임
├── morph targets   # 사이즈별 블렌드셰이프 (S/M/L/XL)
└── skins           # 본-메시 바인딩 정보
```

---

## 4. 폴리곤 카운트 가이드라인

과도한 폴리곤은 렌더링 성능을 직접적으로 저하시킨다.

| 플랫폼 | 삼각형 수 상한 (의류 1벌 기준) | 비고 |
|--------|-------------------------------|------|
| 모바일 | **< 10,000 tris** | iOS Safari, Android WebView 기준 |
| 데스크톱 | **< 50,000 tris** | dGPU 탑재 환경 기준 |

```
참고: 전신 아바타 + 의류 2벌 합산 시
- 모바일 총합 < 30K tris
- 데스크톱 총합 < 120K tris
```

LOD(Level of Detail) 단계별 목표:

| LOD | 삼각형 비율 | 사용 시점 |
|-----|------------|-----------|
| LOD0 | 100% | 클로즈업, 상세 뷰 |
| LOD1 | 50% | 전신 뷰 |
| LOD2 | 25% | 썸네일, 목록 뷰 |

---

## 5. UV 매핑 모범 사례

의류 UV 매핑은 일반 하드서피스와 다른 고려사항이 있다.

1. **심(seam) 위치**: 실제 봉제선과 UV 심을 일치시킨다. 텍스처 이음새가 자연스럽게 숨겨진다.
2. **텍셀 밀도 균일화**: Checker 패턴으로 전체 표면의 텍셀 밀도를 검증한다. 정면 상체 영역에 우선 배분.
3. **패딩**: UV 아일랜드 간 최소 4px 패딩 (1024 기준). 밉맵 블리딩 방지.
4. **직선 정렬**: 스트라이프, 격자 패턴 의류는 UV를 직교 정렬한다.
5. **대칭 활용**: 좌우 대칭 의류는 UV를 미러링하여 텍스처 공간을 절약한다.

```
UV 체크리스트:
☐ 심 위치가 봉제선과 일치하는가
☐ 텍셀 밀도가 균일한가
☐ 패딩이 충분한가 (4px @1024)
☐ 스트레칭 비율이 5% 이내인가
☐ 아일랜드가 0~1 UV 공간 안에 있는가
```

---

## 6. 텍스처 해상도 기준

| 플랫폼 | 해상도 | 포맷 | 용량 목표 |
|--------|--------|------|-----------|
| 모바일 | **1024 x 1024** | KTX2 (ETC1S) | < 256KB/장 |
| 데스크톱 | **2048 x 2048** | KTX2 (UASTC) | < 1MB/장 |

의류 1벌 기준 텍스처 세트:

| 맵 | 채널 | 설명 |
|----|-------|------|
| baseColor | RGB | 원단 색상/패턴 |
| normal | RGB | 원단 질감, 봉제선 디테일 |
| occlusionRoughnessMetallic | R/G/B | AO, roughness, metalness 팩킹 |

---

## 7. 원단별 PBR 머티리얼 프리셋

PBR metallic-roughness 모델 기준 값이다. 실제 원단 샘플과 비교하며 미세 조정한다.

| 원단 | Roughness | Metalness | Normal 강도 | 비고 |
|------|-----------|-----------|-------------|------|
| **면 (Cotton)** | 0.85 ~ 0.95 | 0.0 | 0.8 | 거친 표면, 완전 비금속 |
| **데님 (Denim)** | 0.80 ~ 0.90 | 0.0 | 1.0 | 트윌 직조 패턴을 노멀맵에 반영 |
| **실크 (Silk)** | 0.30 ~ 0.45 | 0.0 | 0.4 | 높은 광택, 부드러운 노멀 |
| **가죽 (Leather)** | 0.50 ~ 0.70 | 0.0 | 0.9 | 그레인 텍스처 중요 |
| **니트 (Knit)** | 0.85 ~ 1.00 | 0.0 | 1.2 | 루프 구조를 노멀맵으로 표현 |

```json
// 예시: 데님 머티리얼 (glTF pbrMetallicRoughness)
{
  "pbrMetallicRoughness": {
    "baseColorFactor": [0.15, 0.18, 0.35, 1.0],
    "metallicFactor": 0.0,
    "roughnessFactor": 0.85
  },
  "normalTexture": {
    "index": 1,
    "scale": 1.0
  },
  "doubleSided": true
}
```

---

## 8. 의류 리깅

### 8.1 스켈레톤 스키닝

의류 메시를 인체 스켈레톤에 바인딩하여 포즈 변화에 따라 변형시킨다.

- **본 구조**: 인체 스켈레톤(65~80 본)을 그대로 사용한다. 의류 전용 보조 본은 최소화.
- **웨이트 페인팅**: 관절 부위(어깨, 팔꿈치, 무릎)에 집중. 자동 웨이트 후 수동 보정.
- **최대 영향 본**: 정점당 4개 (glTF 스펙 제한, `JOINTS_0` + `WEIGHTS_0`)

### 8.2 블렌드셰이프 (Morph Targets)

사이즈 변형을 블렌드셰이프로 처리한다.

```
기본 메시: M 사이즈 (기준)

Morph Targets:
  target[0]: "size_S"    weight -1.0 → S
  target[1]: "size_L"    weight +1.0 → L
  target[2]: "size_XL"   weight +2.0 → XL
  target[3]: "fit_slim"  weight  0~1 → 슬림핏 보정
  target[4]: "fit_loose" weight  0~1 → 루즈핏 보정
```

런타임에서 사용자 신체 치수에 따라 weight를 보간한다.

---

## 9. 에셋 관리 및 배포

### 9.1 CDN 호스팅

```
S3 버킷 구조:
s3://vfit-assets/
├── garments/
│   ├── {garment_id}/
│   │   ├── model_lod0.glb      # 고해상도
│   │   ├── model_lod1.glb      # 중해상도
│   │   ├── model_lod2.glb      # 저해상도
│   │   ├── thumbnail.webp       # 목록용 썸네일
│   │   └── metadata.json        # 사이즈, 카테고리, PBR 파라미터
```

CloudFront 배포 시 `Cache-Control: public, max-age=31536000, immutable` 설정. 파일명에 해시를 포함하여 캐시 무효화.

### 9.2 Lazy Loading

```typescript
// 뷰포트 진입 시 로드
const loader = new GLTFLoader();
loader.setKTX2Loader(ktx2Loader);
loader.setMeshoptDecoder(MeshoptDecoder);

async function loadGarment(id: string, lod: number) {
  const url = `${CDN_BASE}/garments/${id}/model_lod${lod}.glb`;
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}
```

### 9.3 KTX2 텍스처 압축

```bash
# toktx를 이용한 KTX2 변환
# 모바일용 (ETC1S)
toktx --t2 --encode etc1s --clevel 2 \
  output_mobile.ktx2 input.png

# 데스크톱용 (UASTC)
toktx --t2 --encode uastc --uastc_quality 3 \
  output_desktop.ktx2 input.png
```

KTX2는 GPU에서 직접 디코딩 가능하여 VRAM 사용량을 1/4~1/6로 절감한다.

---

## 10. 비용 및 소요 시간 추정

의류 카테고리별 에셋 1벌 제작 기준이다.

| 카테고리 | 모델링 | 리깅 | 텍스처링 | 최적화/QA | 총 소요 | 예상 비용 |
|----------|--------|------|----------|-----------|---------|-----------|
| 티셔츠 (단순) | 4h | 2h | 3h | 2h | **11h** | $300~500 |
| 셔츠 (단추, 칼라) | 8h | 3h | 4h | 2h | **17h** | $500~800 |
| 자켓 (아우터) | 12h | 4h | 6h | 3h | **25h** | $800~1,200 |
| 바지 (데님) | 6h | 3h | 4h | 2h | **15h** | $400~700 |
| 원피스 (드레스) | 10h | 4h | 5h | 3h | **22h** | $700~1,000 |

```
비용 산정 기준:
- 3D 아티스트 시급: $30~50 (프리랜서 기준)
- 반복 제작 시 템플릿 활용으로 30~50% 시간 단축 가능
- 대량 발주 시 벌당 단가 20~30% 할인 협상 가능
```

---

## 참고 사항

- 모든 에셋은 glTF Validator(https://github.com/KhronosGroup/glTF-Validator)로 검증 후 배포한다.
- `gltf-transform`(https://gltf-transform.dev)으로 메시 압축(meshopt), 텍스처 리사이즈, 미사용 노드 제거를 자동화한다.
- 에셋 버전 관리는 S3 버저닝 + metadata.json 내 `version` 필드로 운영한다.
