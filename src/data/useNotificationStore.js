// useNotificationStore — API-backed.
// Same public API as before so all consumers are unchanged.

import { create } from 'zustand'
import { api } from './api'

const useNotificationStore = create((set, get) => ({
    notifications: [],

    get hasUnread() {
        return get().notifications.some(n => !n.read)
    },

    get unreadCount() {
        return get().notifications.filter(n => !n.read).length
    },

    // ── bootstrap ────────────────────────────────────────────────────────────
    fetchNotifications: async () => {
        try {
            const notifications = await api.getNotifications()
            set({ notifications })
        } catch { /* silent — non-critical */ }
    },

    // ── actions ──────────────────────────────────────────────────────────────
    markAllRead: async () => {
        const notifications = await api.markAllRead()
        set({ notifications })
    },

    addNotification: async (notification) => {
        const n = await api.addNotification(notification)
        set(s => ({
            notifications: [n, ...s.notifications].slice(0, 50),
        }))
    },

    clearAll: async () => {
        await api.clearNotifications()
        set({ notifications: [] })
    },
}))

export default useNotificationStore
