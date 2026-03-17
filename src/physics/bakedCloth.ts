import type * as THREE from 'three'

export interface BakedClothHandle {
  tick: () => void
  start: () => void
  stop: () => void
}

/**
 * Blender에서 시뮬레이션 결과를 프레임별 Shape Key로 베이크한 glTF를 재생한다.
 * 실시간 물리 연산 없이 유사한 시각 효과를 낸다.
 */
export function playBakedClothAnimation(
  mesh: THREE.SkinnedMesh,
  fps = 30,
): BakedClothHandle {
  if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) {
    throw new Error('morph target이 없는 메시입니다.')
  }

  const frameCount = mesh.morphTargetInfluences.length
  let currentFrame = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  function tick() {
    if (!mesh.morphTargetInfluences) return
    mesh.morphTargetInfluences.fill(0)
    mesh.morphTargetInfluences[currentFrame] = 1.0
    currentFrame = (currentFrame + 1) % frameCount
  }

  function start() {
    stop()
    intervalId = setInterval(tick, 1000 / fps)
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { tick, start, stop }
}
