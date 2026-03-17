/**
 * Web Crypto API 기반 AES-GCM 암호화.
 * IndexedDB에 민감 데이터(신체 치수) 저장 시 사용.
 */

const ALGO = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGO, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  )
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bufferToBase64(raw)
}

export async function importKey(base64: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(base64)
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, true, [
    'encrypt',
    'decrypt',
  ])
}

export async function encrypt(
  key: CryptoKey,
  plaintext: string,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encoded,
  )

  // iv + ciphertext를 결합하여 base64로 인코딩
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return bufferToBase64(combined.buffer)
}

export async function decrypt(
  key: CryptoKey,
  encrypted: string,
): Promise<string> {
  const combined = new Uint8Array(base64ToBuffer(encrypted))
  const iv = combined.slice(0, IV_LENGTH)
  const ciphertext = combined.slice(IV_LENGTH)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    key,
    ciphertext,
  )

  return new TextDecoder().decode(decrypted)
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
