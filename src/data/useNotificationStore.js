// useNotificationStore
// Manages in-app notifications state.
// TODO: Notification — wire up real notification sources when ready.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [
                {
                    id: 1,
                    title: "Notification Example",
                    body: "This is an example, yay",
                    createdAt: new Date(),
                },
            ],   // { id, title, body, read, createdAt }

            // TODO: Notification — add real notifications from task reminders, streaks, etc.
            get hasUnread() {
                return get().notifications.some(n => !n.read)
            },

            get unreadCount() {
                return get().notifications.filter(n => !n.read).length
            },

            markAllRead: () => set(s => ({
                notifications: s.notifications.map(n => ({ ...n, read: true }))
            })),

            addNotification: (notification) => set(s => ({
                notifications: [
                    { id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString(), ...notification },
                    ...s.notifications,
                ].slice(0, 50) // keep last 50
            })),

            clearAll: () => set({ notifications: [] }),
        }),
        { name: 'robo-notifications' }
    )
)

export default useNotificationStore