import { describe, it, expect } from 'vitest'
import {
  estimateFromLandmarks,
  calculateEllipseCircumference,
  type PoseLandmark,
} from './photoEstimation'

// MediaPipe Pose 33 keypoints 중 필요한 것만 mock
function createMockLandmarks(): PoseLandmark[] {
  // 간략화된 mock: 33개 keypoint (정면 기준 정규화 좌표)
  const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0.99,
  }))

  // 주요 키포인트 위치 설정 (정규화 좌표 0~1)
  // 11: left shoulder, 12: right shoulder
  landmarks[11] = { x: 0.4, y: 0.35, z: 0, visibility: 0.99 }
  landmarks[12] = { x: 0.6, y: 0.35, z: 0, visibility: 0.99 }

  // 13: left elbow, 14: right elbow
  landmarks[13] = { x: 0.25, y: 0.5, z: 0, visibility: 0.99 }
  landmarks[14] = { x: 0.75, y: 0.5, z: 0, visibility: 0.99 }

  // 15: left wrist, 16: right wrist
  landmarks[15] = { x: 0.2, y: 0.65, z: 0, visibility: 0.99 }
  landmarks[16] = { x: 0.8, y: 0.65, z: 0, visibility: 0.99 }

  // 23: left hip, 24: right hip
  landmarks[23] = { x: 0.4, y: 0.6, z: 0, visibility: 0.99 }
  landmarks[24] = { x: 0.6, y: 0.6, z: 0, visibility: 0.99 }

  // 25: left knee, 26: right knee
  landmarks[25] = { x: 0.4, y: 0.75, z: 0, visibility: 0.99 }
  landmarks[26] = { x: 0.6, y: 0.75, z: 0, visibility: 0.99 }

  // 27: left ankle, 28: right ankle
  landmarks[27] = { x: 0.4, y: 0.9, z: 0, visibility: 0.99 }
  landmarks[28] = { x: 0.6, y: 0.9, z: 0, visibility: 0.99 }

  // 0: nose (머리 위치)
  landmarks[0] = { x: 0.5, y: 0.15, z: 0, visibility: 0.99 }

  return landmarks
}

describe('Feature 03: 사진 기반 신체 추정', () => {
  describe('calculateEllipseCircumference', () => {
    it('원형일 때 2πr에 가까운 값을 반환한다', () => {
      const c = calculateEllipseCircumference(10, 10)
      expect(c).toBeCloseTo(2 * Math.PI * 10, 0)
    })

    it('타원일 때 합리적인 둘레를 반환한다', () => {
      const c = calculateEllipseCircumference(15, 10)
      expect(c).toBeGreaterThan(2 * Math.PI * 10) // 원보다 큼
      expect(c).toBeLessThan(2 * Math.PI * 15)
    })
  })

  describe('estimateFromLandmarks', () => {
    it('키포인트와 참조 키로부터 치수를 추정한다', () => {
      const landmarks = createMockLandmarks()
      const result = estimateFromLandmarks(landmarks, 175)

      expect(result).toBeDefined()
      expect(result.shoulderWidth).toBeGreaterThan(0)
      expect(result.armLength).toBeGreaterThan(0)
      expect(result.legLength).toBeGreaterThan(0)
    })

    it('어깨너비가 합리적인 범위이다 (30~55cm)', () => {
      const landmarks = createMockLandmarks()
      const result = estimateFromLandmarks(landmarks, 175)

      expect(result.shoulderWidth).toBeGreaterThan(30)
      expect(result.shoulderWidth).toBeLessThan(55)
    })

    it('키포인트 visibility가 낮으면 해당 항목이 undefined이다', () => {
      const landmarks = createMockLandmarks()
      // 발목 visibility를 낮게 설정
      landmarks[27].visibility = 0.1
      landmarks[28].visibility = 0.1

      const result = estimateFromLandmarks(landmarks, 175)

      expect(result.legLength).toBeUndefined()
    })
  })
})
