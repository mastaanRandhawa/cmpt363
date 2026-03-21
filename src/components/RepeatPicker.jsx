// RepeatPicker
// A repeat/recurrence selector styled like Google Calendar's "Does not repeat" row.
// Tapping opens an inline panel with frequency options and day selection for weekly/custom.
//
// Props:
//   value    – repeat object or null
//              null                                    → does not repeat
//              { frequency: 'daily' }
//              { frequency: 'weekly',  days: ['Monday'] }
//              { frequency: 'monthly' }
//              { frequency: 'yearly' }
//              { frequency: 'custom',  days: ['Monday', 'Wednesday', 'Friday'] }
//   onChange – (repeat: object | null) => void
//
// Usage:
//   <RepeatPicker value={repeat} onChange={setRepeat} />

import { useState } from 'react'
import { Repeat, ChevronDown, ChevronUp } from 'lucide-react'

const FREQUENCIES = [
    { value: null,       label: 'Does not repeat' },
    { value: 'daily',    label: 'Daily' },
    { value: 'weekly',   label: 'Weekly' },
    { value: 'monthly',  label: 'Monthly' },
    { value: 'yearly',   label: 'Yearly' },
    { value: 'custom',   label: 'Custom days' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL = {
    Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
    Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

function repeatLabel(value) {
    if (!value) return 'Does not repeat'
    const freq = FREQUENCIES.find(f => f.value === value.frequency)
    if (value.frequency === 'weekly' && value.days?.length) {
        return `Weekly on ${value.days.map(d => d.slice(0, 3)).join(', ')}`
    }
    if (value.frequency === 'custom' && value.days?.length) {
        return value.days.map(d => d.slice(0, 3)).join(', ')
    }
    return freq?.label ?? 'Does not repeat'
}

function RepeatPicker({ value, onChange }) {
    const [open, setOpen] = useState(false)

    const selectedFreq = value?.frequency ?? null
    const selectedDays = value?.days ?? []

    function handleFrequency(freq) {
        if (freq === null) { onChange(null); return }
        if (freq === 'weekly')  { onChange({ frequency: 'weekly',  days: [] }); return }
        if (freq === 'custom')  { onChange({ frequency: 'custom',  days: [] }); return }
        onChange({ frequency: freq })
    }

    function toggleDay(dayShort) {
        const full = DAY_FULL[dayShort]
        const next = selectedDays.includes(full)
            ? selectedDays.filter(d => d !== full)
            : [...selectedDays, full]
        onChange({ ...value, days: next })
    }

    const showDayPicker = selectedFreq === 'weekly' || selectedFreq === 'custom'

    return (
        <div>
            {/* trigger row */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--color-surface-alt)',
                    borderRadius: open ? '12px 12px 0 0' : '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                    textAlign: 'left',
                    transition: 'border-radius 0.15s',
                }}
            >
                <Repeat size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '14px', color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {repeatLabel(value)}
                </span>
                {open
                    ? <ChevronUp size={16} color="var(--color-text-muted)" />
                    : <ChevronDown size={16} color="var(--color-text-muted)" />
                }
            </button>

            {/* expanded panel */}
            {open && (
                <div style={{
                    background: 'var(--color-surface)',
                    border: '1.5px solid var(--color-surface-alt)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                }}>

                    {/* frequency options */}
                    {FREQUENCIES.map((f, i) => {
                        const active = selectedFreq === f.value
                        return (
                            <button
                                key={String(f.value)}
                                onClick={() => handleFrequency(f.value)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    background: active
                                        ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                                        : 'none',
                                    border: 'none',
                                    borderTop: i > 0 ? '1px solid var(--color-surface-alt)' : 'none',
                                    cursor: 'pointer',
                                    color: active ? 'var(--color-primary)' : 'var(--color-text)',
                                    fontSize: '14px',
                                    fontWeight: active ? 600 : 400,
                                    textAlign: 'left',
                                }}
                            >
                                {f.label}
                                {active && (
                                    <span style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: 'var(--color-primary)', flexShrink: 0,
                                    }} />
                                )}
                            </button>
                        )
                    })}

                    {/* day picker — shown for weekly and custom */}
                    {showDayPicker && (
                        <div style={{
                            padding: '12px 16px 16px',
                            borderTop: '1px solid var(--color-surface-alt)',
                            display: 'flex', gap: '6px', flexWrap: 'wrap',
                        }}>
                            {DAYS.map(day => {
                                const full    = DAY_FULL[day]
                                const active  = selectedDays.includes(full)
                                return (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        style={{
                                            width: '38px', height: '38px',
                                            borderRadius: '50%',
                                            border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-surface-alt)'}`,
                                            background: active
                                                ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
                                                : 'none',
                                            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}

export default RepeatPicker