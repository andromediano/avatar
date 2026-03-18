import { useRef, useState } from 'react'

interface Props {
  onResult: (params: Record<string, number>) => void
}

export function PhotoEstimator({ onResult: _onResult }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [_status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreview(url)
    setStatus('loading')

    // MediaPipe Pose 추정은 별도 모듈에서 처리
    // 현재는 placeholder
    setStatus('done')
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        전신이 보이는 사진을 업로드해주세요. MediaPipe Pose로 신체 치수를 추정합니다.
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 13 }}>
          키 (cm, 참조값):
          <input
            type="number"
            placeholder="175"
            min={140}
            max={200}
            style={{ marginLeft: 8, width: 80, padding: '4px 8px' }}
          />
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: 8,
          cursor: 'pointer',
          background: '#fff',
        }}
      >
        정면 사진 업로드
      </button>

      {preview && (
        <div style={{ marginTop: 8 }}>
          <img
            src={preview}
            alt="업로드된 사진"
            style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  )
}
