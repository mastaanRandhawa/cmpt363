import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Pencil, Plus, MapPin, Repeat, Trash2, Play, CheckCircle } from 'lucide-react'
import { priority as priorityMap } from '../data/priority'
import Header from '../components/Header'

function TaskDetail() {
    const navigate = useNavigate()
    const location = useLocation()
    const task = location.state?.task

    const [subtasks, setSubtasks]                               = useState(task?.subtasks || [])
    const [newSubtask, setNewSubtask]                           = useState('')
    const [addingSubtask, setAddingSubtask]                     = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm]             = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm]         = useState(false)
    const [isComplete, setIsComplete]                           = useState(false)
    const [showUndoToast, setShowUndoToast]                     = useState(false)
    const [undoProgress, setUndoProgress]                       = useState(100)
    const [undoTimer, setUndoTimer]                                     = useState(null)
    const [deleted, setDeleted]                                 = useState(false)
    const [showDeletedToast, setShowDeletedToast]               = useState(false)
    const [deleteProgress, setDeleteProgress]                   = useState(100)
    const [deleteTimer, setDeleteTimer]                                 = useState(null)

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

   if (deleted) {
        return (
            <div className="flex flex-col" style={{ color: 'var(--color-text)', minHeight: '100%', background: 'var(--color-bg)', position: 'relative' }}>
                <Header
                    subtitle="TASKS"
                    title="Task Deleted"
                    onBack={() => navigate('/tasks')}
                />
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px',
                    marginTop: '80px',
                }}>
                    <div style={{
                        background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
                        borderRadius: '999px', width: '72px', height: '72px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Trash2 size={32} color="var(--color-danger)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center' }}>
                        Task Deleted
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                        "{task.name}" has been permanently removed.
                    </p>
                    <button
                        onClick={() => navigate('/tasks')}
                        style={{
                            marginTop: '16px', padding: '14px 32px',
                            background: 'var(--color-primary)', border: 'none',
                            borderRadius: '14px', color: 'white',
                            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                        }}
                    >
                        Back to Tasks
                    </button>
                </div>

                {/* delete undo toast */}
                {showDeletedToast && (
                    <div style={{
                        position: 'absolute',
                        bottom: '90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--color-surface)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                        zIndex: 100,
                        whiteSpace: 'nowrap',
                        border: '1px solid var(--color-surface-alt)',
                        minWidth: '260px',
                    }}>
                        <div style={{ height: '3px', background: 'var(--color-surface-alt)' }}>
                            <div style={{
                                height: '100%',
                                width: `${deleteProgress}%`,
                                background: 'var(--color-danger)',
                                transition: 'width 0.05s linear',
                            }} />
                        </div>
                        <div style={{
                            padding: '14px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <Trash2 size={16} color="var(--color-danger)" />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>
              Task deleted
            </span>
                            <button
                                onClick={handleUndoDelete}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px',
                                    padding: 0,
                                }}
                            >
                                Undo
                            </button>
                        </div>
                    </div>
                )}

            </div>
        )
    }

    const p = priorityMap[task.priority]
    const completedCount = subtasks.filter(s => s.done).length

    function toggleSubtask(id) {
        setSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
    }

    function deleteSubtask(id) {
        setSubtasks(prev => prev.filter(s => s.id !== id))
    }

    function addSubtask() {
        if (!newSubtask.trim()) return
        setSubtasks(prev => [...prev, { id: `s${Date.now()}`, label: newSubtask.trim(), done: false, ai: false }])
        setNewSubtask('')
        setAddingSubtask(false)
    }

    function formatDate(dateStr) {
        if (!dateStr) return null
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    function handleComplete() {
        const allDone = subtasks.length === 0 || completedCount === subtasks.length
        if (!allDone) { setShowCompleteConfirm(true); return }
        markComplete()
    }

    function markComplete() {
        setShowCompleteConfirm(false)
        setIsComplete(true)
        setSubtasks(prev => prev.map(s => ({ ...s, done: true })))
        setShowUndoToast(true)
        setUndoProgress(100)

        const duration = 5000
        const interval = 50
        const steps = duration / interval
        let current = steps

        const progressTimer = setInterval(() => {
            current -= 1
            setUndoProgress((current / steps) * 100)
            if (current <= 0) clearInterval(progressTimer)
        }, interval)

        const t = setTimeout(() => {
            setShowUndoToast(false)
            clearInterval(progressTimer)
        }, duration)

        setUndoTimer(t)
    }

    function handleUndo() {
        clearTimeout(undoTimer)
        setIsComplete(false)
        setShowUndoToast(false)
        setSubtasks(task.subtasks || [])
    }

    function handleDelete() {
        setShowDeleteConfirm(false)
        setDeleted(true)
        setShowDeletedToast(true)
        setDeleteProgress(100)

        const duration = 5000
        const interval = 50
        const steps = duration / interval
        let current = steps

        const progressTimer = setInterval(() => {
            current -= 1
            setDeleteProgress((current / steps) * 100)
            if (current <= 0) clearInterval(progressTimer)
        }, interval)

        const t = setTimeout(() => {
            setShowDeletedToast(false)
            clearInterval(progressTimer)
        }, duration)

        setDeleteTimer(t)
    }

    function handleUndoDelete() {
        clearTimeout(deleteTimer)
        setShowDeletedToast(false)
        setDeleteProgress(100)
        setDeleted(false)
    }

    const labelStyle = {
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
    }

    return (
        <div className="flex flex-col pb-24" style={{ color: 'var(--color-text)', position: 'relative', minHeight: '100%' }}>

            <Header
                subtitle="TASK DETAILS"
                title={task.name}
                onBack={() => navigate(-1)}
                rightAction={
                    <button onClick={() => navigate('/tasks/create')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                        <Pencil size={18} />
                    </button>
                }
            />

            <div className="flex flex-col gap-5 p-5">

                {/* title + due */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '0.04em' }}>
                        {task.name.toUpperCase()}
                    </h1>
                    {task.due && (
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            Due: {formatDate(task.due)}{task.time ? ` · ${task.time}` : ''}
                        </p>
                    )}
                </div>

                {/* meta chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{
              background: `color-mix(in srgb, ${p.color} 15%, transparent)`,
              color: p.color,
              fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px',
          }}>{p.label}</span>
                    {task.effort && (
                        <span style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>
              EFFORT: {task.effort}
            </span>
                    )}
                    {task.repeat && (
                        <span style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Repeat size={10} />{task.repeat.frequency}
            </span>
                    )}
                    {task.location && (
                        <span style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={10} />{task.location.label}
            </span>
                    )}
                </div>

                {/* notes */}
                {task.description && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <p style={{ ...labelStyle, margin: 0 }}>NOTES OR CONTEXT</p>
                        <div style={{
                            background: 'var(--color-surface)', borderRadius: '14px', padding: '14px',
                            fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)',
                            border: '1.5px solid var(--color-surface-alt)',
                        }}>
                            {task.description}
                        </div>
                    </div>
                )}

                {/* subtasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ ...labelStyle, margin: 0 }}>SUBTASKS</p>
                        {subtasks.length > 0 && (
                            <span style={{
                                fontSize: '14px', fontWeight: 700,
                                color: completedCount === subtasks.length ? 'var(--color-success)' : 'var(--color-text)',
                                transition: 'color 0.3s ease',
                            }}>
                {completedCount === subtasks.length ? 'Complete ✓' : `${completedCount} / ${subtasks.length} done`}
              </span>
                        )}
                    </div>

                    {subtasks.length > 0 && (
                        <div style={{ background: 'var(--color-surface-alt)', borderRadius: '999px', height: '4px' }}>
                            <div style={{
                                width: `${(completedCount / subtasks.length) * 100}%`,
                                height: '100%', background: 'var(--color-primary)',
                                borderRadius: '999px', transition: 'width 0.3s ease',
                            }} />
                        </div>
                    )}

                    <div style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden' }}>
                        {subtasks.map((subtask, i) => (
                            <div
                                key={subtask.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px',
                                    borderBottom: i < subtasks.length - 1 ? '1px solid var(--color-surface-alt)' : 'none',
                                }}
                            >
                                <button
                                    onClick={() => toggleSubtask(subtask.id)}
                                    style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        border: `2px solid ${subtask.done ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`,
                                        background: subtask.done ? 'var(--color-primary)' : 'none',
                                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', fontSize: '10px', fontWeight: 700,
                                        color: subtask.done ? 'white' : 'var(--color-text-muted)',
                                    }}
                                >
                                    {subtask.done ? (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : i + 1}
                                </button>

                                <span style={{
                                    flex: 1, fontSize: '14px',
                                    color: subtask.done ? 'var(--color-text-muted)' : 'var(--color-text)',
                                    textDecoration: subtask.done ? 'line-through' : 'none',
                                    transition: 'all 0.15s',
                                }}>
                  {subtask.label}
                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    {subtask.ai && !subtask.done && (
                                        <span style={{
                                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                                            color: 'var(--color-primary-soft)',
                                            background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                            padding: '2px 6px', borderRadius: '999px',
                                        }}>AI</span>
                                    )}
                                    <button
                                        onClick={() => deleteSubtask(subtask.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0 2px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {addingSubtask ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                                borderTop: subtasks.length > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                            }}>
                                <input
                                    autoFocus
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') addSubtask(); if (e.key === 'Escape') setAddingSubtask(false) }}
                                    placeholder="New subtask..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }}
                                />
                                <button onClick={addSubtask} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>Add</button>
                                <button onClick={() => setAddingSubtask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingSubtask(true)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    padding: '12px', background: 'none', border: 'none',
                                    borderTop: subtasks.length > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                                    cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600,
                                }}
                            >
                                <Plus size={14} />
                                ADD SUBTASK
                            </button>
                        )}
                    </div>
                </div>

                {/* actions */}
                {!isComplete && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button
                            onClick={() => navigate('/timer', { state: { task } })}
                            style={{
                                flex: 1, padding: '14px', background: 'var(--color-primary)',
                                border: 'none', borderRadius: '14px', color: 'white',
                                fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            }}
                        >
                            <Play size={16} />
                            Start
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{
                                flex: 1, padding: '14px', background: 'none',
                                border: '1.5px solid var(--color-danger)', borderRadius: '14px',
                                color: 'var(--color-danger)', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            }}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                        <button
                            onClick={handleComplete}
                            style={{
                                flex: 1, padding: '14px', background: 'none',
                                border: '1.5px solid var(--color-success)', borderRadius: '14px',
                                color: 'var(--color-success)', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                            }}
                        >
                            <CheckCircle size={16} />
                            Complete
                        </button>
                    </div>
                )}

            </div>

            {/* delete overlay */}
            {showDeleteConfirm && (
                <div
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100, padding: '32px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--color-surface)', borderRadius: '24px', padding: '28px 24px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            width: '100%', maxWidth: '320px',
                        }}
                    >
                        <div style={{
                            background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
                            borderRadius: '16px', width: '52px', height: '52px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Trash2 size={24} color="var(--color-danger)" />
                        </div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '0.04em', textAlign: 'center' }}>
                            DELETE TASK?
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                            This task will be removed permanently. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ flex: 1, padding: '14px', background: 'var(--color-surface-alt)', border: 'none', borderRadius: '14px', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{ flex: 1, padding: '14px', background: 'var(--color-danger)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* complete confirm overlay */}
            {showCompleteConfirm && (
                <div
                    onClick={() => setShowCompleteConfirm(false)}
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100, padding: '32px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--color-surface)', borderRadius: '24px', padding: '28px 24px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            width: '100%', maxWidth: '320px',
                        }}
                    >
                        <div style={{
                            background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
                            borderRadius: '16px', width: '52px', height: '52px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckCircle size={24} color="var(--color-accent)" />
                        </div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '0.04em', textAlign: 'center' }}>
                            NOT QUITE DONE?
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                            {completedCount} of {subtasks.length} subtasks are complete. Mark them complete along with the whole task anyway?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
                            <button
                                onClick={() => setShowCompleteConfirm(false)}
                                style={{ flex: 1, padding: '14px', background: 'var(--color-surface-alt)', border: 'none', borderRadius: '14px', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={markComplete}
                                style={{ flex: 1, padding: '14px', background: 'var(--color-success)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                            >
                                Mark Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* undo toast */}
            {showUndoToast && (
                <div style={{
                    position: 'absolute',
                    bottom: '90px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--color-surface-alt)',
                    minWidth: '260px',
                }}>

                    {/* progress bar */}
                    <div style={{ height: '3px', background: 'var(--color-surface-alt)' }}>
                        <div style={{
                            height: '100%',
                            width: `${undoProgress}%`,
                            background: 'var(--color-primary)',
                            transition: 'width 0.05s linear',
                        }} />
                    </div>

                    {/* content */}
                    <div style={{
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}>
                        <CheckCircle size={16} color="var(--color-success)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>
        Task marked complete
      </span>
                        <button
                            onClick={handleUndo}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px',
                                padding: 0,
                            }}
                        >
                            Undo
                        </button>
                    </div>

                </div>
            )}

            {/* delete undo toast */}
            {showDeletedToast && (
                <div style={{
                    position: 'absolute',
                    bottom: '90px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    zIndex: 100,
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--color-surface-alt)',
                    minWidth: '260px',
                }}>

                    {/* progress bar */}
                    <div style={{ height: '3px', background: 'var(--color-surface-alt)' }}>
                        <div style={{
                            height: '100%',
                            width: `${deleteProgress}%`,
                            background: 'var(--color-danger)',
                            transition: 'width 0.05s linear',
                        }} />
                    </div>

                    {/* content */}
                    <div style={{
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}>
                        <Trash2 size={16} color="var(--color-danger)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>
        Task deleted
      </span>
                        <button
                            onClick={handleUndoDelete}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px',
                                padding: 0,
                            }}
                        >
                            Undo
                        </button>
                    </div>

                </div>
            )}


        </div>
    )
}

export default TaskDetail