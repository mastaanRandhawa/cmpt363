// useTaskStore
// Zustand store for all task state. Persists to localStorage automatically via
// the persist middleware — data survives page refreshes without any extra work.
//
// Task shape:
//   id          – string, unique identifier
//   name        – string
//   due         – string, ISO date 'YYYY-MM-DD' (or '' if none)
//   time        – string | null, 'HH:MM' 24hr
//   priority    – 'low' | 'med' | 'high'
//   effort      – 1 | 2 | 3 | 4 | 5
//   description – string, notes/context for the task
//   status      – 'todo' | 'in-progress' | 'completed'
//   location    – { type: string, label: string } | null
//   repeat      – { frequency: string, days?: string[] } | null
//   subtasks    – { id: string, label: string, done: boolean, ai: boolean }[]
//
// Actions:
//   addTask(task)                    – adds a new task (omit id, it's generated)
//   updateTask(id, changes)          – merges partial changes into a task
//   deleteTask(id)                   – removes a task by id
//   toggleComplete(id)               – toggles between 'todo' and 'completed'
//   toggleSubtask(taskId, subtaskId) – flips a subtask's done flag
//
// Usage:
//   import useTaskStore from '../store/useTaskStore'
//
//   const tasks            = useTaskStore(s => s.tasks)
//   const { toggleComplete, deleteTask } = useTaskStore()

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SEED_TASKS = [
    {
        id: '1',
        name: 'Study for CMPT363 Midterm',
        priority: 'high',
        effort: 4,
        status: 'in-progress',
        description: 'Cover all lecture slides from weeks 1-6. Focus on heuristic evaluation and user research methods.',
        due: '2026-03-24',
        time: null,
        location: { type: 'fixed', label: 'Library' },
        repeat: null,
        subtasks: [
            { id: 's1', label: 'Review week 1-3 slides',     done: true,  ai: true  },
            { id: 's2', label: 'Review week 4-6 slides',     done: false, ai: true  },
            { id: 's3', label: 'Complete practice questions', done: false, ai: false },
            { id: 's4', label: 'Make summary sheet',          done: false, ai: false },
        ],
    },
    {
        id: '2',
        name: 'Grocery Shopping',
        priority: 'med',
        effort: 1,
        status: 'todo',
        description: 'Weekly grocery run. Check the fridge before leaving.',
        due: '2026-03-22',
        time: null,
        location: { type: 'place', label: 'Superstore' },
        repeat: { frequency: 'weekly', days: ['Tuesday'] },
        subtasks: [
            { id: 's1', label: 'Check pantry inventory', done: true,  ai: false },
            { id: 's2', label: 'Write shopping list',    done: true,  ai: false },
            { id: 's3', label: 'Buy groceries',          done: false, ai: false },
        ],
    },
    {
        id: '3',
        name: 'Write CMPT376W Essay',
        priority: 'high',
        effort: 4,
        status: 'todo',
        description: '1200 word essay on Vibe Coding definition. Needs IEEE citations.',
        due: '2026-03-27',
        time: null,
        location: { type: 'flexible', label: 'Anywhere' },
        repeat: null,
        subtasks: [
            { id: 's1', label: 'Research topic',        done: false, ai: true  },
            { id: 's2', label: 'Write outline',         done: false, ai: true  },
            { id: 's3', label: 'Draft introduction',    done: false, ai: false },
            { id: 's4', label: 'Write body paragraphs', done: false, ai: false },
            { id: 's5', label: 'Add IEEE citations',    done: false, ai: false },
            { id: 's6', label: 'Proofread and submit',  done: false, ai: false },
        ],
    },
    {
        id: '4',
        name: 'Make Doctor Appointment',
        priority: 'med',
        effort: 1,
        status: 'todo',
        description: 'Book annual checkup. Call before 4pm on weekdays.',
        due: '2026-03-25',
        time: '14:00',
        location: { type: 'place', label: 'Medical Clinic' },
        repeat: { frequency: 'yearly', label: 'Annual Checkup' },
        subtasks: [
            { id: 's1', label: 'Find clinic phone number', done: false, ai: false },
            { id: 's2', label: 'Call and book',            done: false, ai: false },
            { id: 's3', label: 'Add to calendar',          done: false, ai: false },
        ],
    },
    {
        id: '5',
        name: 'Pick Up Textbooks',
        priority: 'low',
        effort: 1,
        status: 'todo',
        description: 'Pick up reserved textbooks from the SFU bookstore before they release the hold.',
        due: '2026-03-23',
        time: '11:00',
        location: { type: 'place', label: 'SFU Bookstore' },
        repeat: null,
        subtasks: [],
    },
    {
        id: '6',
        name: 'Pick Up Birthday Present',
        priority: 'high',
        effort: 1,
        status: 'todo',
        description: "Pick up Mia's birthday gift from the mall. It's already paid for, just needs collection.",
        due: '2026-03-23',
        time: '15:30',
        location: { type: 'place', label: 'Metropolis at Metrotown' },
        repeat: null,
        subtasks: [
            { id: 's1', label: 'Confirm store has order ready', done: false, ai: false },
            { id: 's2', label: 'Pick up gift',                  done: false, ai: false },
            { id: 's3', label: 'Wrap gift',                     done: false, ai: false },
        ],
    },
    {
        id: '7',
        name: 'Morning Run',
        priority: 'low',
        effort: 3,
        status: 'todo',
        description: '5km loop around the park. Track with Strava.',
        due: '2026-03-22',
        time: '07:00',
        location: { type: 'outdoor', label: 'Tynehead Park' },
        repeat: { frequency: 'custom', days: ['Monday', 'Wednesday', 'Friday'] },
        subtasks: [],
    },
    {
        id: '8',
        name: 'Team Project Check-in',
        priority: 'med',
        effort: 1,
        status: 'todo',
        description: 'Weekly sync with group for CMPT372 project. Discuss sprint progress and blockers.',
        due: '2026-03-26',
        time: '13:00',
        location: { type: 'fixed', label: 'SFU AQ 3149' },
        repeat: { frequency: 'weekly', days: ['Thursday'] },
        subtasks: [
            { id: 's1', label: 'Prepare progress update', done: false, ai: false },
            { id: 's2', label: "Review others' PRs",       done: false, ai: false },
        ],
    },
]

