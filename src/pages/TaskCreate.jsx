import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Command } from 'lucide-react'
import Button from '../components/Button'

const priorities = ['low', 'med', 'high']
const effortColors = {
    1: 'var(--color-success)',
    2: 'var(--color-success)',
    3: 'var(--color-primary)',
    4: 'var(--color-accent)',
    5: 'var(--color-danger)',
}

function InlineToggle({ on, onChange }) {
    return (
        <button
            onClick={() => onChange(!on)}
            style={{
                width: '48px',
                height: '28px',
                borderRadius: '999px',
                border: 'none',
                background: on ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s',
            }}
        >
      <span style={{
          position: 'absolute',
          top: '4px',
          left: on ? '24px' : '4px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
      }} />
        </button>
    )
}

function TaskCreate() {
    const navigate = useNavigate()
    const [name, setName]           = useState('')
    const [date, setDate]           = useState('')
    const [addTime, setAddTime]     = useState(false)
    const [time, setTime]           = useState('')
    const [priority, setPriority]   = useState(null)
    const [effort, setEffort]       = useState(null)
    const [notes, setNotes]         = useState('')
    const [aiSuggest, setAiSuggest] = useState(true)

    const inputStyle = {
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-surface-alt)',
        borderRadius: '12px',
        padding: '12px 14px',
        color: 'var(--color-text)',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        boxSizing: 'border-box',
    }

    const labelStyle = {
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-text-muted)',
        marginBottom: '8px',
        display: 'block',
    }

    return (
        <div className="page flex flex-col pb-24" style={{ color: 'var(--color-text)' }}>

            {/* header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-surface-alt)',
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}
                >
                    <ChevronLeft size={22} />
                </button>
                <span style={{ fontSize: '17px', fontWeight: 600 }}>Add A New Task</span>
            </div>

            <div className="flex flex-col gap-5 p-5">

                {/* task name */}
                <div>
                    <label style={labelStyle}>TASK NAME <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Task Name"
                        style={inputStyle}
                    />
                </div>

                {/* date + time */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ ...labelStyle, margin: 0 }}>DATE <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>ADD TIME</span>
                            <InlineToggle on={addTime} onChange={setAddTime} />
                        </div>
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                    {addTime && (
                        <input
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            style={{ ...inputStyle, marginTop: '10px', colorScheme: 'dark' }}
                        />
                    )}
                </div>

                {/* priority */}
                <div>
                    <label style={labelStyle}>PRIORITY <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {priorities.map(p => {
                            const colors = {
                                low:  'var(--color-priority-low)',
                                med:  'var(--color-priority-med)',
                                high: 'var(--color-priority-high)',
                            }
                            const selected = priority === p
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    style={{
                                        padding: '6px 20px',
                                        borderRadius: '20px',
                                        border: `2px solid ${colors[p]}`,
                                        background: selected ? `color-mix(in srgb, ${colors[p]} 20%, transparent)` : 'none',
                                        color: colors[p],
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {p.toUpperCase()}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* effort */}
                <div>
                    <label style={labelStyle}>EFFORT <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(n => {
                            const selected = effort === n
                            const color = effortColors[n]
                            return (
                                <button
                                    key={n}
                                    onClick={() => setEffort(n)}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        border: `2px solid ${color}`,
                                        background: selected ? `color-mix(in srgb, ${color} 20%, transparent)` : 'none',
                                        color: color,
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {n}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* notes */}
                <div>
                    <label style={labelStyle}>NOTES OR CONTEXT</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Enter any information you'd like handy while viewing this task"
                        rows={4}
                        style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                    />
                </div>

                {/* ai suggestions */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                }}>
                    <div style={{
                        background: 'var(--color-surface-alt)',
                        borderRadius: '12px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Command size={20} color="var(--color-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>AI SUGGESTIONS</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Breakdown and Time Estimate</p>
                    </div>
                    <InlineToggle on={aiSuggest} onChange={setAiSuggest} />
                </div>

                {/* submit */}
                <button
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '16px',
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                    }}
                >
                    Create Task
                </button>
            </div>
        </div>
    )
}

export default TaskCreate