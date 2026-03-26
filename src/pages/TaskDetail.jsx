import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Plus, MapPin, Repeat, Trash2, CheckCircle, X, GripVertical } from 'lucide-react'
import { priority as priorityMap } from '../data/priority'
import useTaskStore from '../data/useTaskStore'
import useToastStore from '../data/useToastStore'
import Header from '../components/Header'
import CircleCheck from '../components/CircleCheck'
import ProgressBar from '../components/ProgressBar'
import ConfirmDialog from '../components/ConfirmDialog'
import useDragSort from '../hooks/useDragSort'

function TaskDetail() {
    const navigate    = useNavigate()
    const { id }      = useParams()
    const task        = useTaskStore(s => s.tasks.find(t => t.id === id))
    const {
        toggleComplete,
        updateTask,
        deleteTask,
        toggleSubtask,
        addSubtask,
        removeSubtask,
    } = useTaskStore()

    const [newSubtask, setNewSubtask]               = useState('')
    const [addingSubtask, setAddingSubtask]         = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

    const { show: showToast, dismiss: dismissToast } = useToastStore()

    // ─── task not found ───────────────────────────────────────────────────────
    if (!task) {
        return (
            <div className="p-6" style={{ color: 'var(--color-text)' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                >
                    ← Back
                </button>
                <p>Task not found.</p>
            </div>
        )
    }

    // ─── derived state ────────────────────────────────────────────────────────
    const p              = priorityMap[task.priority]
    const rawSubtasks    = task.subtasks ?? []
    const completedCount = rawSubtasks.filter(s => s.done).length
    const isComplete     = task.status === 'completed'

    // Drag-to-reorder — persists order to store on drop
    function setSubtasksOrdered(ordered) {
        updateTask(task.id, { subtasks: ordered })
    }
    const { items: subtasks, getDragProps, dragOverIndex } = useDragSort(rawSubtasks, setSubtasksOrdered)

    // ─── helpers ──────────────────────────────────────────────────────────────
    function formatDate(dateStr) {
        if (!dateStr) return null
        return new Date(dateStr + 'T00:00:00')
            .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    // ─── complete ─────────────────────────────────────────────────────────────
    function handleComplete() {
        const allDone = subtasks.length === 0 || completedCount === subtasks.length
        if (!allDone) { setShowCompleteConfirm(true); return }
        markComplete()
    }

    function markComplete() {
        setShowCompleteConfirm(false)

        // Snapshot original subtasks before marking all done (needed for undo)
        const originalSubtasks = task.subtasks

        updateTask(task.id, { subtasks: subtasks.map(s => ({ ...s, done: true })) })
        toggleComplete(task.id)
        navigate('/tasks')

        showToast({
            message:     `"${task.name}" completed`,
            icon:        <CheckCircle size={16} color="var(--color-success)" />,
            barColor:    'var(--color-primary)',
            actionLabel: 'Undo',
            onAction:    () => {
                toggleComplete(task.id)
                updateTask(task.id, { subtasks: originalSubtasks })
                dismissToast()
            },
            onExpire: () => {},
            duration: 5000,
        })
    }

    // ─── delete ───────────────────────────────────────────────────────────────
    function handleDelete() {
        setShowDeleteConfirm(false)
        const taskId   = task.id
        const taskName = task.name

        navigate('/tasks')

        showToast({
            message:     `"${taskName}" deleted`,
            icon:        <Trash2 size={16} color="var(--color-danger)" />,
            barColor:    'var(--color-danger)',
            onExpire: () => deleteTask(taskId),
            duration: 3000,
        })
    }

    // ─── subtasks ─────────────────────────────────────────────────────────────
    function handleAddSubtask() {
        if (!newSubtask.trim()) return
        addSubtask(task.id, newSubtask.trim())
        setNewSubtask('')
        setAddingSubtask(false)
    }

    const labelStyle = {
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
    }

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col pb-0" style={{ color: 'var(--color-text)', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

            <Header
                title="Task Details"
                subtitle={" "}
                onBack={() => navigate(-1)}
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
                    }}>
                        {p.label}
                    </span>
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
                        <ProgressBar
                            value={completedCount}
                            max={subtasks.length}
                            size="sm"
                            color="var(--color-primary)"
                        />
                    )}

                    <div style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden' }}>
                        {subtasks.map((subtask, i) => (
                            <div
                                key={subtask.id}
                                {...getDragProps(i)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px',
                                    borderBottom: i < subtasks.length - 1 ? '1px solid var(--color-surface-alt)' : 'none',
                                    opacity: dragOverIndex === i ? 0.4 : 1,
                                    transition: 'opacity 0.15s',
                                    cursor: 'grab',
                                }}
                            >
                                <GripVertical size={14} color="var(--color-text-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
                                <CircleCheck
                                    checked={subtask.done}
                                    onChange={() => toggleSubtask(task.id, subtask.id)}
                                    size={22}
                                />

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
                                        }}>
                                            AI
                                        </span>
                                    )}
                                    <button
                                        onClick={() => removeSubtask(task.id, subtask.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0 2px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* add subtask row */}
                        {addingSubtask ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                                borderTop: subtasks.length > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                            }}>
                                <input
                                    autoFocus
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddSubtask()
                                        if (e.key === 'Escape') setAddingSubtask(false)
                                    }}
                                    placeholder="New subtask..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }}
                                />
                                <button onClick={handleAddSubtask} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>Add</button>
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

                <div style={{ height: '16px' }} />

            </div>

            {/* action bar — always at the bottom */}
            <div style={{
                marginTop: 'auto',
                padding: '12px 20px 16px',
                background: 'var(--color-bg)',
                borderTop: '1px solid var(--color-surface-alt)',
                display: 'flex',
                gap: '10px',
            }}>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        flex: 1, padding: '14px',
                        background: 'none',
                        border: '1.5px solid var(--color-danger)',
                        borderRadius: '14px',
                        color: 'var(--color-danger)',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                >
                    <Trash2 size={16} />
                    Delete
                </button>
                <button
                    onClick={() => navigate('/tasks/create', { state: { editId: id }, replace: true })}
                    style={{
                        flex: 1, padding: '14px',
                        background: 'none',
                        border: '1.5px solid var(--color-primary)',
                        borderRadius: '14px',
                        color: 'var(--color-primary)',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                >
                    <Pencil size={16} />
                    Edit
                </button>
                <button
                    onClick={handleComplete}
                    style={{
                        flex: 1, padding: '14px',
                        background: isComplete ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'none',
                        border: '1.5px solid var(--color-success)',
                        borderRadius: '14px',
                        color: 'var(--color-success)',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                >
                    <CheckCircle size={16} />
                    {isComplete ? 'Undo' : 'Complete'}
                </button>
            </div>

            {/* delete confirm */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    icon={<Trash2 size={24} color="var(--color-danger)" />}
                    title="DELETE TASK?"
                    message="This task will be permanently removed."
                    confirmLabel="Delete Task"
                    confirmVariant="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            {/* complete confirm */}
            {showCompleteConfirm && (
                <ConfirmDialog
                    icon={<CheckCircle size={24} color="var(--color-accent)" />}
                    title="NOT QUITE DONE?"
                    message={`${completedCount} of ${subtasks.length} subtasks are complete. Mark everything done anyway?`}
                    confirmLabel="Mark Done"
                    confirmVariant="success"
                    onConfirm={markComplete}
                    onCancel={() => setShowCompleteConfirm(false)}
                />
            )}

        </div>
    )
}

export default TaskDetail