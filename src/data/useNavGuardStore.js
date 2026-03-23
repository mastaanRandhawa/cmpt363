// useNavGuardStore
// Allows any page to register a navigation guard function.
// BottomNav (and anything else that navigates) checks this before proceeding.
//
// Usage in a page:
//   const setGuard = useNavGuardStore(s => s.setGuard)
//   const clearGuard = useNavGuardStore(s => s.clearGuard)
//
//   // Register when dirty
//   useEffect(() => {
//       if (isDirty) setGuard((to, proceed) => { /* show confirm, call proceed() to continue */ })
//       else clearGuard()
//   }, [isDirty])
//
//   // Always clear on unmount
//   useEffect(() => () => clearGuard(), [])

import { create } from 'zustand'

const useNavGuardStore = create((set) => ({
    // guardFn: ((to: string, proceed: () => void) => void) | null
    guardFn: null,

    setGuard:   (fn) => set({ guardFn: fn }),
    clearGuard: ()   => set({ guardFn: null }),
}))

export default useNavGuardStore