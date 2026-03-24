import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, ChevronUp, Command, HelpCircle, Plus, RefreshCw } from 'lucide-react'
import Header from '../components/Header'
import TaskCard from '../components/TaskCard'
import useTaskStore from '../data/useTaskStore'
import useRoboStore, { levelFromXp } from '../data/useRoboStore'
import useToastStore from '../data/useToastStore'
import useNotificationStore from '../data/useNotificationStore'
import { getRecommendedTask } from '../data/taskRecommendation'

function isToday(dateStr) {
    if (!dateStr) return false
    const d = new Date(dateStr + 'T00:00:00')
    return d.toDateString() === new Date().toDateString()
}

function isOverdue(dateStr) {
    if (!dateStr) return false
    const today = new Date(); today.setHours(0,0,0,0)
    return new Date(dateStr + 'T00:00:00') < today
}

function isSoon(dateStr) {
    if (!dateStr) return false
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = (new Date(dateStr + 'T00:00:00') - today) / 86400000
    return diff >= 0 && diff <= 3
}

function Home() {
    const navigate = useNavigate()
    const tasks                              = useTaskStore(s => s.tasks)
    const pendingDeleteIds                   = useTaskStore(s => s.pendingDeleteIds) ?? []
    const { toggleComplete, updateTask }     = useTaskStore()
    const { show: showToast, dismiss: dismissToast } = useToastStore()

    const xp       = useRoboStore(s => s.xp)
    const streak   = useRoboStore(s => s.streak)
    const mood     = useRoboStore(s => s.mood)
    const moodDate = useRoboStore(s => s.moodDate)
    const level    = levelFromXp(xp)

    // TODO: Notification — wire up real notifications when system is built
    const notifications = useNotificationStore(s => s.notifications)
    const hasUnread     = notifications.some(n => !n.read)
    const hasAny        = notifications.length > 0

    const hour     = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
    const dateStr  = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
    const today    = new Date().toISOString().slice(0, 10)
    const moodToday = moodDate === today ? mood : null

    // ── streak toast on mount ──────────────────────────────────────────────────
    useEffect(() => {
        if (streak < 2) return
        const msgs = {
            2: `2 day streak! Keep the momentum going 🔥`,
            3: `3 days in a row! You're on a roll 🔥`,
            5: `5 day streak! You're crushing it 🔥`,
            7: `One full week! Outstanding! 🏆`,
            14: `Two week streak! You're unstoppable 🏆`,
            30: `30 days! Legend status achieved 🌟`,
        }
        const msg = msgs[streak] ?? (streak % 10 === 0 ? `${streak} day streak! Incredible 🔥` : null)
        if (msg) setTimeout(() => showToast({ message: msg, barColor: 'var(--color-accent)', duration: 4000 }), 800)
    }, []) // eslint-disable-line

    // ── recommendation ────────────────────────────────────────────────────────
    const [rec, setRec]                       = useState(null)
    const [recLoading, setRecLoading]         = useState(false)
    const [recDismissed, setRecDismissed]     = useState(false)
    const [recOpen, setRecOpen]               = useState(true)

    const incompleteTasks = tasks.filter(t =>
        t.status !== 'completed' && !pendingDeleteIds.includes(t.id)
    )

    const fetchRecommendation = useCallback(async () => {
        if (incompleteTasks.length === 0) return
        setRecLoading(true)
        setRec(null)
        try {
            const result = await getRecommendedTask({ tasks: incompleteTasks, moodIndex: moodToday, streak })
            setRec(result)
        } finally {
            setRecLoading(false)
        }
    }, [incompleteTasks.length, moodToday, streak]) // eslint-disable-line

    useEffect(() => { fetchRecommendation() }, []) // eslint-disable-line

    const recTask = rec ? tasks.find(t => t.id === rec.taskId) : null

    // ── up next (max 3, high priority / soon / overdue) ───────────────────────
    const upNext = incompleteTasks
        .filter(t => t.id !== rec?.taskId)
        .filter(t => t.priority === 'high' || isToday(t.due) || isOverdue(t.due) || isSoon(t.due))
        .sort((a, b) => {
            const score = t => {
                let s = 0
                if (t.priority === 'high') s += 10
                if (t.priority === 'med')  s += 5
                if (isOverdue(t.due))      s += 8
                if (isToday(t.due))        s += 6
                if (isSoon(t.due))         s += 3
                return s
            }
            return score(b) - score(a)
        })
        .slice(0, 3)

    function handleComplete(task) {
        const orig = task.subtasks
        updateTask(task.id, { subtasks: task.subtasks.map(s => ({ ...s, done: true })) })
        toggleComplete(task.id)
        if (rec?.taskId === task.id) setRec(null)
        showToast({
            message: `"${task.name}" completed`,
            barColor: 'var(--color-primary)',
            actionLabel: 'Undo',
            onAction: () => { toggleComplete(task.id); updateTask(task.id, { subtasks: orig }); dismissToast() },
            onExpire: () => {},
            duration: 5000,
        })
    }

    return (
        <div style={{ color: 'var(--color-text)', paddingBottom: '96px' }}>

            <Header
                subtitle={`TODAY · ${dateStr}`}
                title={`${greeting}, Bob!`}
                rightAction={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* TODO: Notification — bell hidden until notifications exist */}
                        {hasAny && (
                            <button
                                onClick={() => navigate('/notifications')}
                                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                            >
                                <Bell size={20} color={hasUnread ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
                                {hasUnread && (
                                    <span style={{
                                        position: 'absolute', top: '2px', right: '2px',
                                        width: '7px', height: '7px', borderRadius: '50%',
                                        background: 'var(--color-danger)',
                                        border: '1.5px solid var(--color-bg)',
                                    }} />
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/robo')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                border: 'none', borderRadius: '20px', padding: '6px 11px',
                                color: 'var(--color-primary)', fontWeight: 700, fontSize: '12px',
                                cursor: 'pointer', letterSpacing: '0.04em',
                            }}
                        >
                            <Command size={12} /> LV{level} · {xp}XP
                        </button>
                    </div>
                }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '4px 20px 0' }}>

                {/* ── Recommended Now ────────────────────────────────────── */}
                <div style={{ marginBottom: '24px' }}>
                    {!recDismissed ? (
                        <>
                            {/* collapsible header */}
                            <button
                                onClick={() => setRecOpen(v => !v)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 12px',
                                }}
                            >
                                {recOpen
                                    ? <ChevronDown size={14} color="var(--color-primary)" />
                                    : <ChevronUp   size={14} color="var(--color-primary)" />
                                }
                                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-primary)' }}>
                                    RECOMMENDED NOW
                                </span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)', marginLeft: '4px' }} />
                            </button>

                            {recOpen && (
                                <div style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-surface-alt)',
                                    borderRadius: '16px', padding: '18px 18px 14px',
                                }}>
                                    {recLoading ? (
                                        <SkeletonLoader />
                                    ) : recTask ? (
                                        <>
                                            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                {recTask.name}
                                            </h2>
                                            <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                {recTask.effort ? `Est. ${recTask.effort * 15} min` : ''}
                                                {recTask.effort && recTask.priority ? ' · ' : ''}
                                                {recTask.priority ? `${recTask.priority.charAt(0).toUpperCase() + recTask.priority.slice(1)} Priority` : ''}
                                            </p>
                                            <div style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '6px',
                                                background: 'var(--color-surface-alt)', borderRadius: '20px',
                                                padding: '7px 12px', marginBottom: '16px',
                                            }}>
                                                <HelpCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} color="var(--color-text-muted)" />
                                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                                                    {rec.reason}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setRecDismissed(true)}
                                                    style={{
                                                        flex: 1, padding: '10px', background: 'none',
                                                        border: '1.5px solid var(--color-surface-alt)',
                                                        borderRadius: '12px', color: 'var(--color-text-muted)',
                                                        fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                                    }}
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/tasks/${recTask.id}`)}
                                                    style={{
                                                        flex: 2, padding: '10px', background: 'var(--color-primary)',
                                                        border: 'none', borderRadius: '12px', color: 'white',
                                                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                                    }}
                                                >
                                                    Task Details
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', margin: '8px 0' }}>
                                            No recommendation available
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* dismissed — compact re-suggest button */
                        <button
                            onClick={() => { setRecDismissed(false); fetchRecommendation() }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                background: 'var(--color-surface)',
                                border: '1px dashed var(--color-surface-alt)',
                                borderRadius: '12px', padding: '10px 16px',
                                color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Command size={13} color="var(--color-primary)" />
                            <span>Get a task suggestion</span>
                            <RefreshCw size={12} style={{ marginLeft: 'auto' }} />
                        </button>
                    )}
                </div>

                {/* ── Up Next ────────────────────────────────────────────── */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <ChevronDown size={14} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                            UP NEXT
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)', marginLeft: '4px' }} />
                        <button
                            onClick={() => navigate('/tasks/create')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: 0 }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {upNext.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', margin: '24px 0' }}>
                            You're all caught up 🎉
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {upNext.map(task => (
                                <TaskCard
                                    key={task.id}
                                    title={task.name}
                                    due={task.due}
                                    time={task.time}
                                    priority={task.priority}
                                    subtasks={task.subtasks}
                                    completed={task.status === 'completed'}
                                    onComplete={() => handleComplete(task)}
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {incompleteTasks.length > upNext.length + (recTask ? 1 : 0) && (
                        <button
                            onClick={() => navigate('/tasks')}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '4px', width: '100%', marginTop: '16px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600,
                                letterSpacing: '0.04em',
                            }}
                        >
                            See all {incompleteTasks.length} tasks
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}

function SkeletonLoader() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
            {[['70%','22px'], ['40%','14px'], ['90%','32px']].map(([w, h], i) => (
                <div key={i} style={{ height: h, width: w, background: 'var(--color-surface-alt)', borderRadius: '6px', animation: `pulse 1.4s ease ${i * 0.15}s infinite` }} />
            ))}
        </div>
    )
}

export default Home