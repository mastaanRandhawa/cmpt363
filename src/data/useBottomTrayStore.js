// useBottomTrayStore
// Global bottom tray state. Drives the BottomTray component rendered in App.jsx so
// it persists across route changes.
//
// Usage:
//   // Show the bottom tray
//   const { show, dismiss } = useBottomTrayStore()
//
//   show({ contents: <div>...</div> })
//
//   // In App.jsx
//   const bottomTrayContents = useBottomTrayStore(s => s.contents)
//   {bottomTrayContents && <BottomTray>{bottomTrayContents}</BottomTray>}

import { create } from 'zustand'

const useBottomTrayStore = create((set, get) => ({
    _onDismiss: null,
    id: null,
    dismissing: false,
    contents: null,

    // Show the bottom tray.
    show: ({ contents, id, aboveNav, onDismiss }) => {
        set({
            _onDismiss: onDismiss,
            id,
            aboveNav: aboveNav ?? false,
            contents,
        })
    },

    // Dismiss immediately
    dismiss: () => {
        get()._onDismiss?.()
        set({ 
            _onDismiss: null,
            id: null,
            aboveNav: false,
            contents: null, 
        })
    },
}))

export default useBottomTrayStore