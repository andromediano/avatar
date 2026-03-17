import { create } from 'zustand'
import type { InputMode } from '../types/measurement'

interface UiState {
  inputMode: InputMode
  isSidePanelOpen: boolean
  setInputMode: (mode: InputMode) => void
  toggleSidePanel: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  inputMode: 'slider',
  isSidePanelOpen: true,

  setInputMode: (mode) => set({ inputMode: mode }),
  toggleSidePanel: () =>
    set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
}))
