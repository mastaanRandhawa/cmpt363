import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { findSimilarTemplates } from '../lib/templateMatch.js'

// ── Gemini client (only created when key is present) ──────────────────────────
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null

// ── Shared personality helper ─────────────────────────────────────────────────
function personalityInstruction(personalities = []) {
    if (!personalities || personalities.length === 0) return ''
    return `\nPERSONALITY: The user has chosen these traits for you: ${personalities.join(', ')}. Let them shape your tone, word choice, and energy in every response.`
}

function getModel(systemInstruction) {
    return genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        systemInstruction,
    })
}

// ── mock helpers ──────────────────────────────────────────────────────────────

const MOCK_BREAKDOWN = {
    default: [
        { label: 'Research and gather relevant information', estSubtaskTime: 20 },
        { label: 'Create an outline or plan',               estSubtaskTime: 10 },
        { label: 'Complete the first draft or attempt',     estSubtaskTime: 30 },
        { label: 'Review and make improvements',            estSubtaskTime: 15 },
        { label: 'Final check and submit or deliver',       estSubtaskTime: 10 },
    ],
    shopping: [
        { label: 'Check what you already have at home', estSubtaskTime: 5  },
        { label: 'Write a shopping list',               estSubtaskTime: 5  },
        { label: 'Go to the store',                     estSubtaskTime: 20 },
        { label: 'Buy items from the list',             estSubtaskTime: 20 },
        { label: 'Return home and put items away',      estSubtaskTime: 10 },
    ],
    essay: [
        { label: 'Research the topic and gather sources', estSubtaskTime: 45 },
        { label: 'Create a detailed outline',             estSubtaskTime: 20 },
        { label: 'Write the introduction',                estSubtaskTime: 20 },
        { label: 'Write the body paragraphs',            estSubtaskTime: 60 },
        { label: 'Write the conclusion',                  estSubtaskTime: 15 },
        { label: 'Add citations and references',          estSubtaskTime: 20 },
        { label: 'Proofread and submit',                  estSubtaskTime: 20 },
    ],
}

function pickBreakdown(name) {
    const lower = name.toLowerCase()
    if (lower.includes('shop') || lower.includes('grocer') || lower.includes('buy')) return MOCK_BREAKDOWN.shopping
    if (lower.includes('essay') || lower.includes('write') || lower.includes('report')) return MOCK_BREAKDOWN.essay
    return MOCK_BREAKDOWN.default
}

function mockBreakdown(task) {
    const data = pickBreakdown(task.name)
    return data.map((item, i) => ({
        id:               `ai-${i}-${Date.now()}`,
        label:            item.label,
        done:             false,
        ai:               true,
        estSubtaskTime: item.estSubtaskTime,
    }))
}

// ── breakdown helpers ─────────────────────────────────────────────────────────

const EFFORT_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' }

function buildBreakdownPrompt(task, templates = []) {
    const lines = [`Task: ${task.name}`]
    if (task.due)         lines.push(`Due date: ${task.due}`)
    if (task.time)        lines.push(`Due time: ${task.time}`)
    if (task.priority)    lines.push(`Priority: ${task.priority}`)
    if (task.effort)      lines.push(`Effort level: ${EFFORT_LABELS[task.effort] ?? task.effort} (1–5 scale)`)
    if (!task.privateNotes) {
        if (task.notes) lines.push(`Notes: ${task.notes}`)
    }
    if (task.location)    lines.push(`Location: ${typeof task.location === 'string' ? task.location : task.location?.label}`)

    if (templates.length > 0) {
        lines.push('')
        lines.push('CONTEXT FROM PAST SIMILAR TASKS:')
        for (const t of templates) {
            const kept    = t.diff?.kept      ?? []
            const added   = t.diff?.userAdded ?? []
            const removed = t.diff?.removed   ?? []
            lines.push(`"${t.taskName}" (done ${t.timesUsed} time${t.timesUsed !== 1 ? 's' : ''}):`)
            if (kept.length)    lines.push(`  Kept:    ${kept.map(s => `"${s.label}"${s.estSubtaskTime ? ` (${s.estSubtaskTime}min)` : ''}`).join(', ')}`)
            if (added.length)   lines.push(`  Added:   ${added.map(s => `"${s.label}"${s.estSubtaskTime ? ` (${s.estSubtaskTime}min)` : ''}`).join(', ')}`)
            if (removed.length) lines.push(`  Removed: ${removed.map(s => `"${s.label}"`).join(', ')}`)
        }
        lines.push('Use this to personalise your suggestions — favour subtasks the user kept or added, avoid ones they removed, and match their actual time experience.')
    }

    return lines.join('\n')
}