const useTaskStore = create(
    persist(
        (set) => ({
            tasks: SEED_TASKS,
            pendingDeleteIds: [],

            // Add a new task — id is generated here so callers don't have to
            addTask: (task) => set((s) => ({
                tasks: [
                    ...s.tasks,
                    { ...task, id: crypto.randomUUID() },
                ],
            })),

            // Merge partial changes into a task
            updateTask: (id, changes) => set(state => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...changes } : t)
            })),

            // Remove a task entirely
            deleteTask: (id) => set((s) => ({
                tasks: s.tasks.filter((t) => t.id !== id),
                pendingDeleteIds: s.pendingDeleteIds.filter(i => i !== id),
            })),

            // Hide task immediately (shows toast, deletes on expire)
            softDeleteTask: (id) => set((s) => ({
                pendingDeleteIds: [...s.pendingDeleteIds, id],
            })),

            // Cancel soft delete (undo)
            cancelSoftDelete: (id) => set((s) => ({
                pendingDeleteIds: s.pendingDeleteIds.filter(i => i !== id),
            })),

            // Toggle between 'todo' and 'completed'
            // 'in-progress' tasks are treated as 'todo' for the toggle
            toggleComplete: (id) => set((s) => ({
                tasks: s.tasks.map((t) =>
                    t.id === id
                        ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
                        : t
                ),
            })),

            // Flip a single subtask's done flag, then auto-derive task status
            toggleSubtask: (taskId, subtaskId) => set((s) => ({
                tasks: s.tasks.map((t) => {
                    if (t.id !== taskId) return t
                    const updatedSubtasks = t.subtasks.map((sub) =>
                        sub.id === subtaskId ? { ...sub, done: !sub.done } : sub
                    )
                    const total     = updatedSubtasks.length
                    const doneCount = updatedSubtasks.filter(s => s.done).length
                    const status =
                        total === 0        ? t.status            // no subtasks — leave as-is
                            : doneCount === 0  ? 'todo'
                                : doneCount < total ? 'in-progress'
                                    : 'completed'
                    return { ...t, subtasks: updatedSubtasks, status }
                }),
            })),

            // Add a new subtask to a task
            addSubtask: (taskId, label) => set((s) => ({
                tasks: s.tasks.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            subtasks: [
                                ...t.subtasks,
                                { id: crypto.randomUUID(), label, done: false, ai: false },
                            ],
                        }
                        : t
                ),
            })),

            // Remove a subtask from a task
            removeSubtask: (taskId, subtaskId) => set((s) => ({
                tasks: s.tasks.map((t) =>
                    t.id === taskId
                        ? { ...t, subtasks: t.subtasks.filter((sub) => sub.id !== subtaskId) }
                        : t
                ),
            })),

            // Reset tasks back to seed data — useful for development/testing
            resetToSeed: () => set({ tasks: SEED_TASKS }),
        }),
        {
            name: 'robo-tasks', // localStorage key
        }
    )
)

export default useTaskStore