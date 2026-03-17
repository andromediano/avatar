import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, generateKey, exportKey, importKey } from './crypto'

describe('암호화 유틸 (AES-GCM)', () => {
  describe('Scenario: 암호화/복호화 라운드트립', () => {
    it('데이터를 암호화 후 복호화하면 원본과 동일하다', async () => {
      const key = await generateKey()
      const original = '{"height":175,"chest":95}'

      const encrypted = await encrypt(key, original)
      expect(encrypted).not.toBe(original)

      const decrypted = await decrypt(key, encrypted)
      expect(decrypted).toBe(original)
    })

    it('JSON 객체를 암호화/복호화할 수 있다', async () => {
      const key = await generateKey()
      const data = { height: 175, chest: 95, waist: 80 }
      const original = JSON.stringify(data)

      const encrypted = await encrypt(key, original)
      const decrypted = await decrypt(key, encrypted)

      expect(JSON.parse(decrypted)).toEqual(data)
    })
  })

  describe('Scenario: 키 내보내기/가져오기', () => {
    it('키를 내보내고 다시 가져올 수 있다', async () => {
      const key = await generateKey()
      const exported = await exportKey(key)

      expect(typeof exported).toBe('string')
      expect(exported.length).toBeGreaterThan(0)

      const imported = await importKey(exported)
      const testData = 'test data'

      const encrypted = await encrypt(key, testData)
      const decrypted = await decrypt(imported, encrypted)
      expect(decrypted).toBe(testData)
    })
  })

  describe('Scenario: 잘못된 키로 복호화 실패', () => {
    it('다른 키로 복호화하면 에러가 발생한다', async () => {
      const key1 = await generateKey()
      const key2 = await generateKey()

      const encrypted = await encrypt(key1, 'secret')

      await expect(decrypt(key2, encrypted)).rejects.toThrow()
    })
  })
})
