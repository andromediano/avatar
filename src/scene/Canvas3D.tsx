import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { SceneLights } from './SceneLights'
import { AvatarModel } from './AvatarModel'
import { GarmentModel } from './GarmentModel'
import { useSceneStore } from '../store/sceneStore'

export function Canvas3D() {
  const currentGarment = useSceneStore((s) => s.currentGarment)

  return (
    <Canvas
      camera={{ position: [0, 1.2, 3], fov: 45, near: 0.1, far: 100 }}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <SceneLights />
        <Environment preset="studio" />
        <Grid
          args={[10, 10]}
          cellColor="#cccccc"
          sectionColor="#e0e0e0"
          fadeDistance={20}
          position={[0, 0, 0]}
        />
        <AvatarModel />
        {currentGarment && <GarmentModel url={currentGarment.modelUrl} />}
        <OrbitControls
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Suspense>
    </Canvas>
  )
}
