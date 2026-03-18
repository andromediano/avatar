import { useSceneStore } from '../../store/sceneStore'
import { useUiStore } from '../../store/uiStore'
import { SliderForm } from './SliderForm'
import { SizeLabelSelector } from './SizeLabelSelector'
import { PhotoEstimator } from './PhotoEstimator'
import { lookupSizeLabel } from '../../measurement/sizeTable'
import { normalizeMeasurements } from '../../measurement/normalize'
import type { InputMode, Gender } from '../../types/measurement'

const TABS: { mode: InputMode; label: string }[] = [
  { mode: 'slider', label: '슬라이더' },
  { mode: 'size', label: '사이즈 선택' },
  { mode: 'photo', label: '사진 추정' },
]

export function MeasurementPanel() {
  const { bodyParams, updateBodyParams } = useSceneStore()
  const { inputMode, setInputMode } = useUiStore()

  function handleSizeSelect(gender: Gender, sizeLabel: number) {
    const entry = lookupSizeLabel(gender, sizeLabel)
    if (!entry) return

    const normalized = normalizeMeasurements(
      {
        height: entry.height,
        chest: entry.chest,
        waist: entry.waist,
        hip: entry.hip,
        shoulder: entry.shoulder,
        armLength: entry.armLength,
        weight: entry.weight,
      },
      gender,
    )
    updateBodyParams(normalized)
  }

  function handlePhotoResult(params: Record<string, number>) {
    updateBodyParams(params)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setInputMode(tab.mode)}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #ddd',
              borderRadius: 6,
              background: inputMode === tab.mode ? '#3b82f6' : '#fff',
              color: inputMode === tab.mode ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {inputMode === 'slider' && (
        <SliderForm values={bodyParams} onChange={updateBodyParams} />
      )}
      {inputMode === 'size' && (
        <SizeLabelSelector onSelect={handleSizeSelect} />
      )}
      {inputMode === 'photo' && (
        <PhotoEstimator onResult={handlePhotoResult} />
      )}
    </div>
  )
}
