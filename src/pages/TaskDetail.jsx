import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, MapPin, Repeat, Clock, Trash2 } from 'lucide-react'
import { priority as priorityMap } from '../data/priority'
import Chip from '../components/Chip'
import Button from '../components/Button'

function TaskDetail() {
    const navigate = useNavigate()
    const location = useLocation()
    const task = location.state?.task

    const [subtasks, setSubtasks] = useState(task?.subtasks || [])

    if (!task) {
        return (
            <div className="p-6" style={{ color: 'var(--color-text)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                    ← Back
                </button>
                <p>Task not found.</p>
            </div>
        )
    }

    const p = priorityMap[task.priority]

    function toggleSubtask(id) {
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
    }

    const completedCount = subtasks.filter(s => s.done).length

    return (
        <div className="page flex flex-col pb-24" style={{ color: 'var(--color-text)' }}>

            {/* header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-surface-alt)',
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <ChevronLeft size={18} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Tasks</span>
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}>
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-5 p-5">

                {/* title + priority */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, flex: 1 }}>{task.name}</h1>
                        <span style={{
                            background: `color-mix(in srgb, ${p.color} 15%, transparent)`,
                            color: p.color,
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                        }}>
              {p.label}
            </span>
                    </div>
                    {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map(tag => <Chip key={tag.label} label={tag.label} color={tag.color} />)}
                        </div>
                    )}
                </div>

                {/* meta row */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}>
                    {/* due date + time */}
                    <div className="flex items-center gap-3">
                        <Clock size={15} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {task.due}{task.time ? ` · ${task.time}` : ''}
            </span>
                    </div>

                    {/* location */}
                    {task.location && (
                        <div className="flex items-center gap-3">
                            <MapPin size={15} color="var(--color-text-muted)" />
                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {task.location.label}
              </span>
                        </div>
                    )}

                    {/* repeat */}
                    {task.repeat && (
                        <div className="flex items-center gap-3">
                            <Repeat size={15} color="var(--color-text-muted)" />
                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {task.repeat.frequency === 'custom'
                    ? task.repeat.days.join(', ')
                    : task.repeat.label || task.repeat.frequency}
              </span>
                        </div>
                    )}

                    {/* effort */}
                    <div className="flex items-center gap-3">
                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginLeft: '2px' }}>Effort:</span>
                        <span style={{ fontSize: '13px', color: 'var(--color-text)', textTransform: 'capitalize' }}>
              {task.effort}
            </span>
                    </div>
                </div>

                {/* description */}
                {task.description && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: 0 }}>
                            NOTES
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                            {task.description}
                        </p>
                    </div>
                )}

                {/* subtasks */}
                {subtasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="flex items-center justify-between">
                            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: 0 }}>
                                SUBTASKS
                            </p>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {completedCount} / {subtasks.length} done
              </span>
                        </div>

                        {/* progress bar */}
                        <div style={{ background: 'var(--color-surface-alt)', borderRadius: '999px', height: '4px' }}>
                            <div style={{
                                width: `${(completedCount / subtasks.length) * 100}%`,
                                height: '100%',
                                background: 'var(--color-primary)',
                                borderRadius: '999px',
                                transition: 'width 0.3s ease',
                            }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {subtasks.map(subtask => (
                                <button
                                    key={subtask.id}
                                    onClick={() => toggleSubtask(subtask.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 4px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--color-surface-alt)',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '6px',
                                        border: `2px solid ${subtask.done ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`,
                                        background: subtask.done ? 'var(--color-primary)' : 'none',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}>
                                        {subtask.done && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{
                                        fontSize: '14px',
                                        color: subtask.done ? 'var(--color-text-muted)' : 'var(--color-text)',
                                        textDecoration: subtask.done ? 'line-through' : 'none',
                                        transition: 'all 0.15s',
                                    }}>
                    {subtask.label}
                  </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <Button label="Start Task" variant="primary" />
                    <Button label="Delete Task" variant="destructive" />
                </div>

            </div>
        </div>
    )
}

export default TaskDetail