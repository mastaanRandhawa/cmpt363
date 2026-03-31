import { Router } from 'express'
import { randomUUID } from 'crypto'
import { findSimilarTemplates } from '../lib/templateMatch.js'

const r = Router()

// ── mock helpers (same logic that was in the frontend) ────────────────────────

const MOCK_BREAKDOWN = {
    default: [
        { label: 'Research and gather relevant information', estSubtaskTime: 1200 },
        { label: 'Create an outline or plan',               estSubtaskTime: 600  },
        { label: 'Complete the first draft or attempt',     estSubtaskTime: 1800 },
        { label: 'Review and make improvements',            estSubtaskTime: 900  },
        { label: 'Final check and submit or deliver',       estSubtaskTime: 600  },
    ],
    shopping: [
        { label: 'Check what you already have at home', estSubtaskTime: 300  },
        { label: 'Write a shopping list',               estSubtaskTime: 300  },
        { label: 'Go to the store',                     estSubtaskTime: 1200 },
        { label: 'Buy items from the list',             estSubtaskTime: 1200 },
        { label: 'Return home and put items away',      estSubtaskTime: 600  },
    ],
    essay: [
        { label: 'Research the topic and gather sources', estSubtaskTime: 2700 },
        { label: 'Create a detailed outline',             estSubtaskTime: 1200 },
        { label: 'Write the introduction',                estSubtaskTime: 1200 },
        { label: 'Write the body paragraphs',            estSubtaskTime: 3600 },
        { label: 'Write the conclusion',                  estSubtaskTime: 900  },
        { label: 'Add citations and references',          estSubtaskTime: 1200 },
        { label: 'Proofread and submit',                  estSubtaskTime: 1200 },
    ],
}

function pickBreakdown(name) {
    const lower = name.toLowerCase()
    if (lower.includes('shop') || lower.includes('grocer') || lower.includes('buy')) return MOCK_BREAKDOWN.shopping
    if (lower.includes('essay') || lower.includes('write') || lower.includes('report')) return MOCK_BREAKDOWN.essay
    return MOCK_BREAKDOWN.default
}

const MOODS = ['Energized', 'Good', 'Meh', 'Stressed', 'Tired', 'Frustrated']
const PRIORITY_ORDER = { high: 3, med: 2, low: 1 }

/**
 * POST /api/ai/breakdown
 * body: { task: { name, due?, time?, priority?, effort?, description?, location? } }
 * response: { subtasks: [{ id, label, done, ai, estimatedMinutes }] }
 */
r.post('/breakdown', async (req, res, next) => {
    try {
        const { task } = req.body
        if (!task?.name) return res.status(400).json({ error: 'task.name required' })

        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300))

        const data     = pickBreakdown(task.name)
        const subtasks = data.map((item, i) => ({
            id:             `ai-${i}-${Date.now()}`,
            label:          item.label,
            done:           false,
            ai:             true,
            estSubtaskTime: item.estSubtaskTime,
        }))

        res.json({ subtasks })
    } catch (e) { next(e) }
})

/**
 * POST /api/ai/recommend
 * body: { tasks: [...], moodIndex: number|null, streak: number }
 * response: { taskId: string, reason: string } | null
 */
r.post('/recommend', async (req, res, next) => {
    try {
        const { tasks = [], moodIndex, streak } = req.body
        if (!Array.isArray(tasks) || tasks.length === 0) return res.json(null)

        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300))

        const today  = new Date().toISOString().slice(0, 10)
        const hour   = new Date().getHours()
        const moodLabel = (moodIndex !== null && moodIndex !== undefined) ? MOODS[moodIndex] : null

        const sorted = [...tasks].sort((a, b) => {
            const pa = PRIORITY_ORDER[a.priority] ?? 0
            const pb = PRIORITY_ORDER[b.priority] ?? 0
            if (pb !== pa) return pb - pa
            if (a.due && b.due) return a.due.localeCompare(b.due)
            if (a.due) return -1
            if (b.due) return 1
            return 0
        })

        const pick = sorted[0]
        if (!pick) return res.json(null)

        let reason = ''
        if (pick.priority === 'high' && pick.due && pick.due <= today) {
            reason = `This is high priority and already overdue — tackle it first.`
        } else if (pick.priority === 'high') {
            reason = `Highest priority task on your list — best handled while you have energy.`
        } else if (moodLabel === 'Energized' || moodLabel === 'Good') {
            reason = `You're in a good headspace — perfect time for this task.`
        } else if (moodLabel === 'Tired' || moodLabel === 'Meh') {
            reason = `Low effort required — manageable even when energy is low.`
        } else {
            reason = `Due soon and fits your current schedule well.`
        }

        res.json({ taskId: pick.id, reason })
    } catch (e) { next(e) }
})

export { r as createAiRouter }