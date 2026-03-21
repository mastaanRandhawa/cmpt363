import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command, X, Pencil, Check, Plus, CheckCircle } from 'lucide-react'
import useTaskStore from '../data/useTaskStore'
import useDebugStore from '../data/useDebugStore'
import Header from '../components/Header'
import Input from '../components/Input'
import Toggle from '../components/Toggle'
import Button from '../components/Button'
import RepeatPicker from '../components/RepeatPicker'
import { priority as priorityMap } from '../data/priority'

const priorities = ['low', 'med', 'high']

const priorityColors = {
    low:  'var(--color-priority-low)',
    med:  'var(--color-priority-med)',
    high: 'var(--color-priority-high)',
}

const effortColors = {
    1: 'var(--color-success)',
    2: 'var(--color-success)',
    3: 'var(--color-primary)',
    4: 'var(--color-accent)',
    5: 'var(--color-danger)',
}

// Fake AI subtasks — replace with real API call when ready
const FAKE_AI_SUBTASKS = [
    'Research Topic',
    'Create Outline',
    'Write First Draft',
    'Review and Edit',
    'Final Submission',
]

const THINKING_STEPS = [
    'Analyzing Task',
    'Planning Steps',
    'Reviewing History',
    'Saving You Time',
]

const labelStyle = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-muted)',
}

const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-danger)',
    marginLeft: '8px',
    fontWeight: 600,
}

