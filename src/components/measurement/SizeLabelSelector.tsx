import { useState } from 'react'
import type { Gender } from '../../types/measurement'

interface Props {
  onSelect: (gender: Gender, sizeLabel: number) => void
}

const MALE_SIZES = [
  { label: 85, letter: 'XS' },
  { label: 90, letter: 'S' },
  { label: 95, letter: 'M' },
  { label: 100, letter: 'L' },
  { label: 105, letter: 'XL' },
  { label: 110, letter: 'XXL' },
]

const FEMALE_SIZES = [
  { label: 80, letter: 'XS' },
  { label: 85, letter: 'S' },
  { label: 90, letter: 'M' },
  { label: 95, letter: 'L' },
  { label: 100, letter: 'XL' },
]

export function SizeLabelSelector({ onSelect }: Props) {
  const [gender, setGender] = useState<Gender>('M')
  const sizes = gender === 'M' ? MALE_SIZES : FEMALE_SIZES

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label>
          <input
            type="radio"
            name="gender"
            value="M"
            checked={gender === 'M'}
            onChange={() => setGender('M')}
          />
          남성
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="F"
            checked={gender === 'F'}
            onChange={() => setGender('F')}
          />
          여성
        </label>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {sizes.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(gender, s.label)}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer',
              background: '#fff',
            }}
          >
            {s.label} ({s.letter})
          </button>
        ))}
      </div>
    </div>
  )
}