function parseAIBreakdown(text) {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found in AI response')
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) throw new Error('AI response is not an array')
    return parsed.map((item, i) => ({
        id:               `ai-${i}-${Date.now()}`,
        label:            String(item.label ?? item.step ?? item.task ?? ''),
        done:             false,
        ai:               true,
        estSubtaskTime: Number(item.estSubtaskTime) > 0 ? Math.round(Number(item.estSubtaskTime)) : null,
    })).filter(s => s.label)
}

async function realBreakdown(task, templates, personalities) {
    const model  = getModel(`You are a productivity assistant that breaks down tasks into clear, actionable subtasks. Your personality is ${personalityInstruction(personalities)}.

Given notes on a task, return a JSON array of subtasks. Each subtask must have:
- "label": a short, concrete action starting with a verb (max ~60 characters)
- "estSubtaskTime": realistic time estimate as a number

Return 3–7 subtasks. Output only the JSON array, no explanation.

Example:
[
  { "label": "Research available options online", "estSubtaskTime": 20 },
  { "label": "Make a decision and place order", "estSubtaskTime": 10 }
]`)

    const result = await model.generateContent(buildBreakdownPrompt(task, templates))
    return parseAIBreakdown(result.response.text())
}

// ── recommend helpers ─────────────────────────────────────────────────────────

const MOODS       = ['Energized', 'Good', 'Meh', 'Stressed', 'Tired', 'Frustrated']
const EFFORT_DESC = { 1: 'very low', 2: 'low', 3: 'medium', 4: 'high', 5: 'very high' }

function buildRecommendPrompt(tasks, moodIndex, streak) {
    const today     = new Date().toISOString().slice(0, 10)
    const hour      = new Date().getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const moodLabel = moodIndex != null ? MOODS[moodIndex] : null

    const lines = [
        `Today: ${today} (${timeOfDay})`,
        streak > 0 ? `Streak: ${streak} day${streak !== 1 ? 's' : ''}` : null,
        moodLabel ? `Current mood: ${moodLabel}` : null,
        '',
        'Tasks (pick exactly one):',
    ].filter(Boolean)

    for (const t of tasks) {
        const parts = [`[ID: ${t.id}] "${t.name}"`]
        if (t.due)      parts.push(`due ${t.due}`)
        if (t.priority) parts.push(`priority: ${t.priority}`)
        if (t.effort)   parts.push(`effort: ${EFFORT_DESC[t.effort] ?? t.effort}/5`)
        lines.push(parts.join(' — '))
    }

    return lines.join('\n')
}

function mockRecommend(tasks, moodIndex) {
    const today = new Date().toISOString().slice(0, 10)
    const moodLabel = moodIndex != null ? MOODS[moodIndex] : null
    const PRIORITY_ORDER = { high: 3, med: 2, low: 1 }

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
    if (!pick) return null

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

    return { taskId: pick.id, reason }
}

async function realRecommend(tasks, moodIndex, streak, personalities) {
    const model = getModel(`You are a productivity assistant helping a user decide what to work on right now.

Pick the single best task given their mood, energy level, streak, due dates, and priorities.
Consider: high priority + overdue = most urgent; tired/stressed = prefer lower effort tasks; morning = good for focused work; streak = keep momentum.${personalityInstruction(personalities)}

Respond with only a JSON object — no explanation outside it:
{ "taskId": "<exact id from the list>", "reason": "<1–2 warm, direct sentences>" }`)

    const result = await model.generateContent(buildRecommendPrompt(tasks, moodIndex, streak))
    const text   = result.response.text()
    const match  = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object in AI response')
    const parsed = JSON.parse(match[0])
    if (!parsed.taskId || !parsed.reason) throw new Error('Missing taskId or reason')
    if (!tasks.find(t => t.id === parsed.taskId)) throw new Error(`Unknown taskId: ${parsed.taskId}`)
    return { taskId: parsed.taskId, reason: parsed.reason }
}

// ── chat helpers ──────────────────────────────────────────────────────────────

