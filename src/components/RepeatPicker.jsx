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
    if (value.frequency === 'weekly' && value.days?.length > 0) {
        return `Weekly on ${value.days.map(d => d.slice(0, 3)).join(', ')}`
    }
    if (value.frequency === 'custom' && value.days?.length > 0) {
        return value.days.map(d => d.slice(0, 3)).join(', ')
    }
    return FREQUENCIES.find(f => f.value === value.frequency)?.label ?? 'Does not repeat'
}

function RepeatPicker({ value, onChange }) {
    const [open, setOpen] = useState(false)

    const selectedFreq = value?.frequency ?? null
    const selectedDays = value?.days ?? []

    function handleFrequency(freq) {
        if (freq === null) { onChange(null); return }
        onChange({ frequency: freq, days: (freq === 'weekly' || freq === 'custom') ? [] : undefined })
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
        <div style={{ width: '100%' }}>
            {/* trigger row */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--color-card)',
                    border: `1.5px solid ${open ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                    borderRadius: open ? '16px 16px 0 0' : '16px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                }}
            >
                <Repeat size={18} color="var(--color-text-mid)" style={{ flexShrink: 0 }} />
                <span className="label-bold" style={{
                    flex: 1,
                    fontSize: '15px',
                    color: value ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                }}>
                    {repeatLabel(value)}
                </span>
                {open
                    ? <ChevronUp size={18} color="var(--color-text-secondary-muted)" />
                    : <ChevronDown size={18} color="var(--color-text-secondary-muted)" />
                }
            </button>

            {/* expanded panel */}
            {open && (
                <div style={{
                    background: 'var(--color-card)',
                    border: '1.5px solid var(--color-divider)',
                    borderTop: 'none',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden',
                }}>
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
                                    padding: '14px 16px',
                                    background: active ? 'var(--color-primary-soft)' : 'none',
                                    border: 'none',
                                    borderTop: i > 0 ? '1px solid var(--color-divider)' : 'none',
                                    cursor: 'pointer',
                                    color: active ? 'var(--color-primary)' : 'var(--color-text-main)',
                                    textAlign: 'left',
                                }}
                                className="label-medium"
                            >
                                {f.label}
                                {active && (
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: 'var(--color-primary)',
                                    }} />
                                )}
                            </button>
                        )
                    })}

                    {/* Day Picker */}
                    {showDayPicker && (
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid var(--color-divider)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '4px',
                        }}>
                            {DAYS.map(day => {
                                const full = DAY_FULL[day]
                                const active = selectedDays.includes(full)
                                return (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                                            background: active ? 'var(--color-primary-soft)' : 'transparent',
                                            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s ease',
                                        }}
                                        className="label-caps"
                                    >
                                        {day[0]}
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