function TaskCreate() {
    const navigate = useNavigate()
    const addTask    = useTaskStore(s => s.addTask)
    const setDebug   = useDebugStore(s => s.set)

    // form
    const [name, setName]           = useState('')
    const [date, setDate]           = useState('')
    const [addTime, setAddTime]     = useState(false)
    const [time, setTime]           = useState('')
    const [priority, setPriority]   = useState(null)
    const [effort, setEffort]       = useState(null)
    const [notes, setNotes]         = useState('')
    const [repeat, setRepeat]       = useState(null)
    const [aiSuggest, setAiSuggest] = useState(true)
    const [errors, setErrors]       = useState({})

    // steps: 'form' | 'thinking' | 'subtasks' | 'confirm'
    const [step, setStep]           = useState('form')
    const [subtasks, setSubtasks]   = useState([])
    const [createdId, setCreatedId] = useState(null)

    // thinking animation
    const [visibleThinkingSteps, setVisibleThinkingSteps] = useState(0)

    // subtask editing
    const [editingId, setEditingId]   = useState(null)
    const [editLabel, setEditLabel]   = useState('')
    const [newSubtask, setNewSubtask] = useState('')
    const [addingNew, setAddingNew]   = useState(false)

    // ─── debug output ─────────────────────────────────────────────────────────
    useEffect(() => {
        setDebug('TaskCreate', {
            step,
            name:      name || '—',
            date:      date || '—',
            time:      addTime ? (time || '—') : 'off',
            addTime,
            repeat:    repeat ? `${repeat.frequency}${repeat.days?.length ? ` (${repeat.days.join(', ')})` : ''}` : 'none',
            priority:  priority ?? '—',
            effort:    effort ?? '—',
            notes:     notes ? `${notes.slice(0, 20)}${notes.length > 20 ? '…' : ''}` : '—',
            aiSuggest,
            subtasks:  subtasks.length > 0 ? `${subtasks.length} (${subtasks.filter(s => s.ai).length} AI)` : '—',
        })
    }, [step, name, date, time, addTime, repeat, priority, effort, notes, aiSuggest, subtasks])

    // Clear debug state when unmounting
    useEffect(() => () => setDebug('TaskCreate', null), [])

    // ─── thinking animation ───────────────────────────────────────────────────
    useEffect(() => {
        if (step !== 'thinking') return
        setVisibleThinkingSteps(0)

        const timers = THINKING_STEPS.map((_, i) =>
            setTimeout(() => setVisibleThinkingSteps(i + 1), 400 + i * 500)
        )
        const done = setTimeout(() => {
            setSubtasks(FAKE_AI_SUBTASKS.map((label, i) => ({
                id: `ai-${i}`, label, done: false, ai: true,
            })))
            setStep('subtasks')
        }, 400 + THINKING_STEPS.length * 500 + 600)

        return () => { timers.forEach(clearTimeout); clearTimeout(done) }
    }, [step])

    // ─── validation ───────────────────────────────────────────────────────────
    function validate() {
        const e = {}
        if (!name.trim()) e.name     = 'Required'
        if (!date)        e.date     = 'Required'
        if (!priority)    e.priority = 'Required'
        if (!effort)      e.effort   = 'Required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function handleFormSubmit() {
        if (!validate()) return
        if (aiSuggest) { setStep('thinking') }
        else { setSubtasks([]); setStep('subtasks') }
    }

    function handleConfirmSteps() {
        const id = crypto.randomUUID()
        addTask({
            id,
            name:        name.trim(),
            due:         date,
            time:        addTime ? time : null,
            priority,
            effort,
            description: notes.trim(),
            status:      'todo',
            location:    null,
            repeat,
            subtasks,
        })
        setCreatedId(id)
        setStep('confirm')
    }

    // ─── subtask actions ──────────────────────────────────────────────────────
    function startEdit(subtask) { setEditingId(subtask.id); setEditLabel(subtask.label) }
    function commitEdit(id) {
        if (!editLabel.trim()) { cancelEdit(); return }
        setSubtasks(prev => prev.map(s =>
            s.id === id ? { ...s, label: editLabel.trim(), ai: false } : s
        ))
        cancelEdit()
    }
    function cancelEdit() { setEditingId(null); setEditLabel('') }
    function removeSubtask(id) { setSubtasks(prev => prev.filter(s => s.id !== id)) }
    function addNewSubtask() {
        if (!newSubtask.trim()) return
        setSubtasks(prev => [...prev, { id: crypto.randomUUID(), label: newSubtask.trim(), done: false, ai: false }])
        setNewSubtask('')
        setAddingNew(false)
    }

    function formatDate(dateStr) {
        if (!dateStr) return ''
        return new Date(dateStr + 'T00:00:00')
            .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    // ─── step renders ─────────────────────────────────────────────────────────

    if (step === 'thinking') return (
        <div className="flex flex-col pb-24" style={{ color: 'var(--color-text)', minHeight: '100%' }}>
            <Header title="Add A New Task" onBack={() => navigate('/tasks')} />
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '16px', padding: '40px 32px', textAlign: 'center',
            }}>
                <div style={{
                    background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                    borderRadius: '24px', width: '72px', height: '72px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Command size={32} color="var(--color-primary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        Robo is thinking....
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, letterSpacing: '0.06em' }}>
                        {name.toUpperCase()}
                    </p>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Last similar task took 2h 30m...<br />Using this to estimate.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', width: '100%' }}>
                    {THINKING_STEPS.map((s, i) => (
                        <p key={s} style={{
                            margin: 0, fontSize: '13px', color: 'var(--color-text-muted)',
                            opacity: i < visibleThinkingSteps ? 1 : 0,
                            transform: i < visibleThinkingSteps ? 'translateY(0)' : 'translateY(6px)',
                            transition: 'opacity 0.35s ease, transform 0.35s ease',
                        }}>
                            {s}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )

    if (step === 'subtasks') return (
        <div className="flex flex-col pb-24" style={{ color: 'var(--color-text)', minHeight: '100%' }}>
            <Header title="Add A New Task" onBack={() => setStep('form')} />
            <div className="flex flex-col gap-5 p-5">

                {/* heading */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                        borderRadius: '18px', width: '56px', height: '56px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Command size={24} color="var(--color-primary)" />
                    </div>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        Task Breakdown
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {aiSuggest
                            ? 'Here is my suggested breakdown of the required steps to complete the task!'
                            : 'Add steps to break this task into manageable pieces.'
                        }
                    </p>
                </div>

                {/* AI suggestions indicator */}
                {aiSuggest && (
                    <div style={{
                        background: 'var(--color-surface)', borderRadius: '12px',
                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <Command size={16} color="var(--color-primary)" />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}>AI SUGGESTIONS</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-muted)' }}>Breakdown and Time Estimate</p>
                        </div>
                        {/* static "on" indicator */}
                        <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: 'var(--color-primary)', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: '3px', left: '19px', width: '14px', height: '14px', borderRadius: '50%', background: 'white' }} />
                        </div>
                    </div>
                )}

                {/* subtask list */}
                <div style={{ background: 'var(--color-surface)', borderRadius: '14px', overflow: 'hidden' }}>
                    {subtasks.map((subtask, i) => (
                        <div key={subtask.id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px',
                            borderBottom: i < subtasks.length - 1 ? '1px solid var(--color-surface-alt)' : 'none',
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', width: '16px', flexShrink: 0, textAlign: 'right' }}>
                                {i + 1}
                            </span>

                            {editingId === subtask.id ? (
                                <input
                                    autoFocus
                                    value={editLabel}
                                    onChange={e => setEditLabel(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(subtask.id); if (e.key === 'Escape') cancelEdit() }}
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }}
                                />
                            ) : (
                                <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)' }}>{subtask.label}</span>
                            )}

                            {subtask.ai && editingId !== subtask.id && (
                                <span style={{
                                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                                    color: 'var(--color-primary-soft)',
                                    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                    padding: '2px 6px', borderRadius: '999px', flexShrink: 0,
                                }}>AI</span>
                            )}

                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {editingId === subtask.id ? (
                                    <>
                                        <ActionBtn onClick={() => commitEdit(subtask.id)} color="var(--color-success)"><Check size={13} /></ActionBtn>
                                        <ActionBtn onClick={cancelEdit} color="var(--color-text-muted)"><X size={13} /></ActionBtn>
                                    </>
                                ) : (
                                    <>
                                        <ActionBtn onClick={() => startEdit(subtask)} color="var(--color-primary)"><Pencil size={13} /></ActionBtn>
                                        <ActionBtn onClick={() => removeSubtask(subtask.id)} color="var(--color-danger)"><X size={13} /></ActionBtn>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {addingNew ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                            borderTop: subtasks.length > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                        }}>
                            <input
                                autoFocus
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addNewSubtask(); if (e.key === 'Escape') setAddingNew(false) }}
                                placeholder="New subtask..."
                                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontSize: '14px' }}
                            />
                            <button onClick={addNewSubtask} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px' }}>Add</button>
                            <button onClick={() => setAddingNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAddingNew(true)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                padding: '12px', background: 'none', border: 'none',
                                borderTop: subtasks.length > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                                cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 600,
                            }}
                        >
                            <Plus size={14} /> ADD SUBTASK
                        </button>
                    )}
                </div>

                <button
                    onClick={handleConfirmSteps}
                    style={{
                        width: '100%', padding: '16px', background: 'var(--color-accent)',
                        border: 'none', borderRadius: '14px', color: 'white',
                        fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                >
                    Confirm Steps
                </button>
            </div>
        </div>
    )

    if (step === 'confirm') {
        const p = priorityMap[priority] ?? { label: priority?.toUpperCase(), color: 'var(--color-text-muted)' }
        return (
            <div className="flex flex-col pb-24" style={{ color: 'var(--color-text)', minHeight: '100%' }}>
                <Header title="Add A New Task" onBack={() => navigate('/tasks')} />
                <div className="flex flex-col gap-5 p-5" style={{ alignItems: 'center', textAlign: 'center' }}>

                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'color-mix(in srgb, var(--color-success) 20%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px',
                    }}>
                        <CheckCircle size={32} color="var(--color-success)" />
                    </div>

                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Task Created!</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.06em' }}>
                            {name.toUpperCase()}
                        </p>
                        {date && (
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                Due: {formatDate(date)}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color, fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>
                                {p.label}
                            </span>
                            {effort && (
                                <span style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px' }}>
                                    EFFORT: {effort}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* robo says */}
                    <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px', width: '100%', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Command size={18} color="var(--color-primary)" />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>Robo says:</p>
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Great! I've added this to your plan. Let's tackle it together!
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)' }}>🔥 Streak +1</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>✦ +15 XP</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                            onClick={() => navigate(`/tasks/${createdId}`)}
                            style={{ flex: 1, padding: '14px', background: 'none', border: '1.5px solid var(--color-surface-alt)', borderRadius: '14px', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                        >
                            View Task
                        </button>
                        <button
                            onClick={() => navigate('/timer', { state: { taskId: createdId } })}
                            style={{ flex: 1, padding: '14px', background: 'var(--color-primary)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                        >
                            Start Task
                        </button>
                    </div>

                </div>
            </div>
        )
    }

    // ─── form step ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col pb-24" style={{ color: 'var(--color-text)' }}>
            <Header title="Add A New Task" onBack={() => navigate('/tasks')} />
            <div className="flex flex-col gap-5 p-5">

                {/* task name */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>TASK NAME <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.name && <span style={errorStyle}>{errors.name}</span>}
                    </div>
                    <Input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: null })) }} placeholder="Task Name" />
                </div>

                {/* date + time + repeat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* label row — DATE on left, ADD TIME + REPEAT on right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={labelStyle}>DATE <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                            {errors.date && <span style={errorStyle}>{errors.date}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>

                            {/* add time checkbox */}
                            <button
                                onClick={() => setAddTime(v => !v)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    border: `2px solid ${addTime ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`,
                                    background: addTime ? 'var(--color-primary)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.15s',
                                }}>
                                    {addTime && (
                                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span style={{ ...labelStyle, letterSpacing: '0.06em' }}>ADD TIME</span>
                            </button>

                            {/* repeat checkbox */}
                            <button
                                onClick={() => setRepeat(v => v ? null : { frequency: 'daily' })}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    border: `2px solid ${repeat ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`,
                                    background: repeat ? 'var(--color-primary)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, transition: 'all 0.15s',
                                }}>
                                    {repeat && (
                                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span style={{ ...labelStyle, letterSpacing: '0.06em' }}>REPEAT</span>
                            </button>

                        </div>
                    </div>

                    {/* date + time inputs inline */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            value={date}
                            max="9999-12-31"
                            onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: null })) }}
                            style={{
                                flex: addTime ? '1.6' : '1',
                                background: 'var(--color-surface)',
                                border: '1.5px solid var(--color-surface-alt)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                color: 'var(--color-text)',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                colorScheme: 'dark',
                                minWidth: 0,
                            }}
                        />
                        {addTime && (
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                style={{
                                    flex: '1',
                                    background: 'var(--color-surface)',
                                    border: '1.5px solid var(--color-surface-alt)',
                                    borderRadius: '12px',
                                    padding: '12px 14px',
                                    color: 'var(--color-text)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    colorScheme: 'dark',
                                    minWidth: 0,
                                }}
                            />
                        )}
                    </div>

                    {/* repeat picker — shown when REPEAT is checked */}
                    {repeat && (
                        <RepeatPicker value={repeat} onChange={setRepeat} />
                    )}

                </div>

                {/* priority */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>PRIORITY <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.priority && <span style={errorStyle}>{errors.priority}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {priorities.map(p => {
                            const selected = priority === p
                            const color    = priorityColors[p]
                            return (
                                <button key={p} onClick={() => { setPriority(p); setErrors(prev => ({ ...prev, priority: null })) }}
                                        style={{ flex: 1, padding: '8px 0', borderRadius: '20px', border: `2px solid ${color}`, background: selected ? `color-mix(in srgb, ${color} 20%, transparent)` : 'none', color, fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.04em' }}>
                                    {p.toUpperCase()}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* effort */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={labelStyle}>EFFORT <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                        {errors.effort && <span style={errorStyle}>{errors.effort}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(n => {
                            const selected = effort === n
                            const color    = effortColors[n]
                            return (
                                <button key={n} onClick={() => { setEffort(n); setErrors(prev => ({ ...prev, effort: null })) }}
                                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px solid ${color}`, background: selected ? `color-mix(in srgb, ${color} 20%, transparent)` : 'none', color, fontWeight: 700, fontSize: '15px', cursor: 'pointer', flexShrink: 0 }}>
                                    {n}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* notes */}
                <Input label="NOTES OR CONTEXT" multiline rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter any information you'd like handy while viewing this task" />

                {/* ai suggestions */}
                <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: 'var(--color-surface-alt)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Command size={20} color="var(--color-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>AI SUGGESTIONS</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Breakdown and Time Estimate</p>
                    </div>
                    <button
                        onClick={() => setAiSuggest(v => !v)}
                        style={{
                            width: '48px', height: '28px', borderRadius: '999px',
                            border: 'none', flexShrink: 0, cursor: 'pointer',
                            background: aiSuggest ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                            position: 'relative', transition: 'background 0.2s',
                        }}
                    >
                        <span style={{
                            position: 'absolute', top: '4px',
                            left: aiSuggest ? '24px' : '4px',
                            width: '20px', height: '20px',
                            borderRadius: '50%', background: 'white',
                            transition: 'left 0.2s',
                        }} />
                    </button>
                </div>

                <Button label="Create Task" fullWidth onClick={handleFormSubmit} />

            </div>
        </div>
    )
}

// ─── tiny shared helper ───────────────────────────────────────────────────────

function ActionBtn({ onClick, color, children }) {
    return (
        <button onClick={onClick} style={{
            width: '26px', height: '26px', borderRadius: '8px',
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            border: 'none', cursor: 'pointer', color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            {children}
        </button>
    )
}

export default TaskCreate