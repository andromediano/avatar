import { useState } from 'react'
import { MeasurementPanel } from '../measurement/MeasurementPanel'
import { GarmentCatalog } from '../garment/GarmentCatalog'
import { ColorPicker } from '../garment/ColorPicker'
import { useSceneStore } from '../../store/sceneStore'

const DEMO_GARMENTS = [
  { id: 'tshirt_basic', label: '기본 티셔츠', thumb: '/thumbs/tshirt.png' },
  { id: 'hoodie_zip', label: '집업 후디', thumb: '/thumbs/hoodie.png' },
  { id: 'pants_slim', label: '슬림 팬츠', thumb: '/thumbs/pants.png' },
  { id: 'jacket_bomber', label: '봄버 재킷', thumb: '/thumbs/jacket.png' },
]

export function SidePanel() {
  const { currentGarment, garmentColor, loadGarment, setGarmentColor } =
    useSceneStore()
  const [selectedId, setSelectedId] = useState(currentGarment?.id ?? '')

  function handleGarmentSelect(id: string) {
    setSelectedId(id)
    const item = DEMO_GARMENTS.find((g) => g.id === id)
    if (item) {
      loadGarment({
        id: item.id,
        name: item.label,
        modelUrl: `/models/garments/${item.id}.glb`,
      })
    }
  }

  return (
    <aside
      style={{
        width: 320,
        padding: 16,
        overflowY: 'auto',
        borderLeft: '1px solid #e5e7eb',
        background: '#fafafa',
      }}
    >
      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>체형 설정</h2>
      <MeasurementPanel />

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>의류 선택</h2>
      <GarmentCatalog
        garments={DEMO_GARMENTS}
        selected={selectedId}
        onSelect={handleGarmentSelect}
      />

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

      <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>색상</h2>
      <ColorPicker color={garmentColor} onChange={setGarmentColor} />
    </aside>
  )
}
