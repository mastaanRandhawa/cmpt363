// useTimerStore
// Zustand store for all Pomodoro timer state. Persisted to localStorage so
// the timer survives navigation and page reloads and doesn't reset each time.
//
// State shape:
//   modeIdx    – 0 | 1 | 2  (index into MODES array)
//   seconds    – number, seconds remaining on the current countdown
//   running    – boolean
//   sessions   – number, focus sessions completed this sitting
//   taskId     – string | null, id of the linked task
//   sessionSec – number, focus seconds accumulated since last flush
//   startedAt  – number | null, Date.now() when the interval last started
//                Used on page reload to catch up elapsed time.
//
// There are no actions — all writes use useTimerStore.setState() directly
// from the module-level functions in Timer.jsx so the interval can update
// the store without React lifecycle constraints.
//
// MODES is exported here so Timer.jsx and any future components share
// a single source of truth.
//
// Usage:
//   import useTimerStore, { MODES } from '../data/useTimerStore'
//   const { seconds, running } = useTimerStore()

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MODES = [
    { key: 'focus', label: 'Focus Time',  minutes: 25, color: 'var(--color-primary)' },
    { key: 'short', label: 'Short Break', minutes: 5,  color: 'var(--color-success)' },
    { key: 'long',  label: 'Long Break',  minutes: 15, color: 'var(--color-accent)'  },
]

const useTimerStore = create(
    persist(
        () => ({
            modeIdx:        0,
            seconds:        MODES[0].minutes * 60,
            running:        false,
            sessions:       0,
            taskId:         null,
            sessionSec:     0,
            startedAt:      null,
            waitingForUser: false,
        }),
        { name: 'robo-timer' }
    )
)

export default useTimerStore