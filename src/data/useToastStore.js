// useToastStore
// Global toast state. Drives the Toast component rendered in App.jsx so toasts
// persist across route changes.
//
// Usage:
//   // Show a toast (e.g. in TaskDetail)
//   const { show, dismiss } = useToastStore()
//
//   show({
//     message:     'Task deleted',
//     icon:        <Trash2 size={16} color="var(--color-danger)" />,
//     barColor:    'var(--color-danger)',
//     actionLabel: 'Undo',
//     onAction:    handleUndoDelete,
//   })
//
//   // In App.jsx
//   const toast = useToastStore(s => s.toast)
//   {toast && <Toast {...toast} progress={toast.progress} />}

import { create } from 'zustand'

const useToastStore = create((set, get) => ({
    toast: null,
    _intervalId: null,
    _timerId: null,

    // Show a toast with an auto-dismissing progress bar.
    // onExpire is called when the timer runs out (e.g. to commit deleteTask).
    show: ({ message, icon, barColor, actionLabel, onAction, onExpire, duration = 5000 }) => {
        // Clear any existing toast first
        get().dismiss()

        const interval = 50
        const steps    = duration / interval
        let current    = steps

        const iv = setInterval(() => {
            current -= 1
            const progress = (current / steps) * 100
            set(s => ({ toast: s.toast ? { ...s.toast, progress } : null }))
            if (current <= 0) clearInterval(iv)
        }, interval)

        const t = setTimeout(() => {
            clearInterval(iv)
            set({ toast: null, _intervalId: null, _timerId: null })
            onExpire?.()
        }, duration)

        set({
            toast: { message, icon, barColor, actionLabel, onAction, progress: 100 },
            _intervalId: iv,
            _timerId: t,
        })
    },

    // Dismiss immediately (e.g. on Undo)
    dismiss: () => {
        const { _intervalId, _timerId } = get()
        clearInterval(_intervalId)
        clearTimeout(_timerId)
        set({ toast: null, _intervalId: null, _timerId: null })
    },
}))

export default useToastStore