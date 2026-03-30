import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTaskStore from '../data/useTaskStore'
import TaskCard from '../components/TaskCard'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import useSwipeList from '../hooks/useSwipeList'
import useSwipeDelete from '../hooks/useSwipeDelete'

// Note: these are scrollable pills, not a SegmentedControl — 7 options won't fit
// in a fixed-width control. SegmentedControl is used in Settings instead.
const filters = [
    { label: 'TO-DO',     value: 'active' },
    { label: 'ALL',       value: 'all' },
    { label: 'TODAY',     value: 'today' },
    { label: 'UPCOMING',  value: 'upcoming' },
    { label: 'COMPLETED', value: 'done' },
    { label: 'LOW',       value: 'low' },
    { label: 'MEDIUM',    value: 'medium' },
    { label: 'HIGH',      value: 'high' },
]

function isToday(dateStr) {
    if (!dateStr) return false
    const today = new Date()
    const d = new Date(dateStr + 'T00:00:00')
    return d.toDateString() === today.toDateString()
}

function isUpcoming(dateStr) {
    if (!dateStr) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr + 'T00:00:00')
    return d > today
}

function Tasks() {
    const navigate                                   = useNavigate()
    const allTasks                                   = useTaskStore(s => s.tasks)
    const tasks                                      = useMemo(() => allTasks.filter(t => !t._softDeleted), [allTasks])
    const pendingDeleteIds                           = useTaskStore(s => s.pendingDeleteIds) ?? []
    const { toggleComplete }                         = useTaskStore()
    const [search, setSearch]                        = useState('')
    const [filter, setFilter]                        = useState('active')
    const { getSwipeProps, closeAll }                = useSwipeList()
    const { handleSwipeDelete, confirmDialog }       = useSwipeDelete({ closeAll })

    const today = new Date()
        .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        .toUpperCase()

    const filtered = tasks.filter(task => {
        if (pendingDeleteIds.includes(task.id)) return false
        const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        switch (filter) {
            case 'active':   return task.status !== 'completed'
            case 'today':    return isToday(task.due)
            case 'upcoming': return isUpcoming(task.due)
            case 'done':     return task.status === 'completed'
            case 'low':      return task.priority === 'low'
            case 'medium':   return task.priority === 'med'
            case 'high':     return task.priority === 'high'
            default:         return true
        }
    }).sort((a, b) => {
        const aComplete = a.status === 'completed' ? 1 : 0
        const bComplete = b.status === 'completed' ? 1 : 0
        return aComplete - bComplete
    })

    return (
        <div
            style={{ color: 'var(--color-text-main)', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '16px' }}
            onClick={closeAll}
        >
            {/* header */}
            <Header
                subtitle={`TODAY · ${today}`}
                title="Tasks"
                onBack={() => navigate(-1)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 20px' }}>

                {/* search */}
                <div onClick={e => e.stopPropagation()} style={{ paddingBottom: '8px' }}>
                    <SearchBar value={search} onChange={setSearch} />
                </div>

                {/* filter pills */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        padding: '0 2px 2px',
                    }}
                >
                    {filters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            style={{
                                background: filter === f.value ? 'var(--color-primary)' : 'var(--color-card)',
                                color: filter === f.value ? 'white' : 'var(--color-text-muted)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '2px', background: 'var(--color-divider)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                        TASKS
                    </span>
                    <div style={{ flex: 1, height: '2px', background: 'var(--color-divider)' }} />
                </div>

                {/* task list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 2px' }}>
                    {filtered.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                            No tasks found
                        </p>
                    ) : (
                        filtered.map(task => (
                            <TaskCard
                                key={task.id}
                                title={task.name}
                                due={task.due}
                                time={task.time}
                                priority={task.priority}
                                subtasks={task.subtasks}
                                completed={task.status === 'completed'}
                                onComplete={() => toggleComplete(task.id)}
                                {...getSwipeProps(task.id)}
                                onClick={() => navigate(`/tasks/${task.id}`)}
                                onDelete={() => handleSwipeDelete(task)}
                                onEdit={() => navigate('/tasks/create', { state: { editId: task.id } })}
                            />
                        ))
                    )}
                </div>

            </div>

            {confirmDialog}

            {/* ── FAB ──────────────────────────────────────────────────── */}
            <div style={{ position: 'sticky', bottom: '16px', display: 'flex', justifyContent: 'flex-end', paddingRight: '20px', marginTop: 'auto', pointerEvents: 'none', zIndex: 99 }}>
                <button
                    onClick={e => { e.stopPropagation(); navigate('/tasks/create') }}
                    style={{
                        pointerEvents: 'auto',
                        background: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: '14px',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                    }}
                >
                    <Plus size={24} color="white" strokeWidth={2.5} />
                </button>
            </div>

        </div>
    )
}

export default Tasks