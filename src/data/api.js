const envBase = import.meta.env.VITE_API_BASE
export const API_BASE = (envBase != null && String(envBase).trim() !== ''
    ? String(envBase)
    : 'http://localhost:3001/api').replace(/\/$/, '')

async function req(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    }
    if (body !== undefined) opts.body = JSON.stringify(body)
    const res = await fetch(`${API_BASE}${path}`, opts)
    if (res.status === 204) return null
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
    return json
}

export const api = {
    // ── tasks ──────────────────────────────────────────────────────────────────
    getTasks:             ()           => req('GET',    '/tasks'),
    getTask:              (id)         => req('GET',    `/tasks/${id}`),
    createTask:           (body)       => req('POST',   '/tasks', body),
    updateTask:           (id, body)   => req('PATCH',  `/tasks/${id}`, body),
    deleteTask:           (id)         => req('DELETE', `/tasks/${id}`),
    toggleComplete:       (id)         => req('POST',   `/tasks/${id}/toggle-complete`),
    toggleSubtask:        (tid, sid)   => req('PATCH',  `/tasks/${tid}/subtasks/${sid}`, { done: true }),
    setSubtaskDone:       (tid, sid, done) => req('PATCH', `/tasks/${tid}/subtasks/${sid}`, { done }),
    addSubtask:           (tid, body)  => req('POST',   `/tasks/${tid}/subtasks`, body),
    removeSubtask:        (tid, sid)   => req('DELETE', `/tasks/${tid}/subtasks/${sid}`),
    reorderSubtasks:      (tid, ids)   => req('PATCH',  `/tasks/${tid}/subtasks/reorder`, { orderedIds: ids }),

    // ── notifications ──────────────────────────────────────────────────────────
    getNotifications:     ()           => req('GET',    '/notifications'),
    addNotification:      (body)       => req('POST',   '/notifications', body),
    markAllRead:          ()           => req('PATCH',  '/notifications/read-all'),
    clearNotifications:   ()           => req('DELETE', '/notifications'),

    // ── robo ───────────────────────────────────────────────────────────────────
    getRobo:              ()           => req('GET',    '/robo'),
    setMood:              (index)      => req('POST',   '/robo/mood', { index }),
    completeTask:         (task)       => req('POST',   '/robo/complete-task', { task }),
    checkStreak:          ()           => req('POST',   '/robo/check-streak'),
    awardXp:              (amount, reason) => req('POST', '/robo/xp', { amount, reason }),

    // ── task templates ─────────────────────────────────────────────────────────
    getSimilarTemplates:  (taskName)   => req('GET',    `/task-templates/similar?taskName=${encodeURIComponent(taskName)}`),
    saveTemplate:         (body)       => req('POST',   '/task-templates/save', body),
    clearTemplates:       ()           => req('DELETE', '/task-templates'),

    // ── ai ─────────────────────────────────────────────────────────────────────
    breakdown:            (task, instructions, personalities = []) => req('POST',   '/ai/breakdown', { task, instructions, subtaskContext, personalities }),
    recommend:            (body)       => req('POST',   '/ai/recommend', body),
    chat:                 (body)       => req('POST',   '/ai/chat', body),
}
