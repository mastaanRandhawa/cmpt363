// useOnboardingStore.js
// Manages the onboarding walkthrough state.
// Trigger via the Help page "Take the Tour" button.
//
// Each step defines:
//   route       — the app route to navigate to when this step activates
//   selector    — CSS selector for the element to spotlight (null = full dark overlay)
//   tooltipSide — 'below' | 'above' | 'center'
//   title       — heading text
//   body        — description text
//   isLast      — true on the final step (changes CTA to "Get Started")

import { create } from 'zustand'

export const ONBOARDING_STEPS = [
    // ── 0. Welcome splash ────────────────────────────────────────────────────
    {
        route:       '/',
        selector:    null,
        tooltipSide: 'center',
        title:       'Welcome to RoboPlan!',
        body:        "You've got tasks to crush. Let's take a 60-second tour so you know where everything lives.",
    },

    // ── 1. Home header ───────────────────────────────────────────────────────
    {
        route:       '/',
        selector:    '[data-onboarding="home-header"]',
        tooltipSide: 'below',
        title:       'Your Daily Overview',
        body:        "Today's date, your greeting, and notification shortcuts live up here — always at a glance.",
    },

    // ── 2. AI recommendation card ────────────────────────────────────────────
    {
        route:       '/',
        selector:    '[data-onboarding="rec-section"]',
        tooltipSide: 'below',
        title:       'AI Task Recommendation',
        body:        'Robo reads your tasks and suggests the single best task to tackle right now, with a reason why. This unlocks at Robo Level 2.',
    },

    // ── 3. Up Next ───────────────────────────────────────────────────────────
    {
        route:       '/',
        selector:    '[data-onboarding="up-next-section"]',
        tooltipSide: 'above',
        title:       '"Up Next" Priorities',
        body:        'High-priority and overdue tasks surface here automatically — no hunting through your list required. If location is enabled, tasks based on location will also show here!',
    },

    // ── 4. Bottom nav bar ────────────────────────────────────────────────────
    {
        route:       '/',
        selector:    '[data-onboarding="bottom-nav"]',
        tooltipSide: 'above',
        title:       'Navigate the App',
        body:        'Jump between Home, Tasks, Calendar, Robo, and More from the navigation bar at any time.',
    },

    // ── 5. Tasks page header ─────────────────────────────────────────────────
    {
        route:       '/tasks',
        selector:    '[data-onboarding="tasks-header"]',
        tooltipSide: 'below',
        title:       'Your Full Task List',
        body:        'Filter by status or priority, search for anything, or swipe a card left to delete / right to edit. Everything is here.',
    },

    // ── 6. Create (+) button ─────────────────────────────────────────────────
    {
        route:       '/tasks',
        selector:    '[data-onboarding="tasks-fab"]',
        tooltipSide: 'above',
        title:       'Create a Task',
        body:        'Tap the + to add a task. Give it a name, due date, priority level, and subtasks. At Robo Level 3, he can help you create bite-sized subtasks!',
    },

    // ── 7. Robo page ─────────────────────────────────────────────────────────
    {
        route:       '/robo',
        selector:    null,
        tooltipSide: 'center',
        title:       'Meet Robo',
        body:        'Your AI companion. Complete tasks to earn XP and level up — each level unlocks smarter superpowers.',
    },

    // ── 8. Done ──────────────────────────────────────────────────────────────
    {
        route:       '/',
        selector:    null,
        tooltipSide: 'center',
        title:       "You're all set!",
        body:        "You know the ropes. Time to get things done. You've got this - and when you need a hand, Robo is close by!",
        isLast:      true,
    },
]

const useOnboardingStore = create((set, get) => ({
    active: false,
    step:   0,

    /** Start the tour from step 0 */
    start: () => set({ active: true, step: 0 }),

    /** Advance to next step, or close on the last one */
    next: () => {
        const { step } = get()
        if (step < ONBOARDING_STEPS.length - 1) {
            set({ step: step + 1 })
        } else {
            set({ active: false, step: 0 })
        }
    },

    /** Go back one step */
    prev: () => {
        const { step } = get()
        if (step > 0) set({ step: step - 1 })
    },

    /** Dismiss the tour immediately */
    finish: () => set({ active: false, step: 0 }),
}))

export default useOnboardingStore
