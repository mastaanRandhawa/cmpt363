// useRoboStore — API-backed.
// All exported pure helpers (levelFromXp, xpProgressInLevel, etc.) are kept
// so other files that import them directly continue to work.

import { create } from 'zustand'
import { api } from './api'

// ── pure helpers (still exported for direct use) ──────────────────────────────

export const LEVEL_XP = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4200]

export function xpForLevel(level) {
    return LEVEL_XP[Math.min(level - 1, LEVEL_XP.length - 1)]
}

export function xpForNextLevel(level) {
    if (level >= LEVEL_XP.length) return null
    return LEVEL_XP[level]
}

export function levelFromXp(xp) {
    let level = 1
    for (let i = 1; i < LEVEL_XP.length; i++) {
        if (xp >= LEVEL_XP[i]) level = i + 1
        else break
    }
    return level
}

export function xpProgressInLevel(xp) {
    const level    = levelFromXp(xp)
    const levelMin = xpForLevel(level)
    const levelMax = xpForNextLevel(level)
    if (levelMax === null) return { current: xp - levelMin, max: xp - levelMin, percent: 100 }
    return {
        current: xp - levelMin,
        max:     levelMax - levelMin,
        percent: Math.round(((xp - levelMin) / (levelMax - levelMin)) * 100),
    }
}

// ── store ────────────────────────────────────────────────────────────────────

function applyPayload(payload) {
    return {
        xp:               payload.xp,
        streak:           payload.streak,
        lastActivityDate: payload.lastActivityDate,
        mood:             payload.mood,
        moodDate:         payload.moodDate,
        xpLog:            payload.xpLog,
    }
}

const useRoboStore = create((set, get) => ({
    xp:               0,
    streak:           0,
    lastActivityDate: null,
    mood:             null,
    moodDate:         null,
    xpLog:            [],

    // ── derived (same API as before) ──────────────────────────────────────────
    getLevel:    () => levelFromXp(get().xp),
    getProgress: () => xpProgressInLevel(get().xp),

    // ── bootstrap ─────────────────────────────────────────────────────────────
    fetchRobo: async () => {
        try {
            const data = await api.getRobo()
            set(applyPayload(data))
        } catch { /* silent */ }
    },

    // ── actions ───────────────────────────────────────────────────────────────
    awardXp: async (amount, reason) => {
        const data = await api.awardXp(amount, reason)
        set(applyPayload(data))
    },

    setMood: async (index) => {
        const data = await api.setMood(index)
        set(applyPayload(data))
    },

    completeTask: async (task) => {
        const data = await api.completeTask(task)
        set(applyPayload(data))
    },

    checkStreak: async () => {
        const data = await api.checkStreak()
        set(applyPayload(data))
    },

    resetRobo: async () => {
        const data = await fetch('/api/robo/reset', { method: 'POST' }).then(r => r.json())
        set(applyPayload(data))
    },
}))

export default useRoboStore