function buildChatSystemPrompt(tasks, roboName = 'Robo', personalities = []) {
    const activeTasks = tasks.filter(t => t.status !== 'completed')

    const taskBlock = activeTasks.length > 0
        ? activeTasks.map((t, i) =>
            `${i + 1}. "${t.name}"${t.due ? ` (due ${t.due})` : ''}${t.priority ? ` [${t.priority} priority]` : ''}`
        ).join('\n')
        : 'No active tasks.'

    const personalityBlock = personalities.length > 0
        ? `The user has chosen these personality traits for you: ${personalities.join(', ')}. Let them shape your tone, word choice, and energy in every message.`
        : 'Be upbeat, witty but not exhausting, and casually encouraging.'

    return `You are ${roboName}, an AI task companion inside RoboPlan — a personal productivity app.

YOUR ROLE:
Help the user manage and accomplish their active tasks. You have access to their current task list below.

CORE RULES:
1. Only help with topics that relate to the user's current tasks.
2. If the message has no reasonable connection to any task, redirect them back to their list with personality — never bluntly or rudely.
3. Keep replies concise and friendly. You are a companion, not an encyclopedia.
4. Reference the user's actual task names when possible to feel personal.

TASK RELEVANCE CHECK:
Before responding, ask yourself: "Does this question connect to any task the user currently has?"
- Direct match: question is literally about a task → help fully
- Indirect match: question supports completing a task → help
- No connection: question has nothing to do with any task → redirect with wit

REDIRECT TONE:
Be warm and funny, never dismissive. Reference their actual tasks so the redirect feels personal, not robotic.

PERSONALITY:
${personalityBlock}

CURRENT ACTIVE TASKS:
${taskBlock}`
}

// ── router factory ────────────────────────────────────────────────────────────

/** @param {import('@prisma/client').PrismaClient} prisma */
export function createAiRouter(prisma) {
    const r = Router()

    /**
     * POST /api/ai/breakdown
     * body: { task: { name, due?, time?, priority?, effort?, notes?, location? } }
     * response: { subtasks: [{ id, label, done, ai, estSubtaskTime }] }
     */
    r.post('/breakdown', async (req, res, next) => {
        try {
            const { task, personalities = [] } = req.body
            if (!task?.name) return res.status(400).json({ error: 'task.name required' })

            if (!genAI) {
                await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300))
                return res.json({ subtasks: mockBreakdown(task) })
            }

            const allTemplates = await prisma.taskTemplate.findMany({ where: { userId: req.userId } })
            const similar      = findSimilarTemplates(task.name, allTemplates)

            try {
                const subtasks = await realBreakdown(task, similar, personalities)
                return res.json({ subtasks })
            } catch (aiErr) {
                console.error('[ai/breakdown] AI failed, falling back to mock:', aiErr.message)
                return res.json({ subtasks: mockBreakdown(task) })
            }
        } catch (e) { next(e) }
    })

    /**
     * POST /api/ai/recommend
     * body: { tasks: [...], moodIndex: number|null, streak: number }
     * response: { taskId: string, reason: string } | null
     */
    r.post('/recommend', async (req, res, next) => {
        try {
            const { tasks = [], moodIndex, streak, personalities = [] } = req.body
            if (!Array.isArray(tasks) || tasks.length === 0) return res.json(null)

            if (!genAI) {
                await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300))
                return res.json(mockRecommend(tasks, moodIndex))
            }

            try {
                const result = await realRecommend(tasks, moodIndex, streak, personalities)
                return res.json(result)
            } catch (aiErr) {
                console.error('[ai/recommend] AI failed, falling back to mock:', aiErr.message)
                return res.json(mockRecommend(tasks, moodIndex))
            }
        } catch (e) { next(e) }
    })

    /**
     * POST /api/ai/chat
     * body: { messages: [{role: 'user'|'assistant', content: string}], tasks: [...], roboName?: string }
     * response: { reply: string }
     */
    r.post('/chat', async (req, res, next) => {
        try {
            const { messages = [], tasks = [], roboName = 'Robo', personalities = [] } = req.body
            if (!Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({ error: 'messages[] required' })
            }

            if (!genAI) {
                return res.json({ reply: "I'm not connected to AI right now, but your tasks are waiting for you!" })
            }

            try {
                const model = getModel(buildChatSystemPrompt(tasks, roboName, personalities))

                // Gemini uses 'model' for assistant; split history from current message
                const geminiHistory = messages.slice(0, -1).map(m => ({
                    role:  m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                }))
                const lastMessage = messages[messages.length - 1].content

                const chat   = model.startChat({ history: geminiHistory })
                const result = await chat.sendMessage(lastMessage)
                return res.json({ reply: result.response.text() })
            } catch (aiErr) {
                console.error('[ai/chat] AI failed:', aiErr.message)
                return res.status(502).json({ error: 'AI unavailable' })
            }
        } catch (e) { next(e) }
    })

    return r
}
