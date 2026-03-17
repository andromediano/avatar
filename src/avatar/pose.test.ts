import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { applyAPose } from './pose'

function createSkeleton(): THREE.Skeleton {
  const hips = new THREE.Bone()
  hips.name = 'Hips'
  const leftUpperArm = new THREE.Bone()
  leftUpperArm.name = 'LeftUpperArm'
  const rightUpperArm = new THREE.Bone()
  rightUpperArm.name = 'RightUpperArm'

  hips.add(leftUpperArm)
  hips.add(rightUpperArm)

  return new THREE.Skeleton([hips, leftUpperArm, rightUpperArm])
}

describe('Feature 02: A-Pose 적용', () => {
  it('LeftUpperArm을 Z축으로 +30° 회전한다', () => {
    const skeleton = createSkeleton()
    applyAPose(skeleton)

    const left = skeleton.getBoneByName('LeftUpperArm')!
    expect(left.rotation.z).toBeCloseTo(THREE.MathUtils.degToRad(30))
  })

  it('RightUpperArm을 Z축으로 -30° 회전한다', () => {
    const skeleton = createSkeleton()
    applyAPose(skeleton)

    const right = skeleton.getBoneByName('RightUpperArm')!
    expect(right.rotation.z).toBeCloseTo(THREE.MathUtils.degToRad(-30))
  })

  it('본이 없어도 에러가 발생하지 않는다', () => {
    const emptySkeleton = new THREE.Skeleton([])
    expect(() => applyAPose(emptySkeleton)).not.toThrow()
  })
})
