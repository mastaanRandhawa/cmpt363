// useRoboStore
// Zustand store for the Robo companion's leveling system.
//
// State:
//   xp               – total accumulated XP
//   level            – current level (1–10), derived from xp
//   streak           – consecutive days with at least one task completed
//   lastActivityDate – ISO date string of last task completion (for streak tracking)
//   mood             – index into moods array (0–5), or null if not set today
//   moodDate         – ISO date string when mood was last set
//   xpLog            – last 20 XP events [ { reason, amount, date } ]
//
// Actions:
//   awardXp(amount, reason)  – add XP, bump level if threshold crossed
//   setMood(index)           – record today's mood (awards +5 XP first time each day)
//   completeTask(task)       – called when a task is marked complete; awards task XP + bonuses
//   checkStreak()            – call on app mount; resets streak if last activity was 2+ days ago

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// XP required to REACH each level (index = level - 1)
export const LEVEL_XP = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4200]

export function xpForLevel(level) {
    return LEVEL_XP[Math.min(level - 1, LEVEL_XP.length - 1)]
}

export function xpForNextLevel(level) {
    if (level >= LEVEL_XP.length) return null // max level
    return LEVEL_XP[level] // level is 1-indexed; index = next level - 1
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

function todayStr() {
    return new Date().toISOString().slice(0, 10)
}

function daysBetween(a, b) {
    if (!a || !b) return Infinity
    return Math.round((new Date(b) - new Date(a)) / 86400000)
}

const useRoboStore = create(
    persist(
        (set, get) => ({
            xp:               0,
            streak:           0,
            lastActivityDate: null,
            mood:             null,
            moodDate:         null,
            xpLog:            [],

            // ── derived helpers (not stored, computed on read) ──────────────────
            getLevel:    () => levelFromXp(get().xp),
            getProgress: () => xpProgressInLevel(get().xp),

            // ── award XP ───────────────────────────────────────────────────────
            awardXp: (amount, reason) => {
                set(s => {
                    const newXp  = s.xp + amount
                    const entry  = { reason, amount, date: todayStr() }
                    const newLog = [entry, ...s.xpLog].slice(0, 20)
                    return { xp: newXp, xpLog: newLog }
                })
            },

            // ── mood check-in ─────────────────────────────────────────────────
            setMood: (index) => {
                const today = todayStr()
                set(s => {
                    const firstToday = s.moodDate !== today
                    const newXp      = firstToday ? s.xp + 5 : s.xp
                    const newLog     = firstToday
                        ? [{ reason: 'Mood check-in', amount: 5, date: today }, ...s.xpLog].slice(0, 20)
                        : s.xpLog
                    return { mood: index, moodDate: today, xp: newXp, xpLog: newLog }
                })
            },

            // ── complete task (main XP event) ─────────────────────────────────
            completeTask: (task) => {
                const today    = todayStr()
                const events   = []
                let   xpGained = 0

                // Base XP
                events.push({ reason: 'Task completed', amount: 15, date: today })
                xpGained += 15

                // Early finish bonus — task was due today or in the future
                if (task?.due) {
                    const due = task.due
                    if (due >= today) {
                        events.push({ reason: 'Early finish bonus', amount: 10, date: today })
                        xpGained += 10
                    }
                }

                set(s => {
                    // Streak logic
                    const last    = s.lastActivityDate
                    const diff    = daysBetween(last, today)
                    let streak    = s.streak

                    if (diff === 0) {
                        // Same day — no change to streak
                    } else if (diff === 1) {
                        // Consecutive day
                        streak += 1
                        events.push({ reason: 'Daily streak', amount: 15, date: today })
                        xpGained += 15
                    } else {
                        // Missed a day — reset
                        streak = 1
                    }

                    const newLog = [...events, ...s.xpLog].slice(0, 20)
                    return {
                        xp:               s.xp + xpGained,
                        streak,
                        lastActivityDate: today,
                        xpLog:            newLog,
                    }
                })
            },

            // ── check streak on app mount ─────────────────────────────────────
            checkStreak: () => {
                const today = todayStr()
                set(s => {
                    if (!s.lastActivityDate) return {}
                    const diff = daysBetween(s.lastActivityDate, today)
                    if (diff > 1) return { streak: 0 }
                    return {}
                })
            },

            // ── reset (dev) ──────────────────────────────────────────────────
            resetRobo: () => set({
                xp: 0, streak: 0, lastActivityDate: null,
                mood: null, moodDate: null, xpLog: [],
            }),
        }),
        { name: 'robo-companion' }
    )
)

export default useRoboStore