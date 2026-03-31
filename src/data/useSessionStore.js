// useSessionStore
// Tracks transient session state that shouldn't persist across page reloads.
// Currently used to gate the streak toast so it only fires after unlock.

import { create } from 'zustand'

const useSessionStore = create((set) => ({
    unlocked:         false,
    streakToastShown: false,
    setUnlocked:      () => set({ unlocked: true }),
    setStreakToastShown: () => set({ streakToastShown: true }),
}))

export default useSessionStore