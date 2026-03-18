export const LIGHT_CONFIG = {
  ambient: { intensity: 0.6, color: 0xffffff },
  directional: {
    intensity: 1.2,
    color: 0xffffff,
    position: [2, 4, 3] as [number, number, number],
    castShadow: true,
  },
  hemisphere: {
    skyColor: 0xbde0fe,
    groundColor: 0x444444,
    intensity: 0.4,
  },
}

export function SceneLights() {
  return (
    <>
      <ambientLight
        intensity={LIGHT_CONFIG.ambient.intensity}
        color={LIGHT_CONFIG.ambient.color}
      />
      <directionalLight
        intensity={LIGHT_CONFIG.directional.intensity}
        color={LIGHT_CONFIG.directional.color}
        position={LIGHT_CONFIG.directional.position}
        castShadow={LIGHT_CONFIG.directional.castShadow}
      />
      <hemisphereLight
        args={[
          LIGHT_CONFIG.hemisphere.skyColor,
          LIGHT_CONFIG.hemisphere.groundColor,
          LIGHT_CONFIG.hemisphere.intensity,
        ]}
      />
    </>
  )
}
