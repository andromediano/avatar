#!/bin/bash
# glTF 에셋 최적화 파이프라인
# 사용법: ./scripts/optimize-assets.sh input.glb output.glb

set -euo pipefail

INPUT="${1:?Usage: $0 input.glb output.glb}"
OUTPUT="${2:?Usage: $0 input.glb output.glb}"

echo "=== glTF 에셋 최적화 ==="
echo "입력: $INPUT"
echo "출력: $OUTPUT"

# gltf-transform CLI 확인
if ! command -v npx &> /dev/null; then
  echo "npx가 필요합니다."
  exit 1
fi

echo ""
echo "1/5 중복 데이터 제거 (dedup)..."
npx @gltf-transform/cli dedup "$INPUT" /tmp/opt_1.glb

echo "2/5 Draco 메시 압축..."
npx @gltf-transform/cli draco /tmp/opt_1.glb /tmp/opt_2.glb

echo "3/5 텍스처 리사이즈 (max 1024px)..."
npx @gltf-transform/cli resize /tmp/opt_2.glb /tmp/opt_3.glb --width 1024 --height 1024

echo "4/5 미사용 리소스 제거 (prune)..."
npx @gltf-transform/cli prune /tmp/opt_3.glb "$OUTPUT"

echo "5/5 정리..."
rm -f /tmp/opt_1.glb /tmp/opt_2.glb /tmp/opt_3.glb

# 크기 비교
INPUT_SIZE=$(wc -c < "$INPUT" | tr -d ' ')
OUTPUT_SIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
RATIO=$(echo "scale=1; ($INPUT_SIZE - $OUTPUT_SIZE) * 100 / $INPUT_SIZE" | bc)

echo ""
echo "=== 완료 ==="
echo "입력 크기: $(numfmt --to=iec $INPUT_SIZE 2>/dev/null || echo "${INPUT_SIZE}B")"
echo "출력 크기: $(numfmt --to=iec $OUTPUT_SIZE 2>/dev/null || echo "${OUTPUT_SIZE}B")"
echo "절감률: ${RATIO}%"
