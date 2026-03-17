import { COLOR_PRESETS } from '../../garment/garmentColor'

interface Props {
  color: string
  onChange: (color: string) => void
}

export function ColorPicker({ color, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {COLOR_PRESETS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          aria-label={c}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: c,
            border: color === c ? '3px solid #000' : '1px solid #ccc',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      ))}
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 32, height: 32, padding: 0, border: 'none' }}
      />
    </div>
  )
}
