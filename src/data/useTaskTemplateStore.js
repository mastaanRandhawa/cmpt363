// useTaskTemplateStore
// Stores learned task patterns from user behaviour.
// Each time a user saves a task with subtasks, we record:
//   - What the AI originally suggested
//   - What the user kept from the AI
//   - What the user removed from the AI
//   - What the user added themselves
//   - Final time estimates (which the user may have adjusted)
//
// On the next similar task, this history is injected into the AI prompt
// so the AI produces a personalised breakdown from day one.
//
// Matching is done by normalising task names (lowercase, no stop words)
// and checking for keyword overlap — no embeddings needed.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── normalisation ────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for',
    'of','with','my','the','do','doing','some','all','our',
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

// ─── similarity ───────────────────────────────────────────────────────────────

export function similarity(nameA, nameB) {
    const a = new Set(normaliseName(nameA).split(' '))
    const b = new Set(normaliseName(nameB).split(' '))
    if (a.size === 0 || b.size === 0) return 0
    const intersection = [...a].filter(w => b.has(w)).length
    const union = new Set([...a, ...b]).size
    return intersection / union  // Jaccard similarity 0–1
}

export function findSimilarTemplates(taskName, templates, threshold = 0.3) {
    return Object.values(templates)
        .map(t => ({ ...t, score: similarity(taskName, t.taskName) }))
        .filter(t => t.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)  // top 3 matches
}

// ─── diff builder ─────────────────────────────────────────────────────────────

export function buildDiff(aiOriginal, finalSubtasks) {
    const aiIds    = new Set(aiOriginal.map(s => s.id))
    const finalIds = new Set(finalSubtasks.map(s => s.id))

    // What AI suggested that user kept (present in both)
    const kept = finalSubtasks.filter(s => s.ai && aiIds.has(s.id))

    // What AI suggested that user removed (in AI original but not in final)
    const removed = aiOriginal.filter(s => !finalIds.has(s.id))

    // What user added themselves (in final, not from AI)
    const userAdded = finalSubtasks.filter(s => !s.ai)

    return { kept, removed, userAdded }
}

// ─── store ────────────────────────────────────────────────────────────────────

const useTaskTemplateStore = create(
    persist(
        (set, get) => ({
            // templates: Record<normalisedKey, TemplateEntry>
            templates: {},

            // Save a learned pattern after user confirms subtasks
            saveTemplate: ({ taskName, aiSuggested, finalSubtasks }) => {
                const key  = normaliseName(taskName)
                const diff = buildDiff(aiSuggested, finalSubtasks)

                set(s => ({
                    templates: {
                        ...s.templates,
                        [key]: {
                            taskName,
                            key,
                            savedAt:    new Date().toISOString(),
                            timesUsed:  (s.templates[key]?.timesUsed ?? 0) + 1,
                            finalSubtasks: finalSubtasks.map(sub => ({
                                label:             sub.label,
                                estimatedMinutes:  sub.estimatedMinutes ?? null,
                                fromAI:            !!sub.ai,
                            })),
                            diff: {
                                kept:      diff.kept.map(s => ({ label: s.label, estimatedMinutes: s.estimatedMinutes ?? null })),
                                removed:   diff.removed.map(s => ({ label: s.label })),
                                userAdded: diff.userAdded.map(s => ({ label: s.label, estimatedMinutes: s.estimatedMinutes ?? null })),
                            },
                        },
                    },
                }))
            },

            // Find templates similar to a task name
            getSimilar: (taskName) => {
                const { templates } = get()
                return findSimilarTemplates(taskName, templates)
            },

            // Clear all templates (dev reset)
            clearTemplates: () => set({ templates: {} }),
        }),
        { name: 'robo-task-templates' }
    )
)

export default useTaskTemplateStore