// useDebugStore
// Lightweight store for pushing arbitrary debug state from any page/component.
// DebugPanel reads from this and displays it live.
//
// Usage in any page:
//   const setDebug = useDebugStore(s => s.set)
//
//   // Call whenever your local state changes
//   useEffect(() => {
//     setDebug('TaskCreate', { name, date, priority, effort, step, aiSuggest, ... })
//   }, [name, date, priority, effort, step, aiSuggest])
//
//   // Clear on unmount so stale state doesn't linger
//   useEffect(() => () => setDebug('TaskCreate', null), [])

import { create } from 'zustand'

const useDebugStore = create((set) => ({
    // Key = page/component name, value = object of variables or null to clear
    pages: {},

    set: (page, data) => set(s => ({
        pages: data === null
            ? Object.fromEntries(Object.entries(s.pages).filter(([k]) => k !== page))
            : { ...s.pages, [page]: data },
    })),
}))

export default useDebugStore