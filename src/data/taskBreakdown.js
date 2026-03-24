// taskBreakdown.js
// Formats a task into an AI prompt, calls the API, and parses the response
// into the subtask shape the app expects.
//
// To switch from mock → real API:
//   Change USE_MOCK to false. Requires VITE_ANTHROPIC_API_KEY in your .env
//   (or a backend proxy — browser direct calls need the key exposed).

import useAIStore from './useAIStore'
import useTaskTemplateStore from './useTaskTemplateStore'

// ─── config ──────────────────────────────────────────────────────────────────

const USE_MOCK = true  // ← flip to false when ready for real API

const SYSTEM_PROMPT = `You are a productivity assistant that breaks tasks into clear, actionable subtasks.

When given a task, respond ONLY with a valid JSON array — no markdown, no explanation, no backticks.
Each item in the array must have exactly these fields:
  - "label": string, a short actionable step (max 60 chars)
  - "estimatedMinutes": number, realistic time estimate in minutes

Produce between 3 and 7 subtasks. Order them logically. Be specific, not vague.
Example output:
[
  { "label": "Research available options online", "estimatedMinutes": 20 },
  { "label": "Compare top 3 candidates", "estimatedMinutes": 15 }
]`

// ─── prompt builder ───────────────────────────────────────────────────────────

export function buildPrompt(task, similarTemplates = []) {
    const lines = [`Break down this task into subtasks:\n`, `Task: ${task.name}`]

    if (task.due)         lines.push(`Due date: ${task.due}`)
    if (task.time)        lines.push(`Time: ${task.time}`)
    if (task.priority)    lines.push(`Priority: ${task.priority}`)
    if (task.effort)      lines.push(`Effort level: ${task.effort}/5`)
    if (task.description) lines.push(`\nContext: ${task.description}`)
    if (task.location)    lines.push(`Location: ${typeof task.location === 'string' ? task.location : task.location?.label}`)

    // Inject personalised history from similar past tasks
    if (similarTemplates.length > 0) {
        lines.push(`\n--- USER'S HISTORY FOR SIMILAR TASKS ---`)
        lines.push(`Use this to personalise the breakdown. Prioritise steps the user added themselves and keep their time estimates.`)

        for (const template of similarTemplates) {
            const matchPct = Math.round(template.score * 100)
            lines.push(`\nPrevious task: "${template.taskName}" (${matchPct}% match, done ${template.timesUsed}x)`)

            if (template.diff.kept.length > 0) {
                lines.push(`  KEPT from AI:`)
                template.diff.kept.forEach(s => {
                    const time = s.estimatedMinutes ? ` (${s.estimatedMinutes}m)` : ''
                    lines.push(`    - ${s.label}${time}`)
                })
            }

            if (template.diff.removed.length > 0) {
                lines.push(`  REMOVED (user did not want):`)
                template.diff.removed.forEach(s => lines.push(`    - ${s.label}`))
            }

            if (template.diff.userAdded.length > 0) {
                lines.push(`  USER ADDED (always include these):`)
                template.diff.userAdded.forEach(s => {
                    const time = s.estimatedMinutes ? ` (${s.estimatedMinutes}m)` : ''
                    lines.push(`    - ${s.label}${time}`)
                })
            }
        }
        lines.push(`--- END HISTORY ---`)
    }

    return lines.join('\n')
}

// ─── response parser ──────────────────────────────────────────────────────────

export function parseResponse(text) {
    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim()

    const raw = JSON.parse(clean)   // throws if malformed — caught by caller

    if (!Array.isArray(raw)) throw new Error('Response was not an array')

    return raw.map((item, i) => ({
        id:    `ai-${i}-${Date.now()}`,
        label: String(item.label ?? '').trim(),
        done:  false,
        ai:    true,
        estimatedMinutes: typeof item.estimatedMinutes === 'number' ? item.estimatedMinutes : null,
    })).filter(s => s.label.length > 0)
}

// ─── mock implementation ──────────────────────────────────────────────────────

const MOCK_RESPONSES = {
    default: [
        { label: 'Research and gather relevant information', estimatedMinutes: 20 },
        { label: 'Create an outline or plan',               estimatedMinutes: 10 },
        { label: 'Complete the first draft or attempt',     estimatedMinutes: 30 },
        { label: 'Review and make improvements',            estimatedMinutes: 15 },
        { label: 'Final check and submit or deliver',       estimatedMinutes: 10 },
    ],
    shopping: [
        { label: 'Check what you already have at home',    estimatedMinutes: 5  },
        { label: 'Write a shopping list',                  estimatedMinutes: 5  },
        { label: 'Go to the store',                        estimatedMinutes: 20 },
        { label: 'Buy items from the list',                estimatedMinutes: 20 },
        { label: 'Return home and put items away',         estimatedMinutes: 10 },
    ],
    essay: [
        { label: 'Research the topic and gather sources',  estimatedMinutes: 45 },
        { label: 'Create a detailed outline',              estimatedMinutes: 20 },
        { label: 'Write the introduction',                 estimatedMinutes: 20 },
        { label: 'Write the body paragraphs',             estimatedMinutes: 60 },
        { label: 'Write the conclusion',                   estimatedMinutes: 15 },
        { label: 'Add citations and references',           estimatedMinutes: 20 },
        { label: 'Proofread and submit',                   estimatedMinutes: 20 },
    ],
}

function pickMockResponse(taskName) {
    const lower = taskName.toLowerCase()
    if (lower.includes('shop') || lower.includes('grocer') || lower.includes('buy')) return MOCK_RESPONSES.shopping
    if (lower.includes('essay') || lower.includes('write') || lower.includes('report')) return MOCK_RESPONSES.essay
    return MOCK_RESPONSES.default
}

async function callMockAPI(prompt) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1800 + Math.random() * 800))

    // Extract task name from prompt for mock routing
    const match = prompt.match(/^Task: (.+)$/m)
    const name  = match ? match[1] : ''
    const data  = pickMockResponse(name)

    return JSON.stringify(data, null, 2)
}

// ─── real API implementation ──────────────────────────────────────────────────

async function callRealAPI(prompt) {
    // TODO Once we get real API added
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function generateSubtasks(task) {
    const { setLoading, setSuccess, setError } = useAIStore.getState()

    // Look up personalised history for this task
    const similarTemplates = useTaskTemplateStore.getState().getSimilar(task.name)

    const prompt = buildPrompt(task, similarTemplates)
    setLoading(prompt)

    try {
        const rawText = USE_MOCK
            ? await callMockAPI(prompt)
            : await callRealAPI(prompt)

        const subtasks = parseResponse(rawText)
        setSuccess(rawText, subtasks)
        return subtasks

    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        throw err
    }
}