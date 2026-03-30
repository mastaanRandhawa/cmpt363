import { useEffect } from 'react'
import { BellOff } from 'lucide-react'
import Header from '../components/Header'
import { Section } from '../components/Section'
import useNotificationStore from '../data/useNotificationStore'
import { useNavigate } from 'react-router-dom'

const POLL_INTERVAL_MS = 15000

function formatTime(iso) {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1)   return 'Just now'
    if (diffMins < 60)  return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7)   return `${diffDays}d ago`
    return date.toLocaleDateString()
}

function NotificationCard({ notification }) {
    const { title, body, read, createdAt } = notification

    return (
        <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--color-divider)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            opacity: read ? 0.5 : 1,
            transition: 'opacity 0.2s',
        }}>
            {/* unread dot */}
            <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: read ? 'transparent' : 'var(--color-primary)',
                flexShrink: 0,
                marginTop: 5,
            }} />

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                    marginBottom: 2,
                }}>
                    <span style={{
                        fontSize: 14,
                        fontWeight: read ? 400 : 600,
                        color: 'var(--color-text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {title}
                    </span>
                    <span style={{
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        flexShrink: 0,
                    }}>
                        {formatTime(createdAt)}
                    </span>
                </div>
                <p style={{
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    lineHeight: 1.4,
                }}>
                    {body}
                </p>
            </div>
        </div>
    )
}

export default function Notifications() {
    const notifications      = useNotificationStore(s => s.notifications)
    const fetchNotifications = useNotificationStore(s => s.fetchNotifications)
    const markAllRead        = useNotificationStore(s => s.markAllRead)
    const navigate   = useNavigate()
    useEffect(() => {
        fetchNotifications().then(() => {
            setTimeout(markAllRead, 1500)
        })
        const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [fetchNotifications, markAllRead])

    const unread = notifications.filter(n => !n.read)
    const read   = notifications.filter(n =>  n.read)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Header title="Notifications"
                    onBack={() => navigate(-1)}
            />

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {unread.length > 0 && (
                            <Section header="UNREAD" style={{ padding: '8px 20px 0' }}>
                                {unread.map(n => (
                                    <NotificationCard key={n.id} notification={n} />
                                ))}
                            </Section>
                        )}

                        {read.length > 0 && (
                            <Section
                                header="READ"
                                style={{ padding: '8px 20px 0' }}
                                collapsible={read.length > 3}
                            >
                                {read.map(n => (
                                    <NotificationCard key={n.id} notification={n} />
                                ))}
                            </Section>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            height: '60%',
            color: 'var(--color-text-muted)',
        }}>
            <BellOff size={36} strokeWidth={1.5} />
            <p style={{ margin: 0, fontSize: 14 }}>No notifications yet</p>
        </div>
    )
}