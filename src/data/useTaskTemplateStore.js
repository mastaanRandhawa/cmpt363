// useTaskTemplateStore — API-backed.
// Pure helpers are kept as exports so taskBreakdown.js can still import them.

import { create } from 'zustand'
import { api, API_BASE } from './api'

// ── pure helpers (exported for taskBreakdown.js) ──────────────────────────────

const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for',
    'of','with','my','do','doing','some','all','our',
])

export function normaliseName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w))
        .sort()
        .join(' ')
}

export function similarity(nameA, nameB) {
    const a = new Set(normaliseName(nameA).split(' '))
    const b = new Set(normaliseName(nameB).split(' '))
    if (a.size === 0 || b.size === 0) return 0
    const intersection = [...a].filter(w => b.has(w)).length
    const union = new Set([...a, ...b]).size
    return intersection / union
}

export function findSimilarTemplates(taskName, templates, threshold = 0.3) {
    return Object.values(templates)
        .map(t => ({ ...t, score: similarity(taskName, t.taskName) }))
        .filter(t => t.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
}

export function buildDiff(aiOriginal, finalSubtasks) {
    const aiIds    = new Set(aiOriginal.map(s => s.id))
    const finalIds = new Set(finalSubtasks.map(s => s.id))
    const kept      = finalSubtasks.filter(s => s.ai && aiIds.has(s.id))
    const removed   = aiOriginal.filter(s => !finalIds.has(s.id))
    const userAdded = finalSubtasks.filter(s => !s.ai)
    return { kept, removed, userAdded }
}

// ── store ────────────────────────────────────────────────────────────────────

const useTaskTemplateStore = create((set, get) => ({
    // templates as a Record<normalizedKey, entry> to keep getSimilar working
    templates: {},

    // ── bootstrap ─────────────────────────────────────────────────────────────
    fetchTemplates: async () => {
        try {
            const rows = await api.getSimilarTemplates('')
            // getSimilarTemplates with empty string returns empty; just prefetch all
            const all = await fetch(`${API_BASE}/task-templates`).then(r => r.json()).catch(() => [])
            const map = {}
            for (const t of all) map[t.normalizedKey] = t
            set({ templates: map })
        } catch { /* non-critical */ }
    },

    saveTemplate: async ({ taskName, aiSuggested, finalSubtasks }) => {
        try {
            const row = await api.saveTemplate({ taskName, aiSuggested, finalSubtasks })
            set(s => ({
                templates: { ...s.templates, [row.normalizedKey]: row },
            }))
        } catch { /* don't block the user flow */ }
    },

    getSimilar: async (taskName) => {
        try {
            return await api.getSimilarTemplates(taskName)
        } catch {
            return []
        }
    },

    clearTemplates: async () => {
        await api.clearTemplates()
        set({ templates: {} })
    },
}))

export default useTaskTemplateStore
