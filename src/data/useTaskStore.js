// useTaskStore
// Zustand store for all task state. Backed by the REST API.
// The local `tasks` array is kept in sync after every API call so all
// existing selectors (s => s.tasks, etc.) continue to work unchanged.
//
// Task shape (matches API response):
//   id          – string UUID
//   name        – string
//   due         – string 'YYYY-MM-DD' | null
//   time        – string 'HH:MM' | null
//   priority    – 'low' | 'med' | 'high'
//   effort      – 1–5
//   description – string
//   status      – 'todo' | 'in-progress' | 'completed'
//   location    – { type, label } | null
//   repeat      – { frequency, days? } | null
//   subtasks    – { id, label, done, ai }[]

import { create } from 'zustand'
import { api } from './api'
import useRoboStore from './useRoboStore'

const useTaskStore = create((set, get) => ({
    tasks:   [],
    loading: false,
    error:   null,

    // ── bootstrap — call once on app mount ─────────────────────────────────
    fetchTasks: async () => {
        set({ loading: true, error: null })
        try {
            const tasks = await api.getTasks()
            set({ tasks, loading: false })
        } catch (e) {
            set({ loading: false, error: e.message })
        }
    },

    // ── CRUD ────────────────────────────────────────────────────────────────
    addTask: async (task) => {
        const created = await api.createTask(task)
        set(s => ({ tasks: [created, ...s.tasks] }))
        return created
    },

    updateTask: async (id, changes) => {
        const updated = await api.updateTask(id, changes)
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }))
    },

    deleteTask: async (id) => {
        await api.deleteTask(id)
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    },

    // ── status ──────────────────────────────────────────────────────────────
    toggleComplete: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        const completing = task && task.status !== 'completed'
        if (completing) {
            useRoboStore.getState().completeTask(task)
        }
        const updated = await api.toggleComplete(id)
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }))
    },

    // ── subtasks ─────────────────────────────────────────────────────────────
    toggleSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find(t => t.id === taskId)
        const sub  = task?.subtasks.find(s => s.id === subtaskId)
        if (!sub) return
        const updated = await api.setSubtaskDone(taskId, subtaskId, !sub.done)
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? updated : t) }))
    },

    addSubtask: async (taskId, label) => {
        const updated = await api.addSubtask(taskId, { label })
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? updated : t) }))
    },

    removeSubtask: async (taskId, subtaskId) => {
        const updated = await api.removeSubtask(taskId, subtaskId)
        set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? updated : t) }))
    },

    // ── dev reset — re-fetches from server ───────────────────────────────────
    resetToSeed: async () => {
        await get().fetchTasks()
    },
}))

export default useTaskStore
