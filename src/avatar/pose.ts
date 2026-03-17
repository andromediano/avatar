import * as THREE from 'three'

/**
 * T-Pose 스켈레톤을 A-Pose로 변환한다.
 * 자연스러운 착장 시뮬레이션을 위한 기본 포즈.
 */
export function applyAPose(skeleton: THREE.Skeleton): void {
  const leftUpperArm = skeleton.getBoneByName('LeftUpperArm')
  const rightUpperArm = skeleton.getBoneByName('RightUpperArm')

  if (leftUpperArm) {
    leftUpperArm.rotation.z = THREE.MathUtils.degToRad(30)
  }
  if (rightUpperArm) {
    rightUpperArm.rotation.z = THREE.MathUtils.degToRad(-30)
  }
}
