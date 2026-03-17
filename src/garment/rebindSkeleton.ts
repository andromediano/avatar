import * as THREE from 'three'

export interface RebindResult {
  matchedCount: number
  unmatchedBones: string[]
}

/**
 * 의류 메시의 스켈레톤을 아바타 스켈레톤으로 교체한다.
 * 본 이름 기준 매칭 후, skinIndex 버퍼를 리매핑한다.
 */
export function rebindToAvatarSkeleton(
  garmentMesh: THREE.SkinnedMesh,
  avatarSkeleton: THREE.Skeleton,
): RebindResult {
  const garmentSkeleton = garmentMesh.skeleton

  // Avatar 본 이름 → 인덱스 매핑
  const avatarBonesByName = new Map<string, number>()
  avatarSkeleton.bones.forEach((bone, idx) => {
    avatarBonesByName.set(bone.name, idx)
  })

  // 본 인덱스 리매핑 테이블
  const remap = new Map<number, number>()
  const unmatchedBones: string[] = []

  garmentSkeleton.bones.forEach((bone, gIdx) => {
    const aIdx = avatarBonesByName.get(bone.name)
    if (aIdx !== undefined) {
      remap.set(gIdx, aIdx)
    } else {
      unmatchedBones.push(bone.name)
      console.warn(`[Garment] 매칭 실패 본: ${bone.name}`)
    }
  })

  // skinIndex 버퍼 업데이트
  const skinIndexAttr = garmentMesh.geometry.getAttribute('skinIndex')
  if (skinIndexAttr) {
    const arr = skinIndexAttr.array as Uint16Array
    for (let i = 0; i < arr.length; i++) {
      const newIdx = remap.get(arr[i])
      if (newIdx !== undefined) {
        arr[i] = newIdx
      }
    }
    skinIndexAttr.needsUpdate = true
  }

  // 스켈레톤 교체
  garmentMesh.skeleton = avatarSkeleton
  garmentMesh.bind(avatarSkeleton)

  return {
    matchedCount: remap.size,
    unmatchedBones,
  }
}
