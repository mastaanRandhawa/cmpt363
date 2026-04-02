import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Plus, MapPin, Repeat, Trash2, CheckCircle, X, Gauge, MessageCircle, Timer as TimerIcon } from 'lucide-react'
import { priority as priorityMap, effort as effortMap } from '../data/chipColors'
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

    // ─── drag sort — must be before any early returns (Rules of Hooks) ────────
    function setSubtasksOrdered(ordered) {
        if (task) updateTask(task.id, { subtasks: ordered })
    }
    const { items: subtasks, getDragProps, dragOverIndex } = useDragSort(
        task?.subtasks ?? [],
        setSubtasksOrdered
    )

    // ─── task not found ───────────────────────────────────────────────────────
    if (!task) {
        return (
            <div style={{ height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-main)' }}>
                <Header
                    title="Task Details"
                    onBack={() => navigate('/tasks')}
                />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    textAlign: 'center',
                    gap: '16px'
                }}>
                    <div style={{ fontSize: '48px' }}>🔍</div>
                    <h2 className="h2">Task not found</h2>
                    <p className="body" style={{ color: 'var(--color-text-secondary)' }}>
                        This task may have been deleted or moved.
                    </p>
                    <button
                        onClick={() => navigate('/tasks')}
                        className="label-bold"
                        style={{
                            padding: '12px 24px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Return to Tasks
                    </button>
                </div>
            </div>
        )
    }

    // ─── derived state ────────────────────────────────────────────────────────
    const p = priorityMap[task?.priority] || priorityMap.low;
    const e = effortMap[task?.effort] || effortMap["1"];
    const rawSubtasks    = task.subtasks ?? []
    const completedCount = rawSubtasks.filter(s => s.done).length
    const isComplete     = task.status === 'completed'

    // ─── helpers ──────────────────────────────────────────────────────────────
    function formatDate(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isToday = date.getTime() === today.getTime();

        if (isToday) return 'Today';

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDuration(seconds) {
        if (!seconds || seconds < 60) return null
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`.trim()
        return `${m}m`
    }

    function formatMinutes(mins) {
        if (!mins || mins <= 0) return null
        const h = Math.floor(mins / 60)
        const m = mins % 60
        if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`
        return `${m}m`
    }

    const incompleteSubtasks   = rawSubtasks.filter(s => !s.done)
    const totalEstimatedMins   = rawSubtasks.reduce((sum, s) => sum + (s.estSubtaskTime ?? 0), 0)
    const remainingEstimatedMins = incompleteSubtasks.reduce((sum, s) => sum + (s.estSubtaskTime ?? 0), 0)
    const someComplete         = completedCount > 0 && completedCount < rawSubtasks.length
    const shownEstimate        = someComplete ? remainingEstimatedMins : totalEstimatedMins
    const estimateLabel        = someComplete ? 'remaining' : 'estimated'

    // ─── complete ─────────────────────────────────────────────────────────────
    function handleComplete() {
        const allDone = subtasks.length === 0 || completedCount === subtasks.length
        if (!allDone) { setShowCompleteConfirm(true); return }
        markComplete()
    }

    function markComplete() {
        setShowCompleteConfirm(false);
        const previousStatus = task.status;
        const previousSubtasks = [...task.subtasks];
        const allSubtasksDone = task.subtasks.map(s => ({ ...s, done: true }));
        updateTask(task.id, {
            status: 'completed',
            subtasks: allSubtasksDone
        });

        navigate('/tasks');

        showToast({
            message: `"${task.name}" completed`,
            icon: <CheckCircle size={16} color="var(--color-success)" />,
            barColor: 'var(--color-primary)',
            actionLabel: 'Undo',
            onAction: () => {
                updateTask(task.id, {
                    status: previousStatus,
                    subtasks: previousSubtasks
                });
                dismissToast();
            },
            duration: 5000,
        });
    }

    // ─── delete ───────────────────────────────────────────────────────────────
    function handleDelete() {
        setShowDeleteConfirm(false)
        const taskId   = task.id
        const taskName = task.name

        navigate('/tasks')

        showToast({
            message:     `"${taskName}" deleted`,
            icon:        <Trash2 size={16} color="var(--color-important)" />,
            barColor:    'var(--color-important)',
            actionLabel: 'Undo',
            onAction:    () => { dismissToast(); navigate('/tasks') },
            onExpire:    () => deleteTask(taskId),
            duration:    3000,
        })
    }

    // ─── subtasks ─────────────────────────────────────────────────────────────
    function handleAddSubtask() {
        if (!newSubtask.trim()) return
        addSubtask(task.id, newSubtask.trim())
        setNewSubtask('')
        setAddingSubtask(false)
    }

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ color: 'var(--color-text-main)', position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

            <Header
                title="Task Details"
                subtitle={" "}
                onBack={() => navigate(-1)}
                rightAction={
                    (task.useAI || task.useTimer) ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {task.useAI && (
                                <button onClick={() => navigate('/robo/chat', { state: { taskName: task.name }, replace: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
                                    <MessageCircle size={20} />
                                </button>
                            )}
                            {task.useTimer && (
                                <button onClick={() => navigate('/timer', { state: { taskId: task.id }, replace: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
                                    <TimerIcon size={20} />
                                </button>
                            )}
                        </div>
                    ) : null
                }
            />

            {/* This container handles the scrolling and the side padding */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 20px 40px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>

                {/* title + due */}
                {/*
                    .h3 = 22px / 400 / uppercase — closest class to the title size.
                    fontWeight overridden to 700 (the max weight available in DM Sans).
                */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px' }}>
                    <h1 className="h3" style={{ fontWeight: 700, margin: 0, color: 'var(--color-secondary)' }}>
                        {task.name}
                    </h1>
                    {task.due && (
                        <p className="body-semibold" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                            Due: {formatDate(task.due)}{task.time ? ` · ${task.time}` : ''}
                        </p>
                    )}
                    {formatDuration(task.timeLogged) && (
                        <p className="caption" style={{ margin: 0, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            ⏱ {formatDuration(task.timeLogged)} logged
                        </p>
                    )}
                </div>

                {/* meta chips */}
                {/*
                    All chips now use label-bold (14px / 700 / uppercase).
                    fontWeight capped at 700 — DM Sans only ships 400–700.
                */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    padding: '0 10px'
                }}>
                    {/* Priority Chip */}
                    <span className="label-bold" style={{
                        background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                        color: p.color,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        letterSpacing: '0.04em',
                    }}>
                        {p.label}
                    </span>

                    {/* Effort Chip */}
                    {task.effort && (
                        <span className="label-bold" style={{
                            background: `color-mix(in srgb, ${e.color} 12%, transparent)`,
                            color: e.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            letterSpacing: '0.04em',
                        }}>
                            <Gauge size={14} strokeWidth={2.5} />
                            {task.effort}
                        </span>
                    )}

                    {/* Repeat Chip */}
                    {task.repeat && (
                        <span className="label-bold" style={{
                            background: 'var(--color-card)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-divider)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            letterSpacing: '0.04em',
                        }}>
                            <Repeat size={12} strokeWidth={2.5} />
                            {task.repeat.frequency}
                        </span>
                    )}

                    {/* Estimated Time Chip */}
                    {formatMinutes(shownEstimate) && (
                        <span className="label-bold" style={{
                            background: 'var(--color-card)',
                            color: 'var(--color-text-secondary)',
                            border: '1.5px solid var(--color-divider)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            letterSpacing: '0.04em',
                        }}>
                            ⏱ {formatMinutes(shownEstimate)} {estimateLabel}
                        </span>
                    )}

                    {/* Location Chip */}
                    {task.location && (
                        <span className="label-bold" style={{
                            background: 'var(--color-card)',
                            color: 'var(--color-text-secondary)',
                            border: '1.5px solid var(--color-divider)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            letterSpacing: '0.04em',
                        }}>
                            <MapPin size={12} strokeWidth={2.5} />
                            {(() => {
                                const fullText = typeof task.location === 'object' ? task.location.label : task.location;
                                return fullText.split(',')[0].trim();
                            })()}
                        </span>
                    )}
                </div>

                {/* notes */}
                {task.notes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                        {/*
                            label-bold = 14px / 700 / uppercase — replaces the old labelStyle
                            object which used 11px (not in type scale) with letterSpacing added inline.
                        */}
                        <p className="label-bold" style={{ margin: '0 0 4px 0', color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>
                            Notes or Context
                        </p>
                        {/*
                            .caption = 15px / 400 — replaces the old inline fontSize: 15px.
                        */}
                        <div className="caption" style={{
                            background: 'var(--color-card)',
                            borderRadius: '16px',
                            padding: '16px',
                            lineHeight: 1.6,
                            color: 'var(--color-text-main)',
                            border: '1.5px solid var(--color-divider)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {task.notes}
                        </div>
                    </div>
                )}

                {/* subtasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="label-bold" style={{ margin: '0 0 4px 0', color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>Subtasks</span>
                        {subtasks.length > 0 && (
                            /*
                                label-bold = 14px / 700 / uppercase.
                                Removed the old fontSize: '11px' inline override that
                                contradicted the class.
                            */
                            <span className="label-bold" style={{
                                color: completedCount === subtasks.length
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-secondary)',
                            }}>
                                {completedCount === subtasks.length
                                    ? 'Complete ✓'
                                    : `${completedCount} / ${subtasks.length} Done`}
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

                    {/* The Subtask Card Container */}
                    <div style={{
                        background: 'var(--color-card)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1.5px solid var(--color-divider)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        {subtasks.map((subtask, i) => (
                            <div
                                key={subtask.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                                    borderBottom: i < subtasks.length - 1 ? '1px solid var(--color-divider)' : 'none',
                                }}
                            >
                                {/* 1. Checkbox with number inside when unchecked */}
                                <CircleCheck
                                    checked={subtask.done}
                                    onChange={() => toggleSubtask(task.id, subtask.id)}
                                    size={28}
                                    label={i + 1}
                                />

                                {/* 3. Label */}
                                <span className="body" style={{
                                    flex: 1,
                                    fontWeight: 400,
                                    color: subtask.done ? 'var(--color-text-secondary)' : 'var(--color-text-main)',
                                    textDecoration: subtask.done ? 'line-through' : 'none',
                                }}>
                                    {subtask.label}
                                </span>

                                {/* 4. [AI badge] [time] — badge reserves space so time always aligns */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                    <span className='caption' style={{
                                        visibility: (subtask.ai && !subtask.done) ? 'visible' : 'hidden',
                                        fontWeight: 700,
                                        color: 'var(--color-primary)',
                                        background: 'var(--color-primary-soft)',
                                        padding: '3px 10px',
                                        borderRadius: '24px',
                                        border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)'
                                    }}>
                                        AI
                                    </span>
                                    <span className="caption" style={{
                                        minWidth: '32px',
                                        textAlign: 'right',
                                        color: subtask.done ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                                        opacity: subtask.done ? 0.5 : 1,
                                    }}>
                                        {subtask.estSubtaskTime > 0 ? formatMinutes(subtask.estSubtaskTime) : ''}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Add Subtask Row */}
                        {addingSubtask ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                                borderTop: subtasks.length > 0 ? '1px solid var(--color-divider)' : 'none',
                                background: 'var(--color-bg)'
                            }}>
                                <input
                                    autoFocus
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddSubtask()
                                        if (e.key === 'Escape') setAddingSubtask(false)
                                    }}
                                    placeholder="Next step..."
                                    className="body"
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-main)' }}
                                />
                                <button
                                    onClick={handleAddSubtask}
                                    className="label-bold"
                                    style={{
                                        background: 'var(--color-success-soft)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        color: 'var(--color-success)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setAddingSubtask(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingSubtask(true)}
                                className="label-bold"
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '16px', background: 'none', border: 'none',
                                    borderTop: subtasks.length > 0 ? '1px solid var(--color-divider)' : 'none',
                                    cursor: 'pointer', color: 'var(--color-text-secondary)',
                                }}
                            >
                                <Plus size={16} />
                                Add Subtask
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ height: '16px' }} />

            </div>

            {/* action bar — always at the bottom */}
            <div style={{
                marginTop: 'auto',
                padding: '16px 20px 32px',
                background: 'var(--color-bg)',
                borderTop: '1.5px solid var(--color-divider)',
                display: 'flex',
                gap: '12px',
                zIndex: 10
            }}>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="label-bold"
                    style={{
                        flex: 1,
                        padding: '14px 8px',
                        background: 'none',
                        border: '1.5px solid var(--color-important)',
                        borderRadius: '16px',
                        color: 'var(--color-important)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Trash2 size={18} strokeWidth={2.5} />
                    {/*
                        label-bold handles size (14px) and weight (700).
                        Removed the old fontSize: '11px' inline override.
                    */}
                    Delete
                </button>

                <button
                    onClick={() => navigate('/tasks/create', { state: { editId: id }, replace: true })}
                    className="label-bold"
                    style={{
                        flex: 1,
                        padding: '14px 8px',
                        background: 'none',
                        border: '1.5px solid var(--color-primary)',
                        borderRadius: '16px',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Pencil size={18} strokeWidth={2.5} />
                    Edit
                </button>

                <button
                    onClick={handleComplete}
                    className="label-bold"
                    style={{
                        flex: 1,
                        padding: '14px 8px',
                        background: isComplete ? 'var(--color-success-soft)' : 'none',
                        border: '1.5px solid var(--color-success)',
                        borderRadius: '16px',
                        color: 'var(--color-success)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <CheckCircle size={18} strokeWidth={2.5} />
                    {isComplete ? 'Undo' : 'Done'}
                </button>
            </div>

            {/* delete confirm */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    icon={<Trash2 size={24} color="var(--color-important)" />}
                    title="Delete Task?"
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
                    title="Not Quite Done?"
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