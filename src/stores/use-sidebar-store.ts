import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const SIDEBAR_STORAGE_KEY = 'lbts-sidebar'

interface SidebarState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
    }),
    {
      name: SIDEBAR_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
