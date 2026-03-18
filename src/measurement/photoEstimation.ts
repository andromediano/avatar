/**
 * MediaPipe Pose 키포인트로부터 신체 치수를 추정한다.
 * 정면 사진 + 참조 키(cm)를 사용한다.
 *
 * MediaPipe Pose landmark 인덱스:
 *  0: nose, 11: left shoulder, 12: right shoulder
 * 13: left elbow, 14: right elbow, 15: left wrist, 16: right wrist
 * 23: left hip, 24: right hip, 25: left knee, 26: right knee
 * 27: left ankle, 28: right ankle
 */

export interface PoseLandmark {
  x: number // 정규화 좌표 (0~1)
  y: number
  z: number
  visibility: number
}

export interface EstimatedMeasurements {
  shoulderWidth?: number
  armLength?: number
  legLength?: number
  hipWidth?: number
  torsoLength?: number
}

const VISIBILITY_THRESHOLD = 0.5

function dist2d(a: PoseLandmark, b: PoseLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function isVisible(...landmarks: PoseLandmark[]): boolean {
  return landmarks.every((l) => l.visibility >= VISIBILITY_THRESHOLD)
}

/**
 * Ramanujan의 타원 둘레 근사 공식.
 * 정면 폭(a)과 측면 깊이(b)로 둘레를 추정한다.
 */
export function calculateEllipseCircumference(a: number, b: number): number {
  const h = ((a - b) / (a + b)) ** 2
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
}

/**
 * MediaPipe Pose 키포인트 + 참조 키(cm)로 신체 치수를 추정한다.
 *
 * 추정 방법:
 * 1. 머리꼭대기~발바닥 간 정규화 거리 = pixelHeight
 * 2. cmPerPixel = referenceHeightCm / pixelHeight
 * 3. 각 키포인트 간 정규화 거리 × cmPerPixel = 실제 cm
 */
export function estimateFromLandmarks(
  landmarks: PoseLandmark[],
  referenceHeightCm: number,
): EstimatedMeasurements {
  const nose = landmarks[0]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftElbow = landmarks[13]
  const rightElbow = landmarks[14]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  const leftHip = landmarks[23]
  const rightHip = landmarks[24]
  const leftKnee = landmarks[25]
  const rightKnee = landmarks[26]
  const leftAnkle = landmarks[27]
  const rightAnkle = landmarks[28]

  // 전신 높이: nose y ~ ankle y (근사)
  // 실제로는 머리 위 + 발 아래 여백을 보정해야 하지만 간이 추정
  const headTop = nose.y - 0.05 // 머리 위 여백 근사
  const footBottom = Math.max(leftAnkle.y, rightAnkle.y) + 0.02
  const pixelHeight = footBottom - headTop

  if (pixelHeight <= 0) return {}

  const cmPerPixel = referenceHeightCm / pixelHeight
  const result: EstimatedMeasurements = {}

  // 어깨너비
  if (isVisible(leftShoulder, rightShoulder)) {
    result.shoulderWidth = dist2d(leftShoulder, rightShoulder) * cmPerPixel
  }

  // 팔길이 (좌측: 어깨→팔꿈치→손목)
  if (isVisible(leftShoulder, leftElbow, leftWrist)) {
    const upperArm = dist2d(leftShoulder, leftElbow)
    const forearm = dist2d(leftElbow, leftWrist)
    result.armLength = (upperArm + forearm) * cmPerPixel
  } else if (isVisible(rightShoulder, rightElbow, rightWrist)) {
    const upperArm = dist2d(rightShoulder, rightElbow)
    const forearm = dist2d(rightElbow, rightWrist)
    result.armLength = (upperArm + forearm) * cmPerPixel
  }

  // 다리길이 (좌측: 골반→무릎→발목)
  if (isVisible(leftHip, leftKnee, leftAnkle)) {
    const thigh = dist2d(leftHip, leftKnee)
    const shin = dist2d(leftKnee, leftAnkle)
    result.legLength = (thigh + shin) * cmPerPixel
  } else if (isVisible(rightHip, rightKnee, rightAnkle)) {
    const thigh = dist2d(rightHip, rightKnee)
    const shin = dist2d(rightKnee, rightAnkle)
    result.legLength = (thigh + shin) * cmPerPixel
  }

  // 골반 너비
  if (isVisible(leftHip, rightHip)) {
    result.hipWidth = dist2d(leftHip, rightHip) * cmPerPixel
  }

  // 몸통 길이 (어깨 중간 ~ 골반 중간)
  if (isVisible(leftShoulder, rightShoulder, leftHip, rightHip)) {
    const shoulderMid = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
      z: 0,
      visibility: 1,
    }
    const hipMid = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: 0,
      visibility: 1,
    }
    result.torsoLength = dist2d(shoulderMid, hipMid) * cmPerPixel
  }

  return result
}
