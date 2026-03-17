interface GarmentItem {
  id: string
  label: string
  thumb: string
}

interface Props {
  garment: GarmentItem
  selected: boolean
  onSelect: (id: string) => void
}

export function GarmentCard({ garment, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(garment.id)}
      style={{
        padding: 8,
        border: selected ? '2px solid #3b82f6' : '1px solid #ddd',
        borderRadius: 8,
        background: selected ? '#eff6ff' : '#fff',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <img
        src={garment.thumb}
        alt={garment.label}
        style={{ width: '100%', display: 'block' }}
      />
      <div style={{ fontSize: 12, marginTop: 4 }}>{garment.label}</div>
    </button>
  )
}
