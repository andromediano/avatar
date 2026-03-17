import type { BodyMeasurements } from '../../store/sceneStore'

interface Props {
  values: BodyMeasurements
  onChange: (values: BodyMeasurements) => void
}

const LABELS: Record<keyof BodyMeasurements, string> = {
  height: '키',
  chest: '가슴둘레',
  waist: '허리둘레',
  hip: '엉덩이둘레',
  shoulder: '어깨너비',
  armLength: '팔길이',
  legLength: '다리길이',
  weight: '체중',
}

export function SliderForm({ values, onChange }: Props) {
  function handleChange(key: keyof BodyMeasurements, raw: string) {
    const num = Math.min(1, Math.max(0, parseFloat(raw) || 0))
    onChange({ ...values, [key]: num })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(Object.keys(LABELS) as (keyof BodyMeasurements)[]).map((key) => (
        <label
          key={key}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{LABELS[key]}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ width: 160 }}
          />
        </label>
      ))}
    </div>
  )
}
