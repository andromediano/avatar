import * as THREE from 'three'

/**
 * 3단계 LOD를 생성한다.
 * @param highPoly 0~3m 거리
 * @param midPoly 3~6m 거리
 * @param lowPoly 6m 이상
 */
export function createLOD(
  highPoly: THREE.Object3D,
  midPoly: THREE.Object3D,
  lowPoly: THREE.Object3D,
): THREE.LOD {
  const lod = new THREE.LOD()
  lod.addLevel(highPoly, 0)
  lod.addLevel(midPoly, 3)
  lod.addLevel(lowPoly, 6)
  return lod
}
