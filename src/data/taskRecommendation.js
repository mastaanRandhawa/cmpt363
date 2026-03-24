// taskRecommendation.js
// Sends the user's task list + context to AI and gets back a recommended task
// with a justification for why it should be done now.
//
// Input context:
//   - All incomplete tasks (name, priority, due, effort, subtasks)
//   - Current mood (if set today)
//   - Current time of day
//   - Streak info
//
// Output:
//   { taskId, reason }
//   taskId — id of the recommended task
//   reason — 1 sentence justification shown to user

import useAIStore from './useAIStore'

const USE_MOCK = true // ← flip to false with real API

// ─── prompt builder ───────────────────────────────────────────────────────────

const MOODS = ['Energized', 'Good', 'Meh', 'Stressed', 'Tired', 'Frustrated']

export function buildRecommendationPrompt({ tasks, moodIndex, hour, streak }) {
    const moodLabel = moodIndex !== null ? MOODS[moodIndex] : null
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

    const lines = [
        `You are a productivity assistant. Pick the SINGLE best task for the user to work on RIGHT NOW.`,
        ``,
        `Context:`,
        `- Time of day: ${timeOfDay} (${hour}:00)`,
        moodLabel ? `- User's current mood: ${moodLabel}` : `- User's mood: not set`,
        streak > 0 ? `- Current streak: ${streak} days` : null,
        ``,
        `Tasks (incomplete only):`,
    ].filter(Boolean)

    tasks.forEach((t, i) => {
        const subtaskCount = t.subtasks?.length ?? 0
        const doneCount    = t.subtasks?.filter(s => s.done).length ?? 0
        const parts = [
            `${i + 1}. [ID: ${t.id}] "${t.name}"`,
            `   Priority: ${t.priority}`,
            t.due  ? `   Due: ${t.due}${t.time ? ` at ${t.time}` : ''}` : null,
            t.effort ? `   Effort: ${t.effort}/5` : null,
            subtaskCount > 0 ? `   Subtasks: ${doneCount}/${subtaskCount} done` : null,
        ].filter(Boolean)
        lines.push(...parts)
    })

    lines.push(``)
    lines.push(`Respond ONLY with valid JSON, no markdown, no explanation:`)
    lines.push(`{ "taskId": "<exact task id from above>", "reason": "<one sentence, max 15 words, why this task now>" }`)

    return lines.join('\n')
}

// ─── mock ─────────────────────────────────────────────────────────────────────

async function callMockAPI(tasks, moodIndex, hour) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600))

    // Simple mock logic: pick highest priority, then soonest due
    const PRIORITY_ORDER = { high: 3, med: 2, low: 1 }
    const today = new Date().toISOString().slice(0, 10)

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

    // Generate a contextual reason
    const moodLabel = moodIndex !== null ? MOODS[moodIndex] : null
    let reason = ''

    if (pick.priority === 'high' && pick.due <= today) {
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

    return JSON.stringify({ taskId: pick.id, reason })
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function getRecommendedTask({ tasks, moodIndex, streak }) {
    const hour   = new Date().getHours()
    const prompt = buildRecommendationPrompt({ tasks, moodIndex, hour, streak })

    // We reuse useAIStore but with a recommendation-specific key
    // so it doesn't clobber the breakdown AI state
    try {
        const rawText = USE_MOCK
            ? await callMockAPI(tasks, moodIndex, hour)
            : null // TODO: wire real API

        if (!rawText) return null

        const clean  = rawText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        if (!parsed.taskId || !parsed.reason) return null
        return { taskId: parsed.taskId, reason: parsed.reason, prompt }

    } catch {
        return null
    }
}