import { GarmentCard } from './GarmentCard'

interface GarmentItem {
  id: string
  label: string
  thumb: string
}

interface Props {
  garments: GarmentItem[]
  selected: string
  onSelect: (id: string) => void
}

export function GarmentCatalog({ garments, selected, onSelect }: Props) {
  if (garments.length === 0) {
    return <p style={{ color: '#999', fontSize: 14 }}>등록된 의류가 없습니다</p>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {garments.map((g) => (
        <GarmentCard
          key={g.id}
          garment={g}
          selected={selected === g.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
