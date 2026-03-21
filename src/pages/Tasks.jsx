import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTaskStore from '../data/useTaskStore'
import useToastStore from '../data/useToastStore'
import TaskCard from '../components/TaskCard'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import FadeOverlay from '../components/FadeOverlay'
import ConfirmDialog from '../components/ConfirmDialog'
import useSwipeList from '../hooks/useSwipeList'

// Note: these are scrollable pills, not a SegmentedControl — 7 options won't fit
// in a fixed-width control. SegmentedControl is used in Settings instead.
const filters = [
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
    const tasks                                      = useTaskStore(s => s.tasks)
    const { toggleComplete, deleteTask }             = useTaskStore()
    const { show: showToast, dismiss: dismissToast } = useToastStore()
    const [search, setSearch]                        = useState('')
    const [filter, setFilter]                        = useState('all')
    const { getSwipeProps, closeAll }                = useSwipeList()
    const [deletePending, setDeletePending]           = useState(false)
    const [pendingDeleteTask, setPendingDeleteTask]   = useState(null)

    const today = new Date()
        .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        .toUpperCase()

    const filtered = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        switch (filter) {
            case 'today':    return isToday(task.due)
            case 'upcoming': return isUpcoming(task.due)
            case 'done':     return task.status === 'completed'
            case 'low':      return task.priority === 'low'
            case 'medium':   return task.priority === 'med'
            case 'high':     return task.priority === 'high'
            default:         return true
        }
    })

    function handleSwipeDelete(task) {
        closeAll()
        setPendingDeleteTask(task)
    }

    function confirmSwipeDelete() {
        const task = pendingDeleteTask
        setPendingDeleteTask(null)
        setDeletePending(true)

        showToast({
            message:     `"${task.name}" deleted`,
            icon:        <Trash2 size={16} color="var(--color-danger)" />,
            barColor:    'var(--color-danger)',
            actionLabel: 'Undo',
            onAction: () => {
                setDeletePending(false)
                dismissToast()
            },
            onExpire: () => {
                deleteTask(task.id)
                setDeletePending(false)
            },
            duration: 5000,
        })
    }

    return (
        <div
            className="flex flex-col gap-4 pb-24"
            style={{ color: 'var(--color-text)', position: 'relative' }}
            onClick={closeAll}
        >
            {/* fade overlay — dims the list while a swipe-delete is pending */}
            <FadeOverlay visible={deletePending} />

            {/* header */}
            <Header
                subtitle={`TODAY · ${today}`}
                title="Tasks"
                rightAction={
                    <button
                        onClick={e => { e.stopPropagation(); navigate('/tasks/create') }}
                        style={{
                            background: 'var(--color-primary)',
                            border: 'none',
                            borderRadius: '14px',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={22} color="white" strokeWidth={2.5} />
                    </button>
                }
            />

            <div className="flex flex-col gap-4 px-5">

                {/* search */}
                <div onClick={e => e.stopPropagation()}>
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
                                background: filter === f.value ? 'var(--color-primary)' : 'var(--color-surface)',
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
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                        TASKS
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
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
                                onEdit={() => navigate('/tasks/create')}
                            />
                        ))
                    )}
                </div>

            </div>

            {/* swipe-delete confirm */}
            {pendingDeleteTask && (
                <ConfirmDialog
                    icon={<Trash2 size={24} color="var(--color-danger)" />}
                    title="DELETE TASK?"
                    message={`"${pendingDeleteTask.name}" will be permanently removed.`}
                    confirmLabel="Delete Task"
                    confirmVariant="danger"
                    onConfirm={confirmSwipeDelete}
                    onCancel={() => setPendingDeleteTask(null)}
                />
            )}

        </div>
    )
}

export default Tasks