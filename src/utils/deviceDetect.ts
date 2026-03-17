import type { SimMode } from '../store/sceneStore'

export function isMobile(): boolean {
  return 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0
}

export function recommendSimMode(): SimMode {
  return isMobile() ? 'baked' : 'realtime'
}
