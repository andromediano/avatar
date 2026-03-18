import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { createBodyParamController } from '../avatar/bodyParams'
import { applyAPose } from '../avatar/pose'
import { useSceneStore } from '../store/sceneStore'

interface Props {
  url?: string
}

export function AvatarModel({ url = '/models/avatar_base.glb' }: Props) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)
  const bodyParams = useSceneStore((s) => s.bodyParams)

  useEffect(() => {
    if (!groupRef.current) return

    const morphMeshes: THREE.SkinnedMesh[] = []
    let skeleton: THREE.Skeleton | null = null

    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.frustumCulled = false
        if (child.morphTargetDictionary) {
          morphMeshes.push(child)
        }
        if (!skeleton && child.skeleton) {
          skeleton = child.skeleton
        }
      }
    })

    if (skeleton) {
      applyAPose(skeleton)
    }

    const controller = createBodyParamController(morphMeshes)
    controller.setAllParams(bodyParams as unknown as Record<string, number>)
  }, [scene, bodyParams])

  return <primitive ref={groupRef} object={scene} />
}
