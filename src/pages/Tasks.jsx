import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { tasks } from '../data/tasks'
import TaskCard from '../components/TaskCard'
import { useNavigate } from 'react-router-dom'

const filters = [
    { label: 'ALL',       value: 'all' },
    { label: 'TODAY',     value: 'today' },
    { label: 'UPCOMING',  value: 'upcoming' },
    { label: 'COMPLETED', value: 'done' },
    { label: 'LOW',       value: 'low' },
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
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [doneTasks, setDoneTasks] = useState([])

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()

    const filtered = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        if (filter === 'all')      return true
        if (filter === 'today')    return isToday(task.due)
        if (filter === 'upcoming') return isUpcoming(task.due)
        if (filter === 'done')     return doneTasks.includes(task.id)
        if (filter === 'low')      return task.priority === 'low'
        return true
    })

    function toggleDone(id) {
        setDoneTasks(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    return (
        <div className="page flex flex-col gap-4 p-5 pb-24" style={{ color: 'var(--color-text)' }}>

            {/* header */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '8px'
            }}>
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: 0 }}>
                        TODAY · {today}
                    </p>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Tasks</h1>
                </div>
                <button
                    onClick={() => navigate('/tasks/create')}
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
                }}>
                    <Plus size={22} color="white" strokeWidth={2.5} />
                </button>
            </div>

            {/* search */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-surface)',
                borderRadius: '12px',
                padding: '10px 14px',
                margin: '0 4px',
            }}>
                <Search size={16} color="var(--color-text-muted)" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text)',
                        fontSize: '14px',
                        flex: 1,
                    }}
                />
            </div>

            {/* filters - scrollable */}
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: '2px',
                padding: '8px',
            }}>
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

            {/* divider + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0 12px 0'}}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>TASKS</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
            </div>

            {/* task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 12px' }}>
                {filtered.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '40px', borderRadius: '16px'}}>
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
                            done={doneTasks.includes(task.id)}
                            onCheck={() => toggleDone(task.id)}
                            onClick={() => navigate(`/tasks/${task.id}`, { state: { task } })}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default Tasks