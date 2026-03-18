interface FittingRecord {
  id: string
  garmentName: string
  timestamp: number
  thumbnail?: string
}

interface Props {
  records: FittingRecord[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FittingHistory({ records, onRestore, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <p style={{ color: '#999', fontSize: 14 }}>
        저장된 피팅 기록이 없습니다
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {records.map((r) => (
        <div
          key={r.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 8,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        >
          {r.thumbnail && (
            <img
              src={r.thumbnail}
              alt={r.garmentName}
              style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{r.garmentName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {formatDate(r.timestamp)}
            </div>
          </div>
          <button
            onClick={() => onRestore(r.id)}
            style={{ fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
          >
            복원
          </button>
          <button
            onClick={() => onDelete(r.id)}
            style={{
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 8px',
              color: '#ef4444',
            }}
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  )
}
