import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { applyGarmentColor } from '../garment/garmentColor'
import { useSceneStore } from '../store/sceneStore'

interface Props {
  url: string
}

export function GarmentModel({ url }: Props) {
  const { scene } = useGLTF(url)
  const garmentColor = useSceneStore((s) => s.garmentColor)

  const meshes = useMemo(() => {
    const list: THREE.Mesh[] = []
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.frustumCulled = false
        list.push(child)
      }
    })
    return list
  }, [scene])

  useEffect(() => {
    applyGarmentColor(meshes, garmentColor)
  }, [meshes, garmentColor])

  return <primitive object={scene} />
}
