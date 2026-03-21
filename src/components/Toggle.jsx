// Toggle
// On/off switch with an optional inline label. Used in Settings rows and the AI Suggestions
// panel on Add Task.
//
// Props:
//   label     – string, displayed to the left of the switch (optional)
//   checked   – boolean, controlled value (optional — use this OR defaultOn, not both)
//   defaultOn – boolean, initial state for uncontrolled usage (default false)
//   onChange  – (isOn: boolean) => void
//
// Usage examples:
//   // Uncontrolled (Settings rows — just fires onChange)
//   <Toggle label="Push Notifications" defaultOn onChange={val => setSetting('push', val)} />
//
//   // Controlled (AI Suggestions — parent owns the state)
//   <Toggle checked={aiSuggest} onChange={setAiSuggest} />

import { useState } from 'react'

function Toggle({ label, checked, defaultOn = false, onChange }) {
    const isControlled        = checked !== undefined
    const [on, setOn]         = useState(defaultOn)
    const isOn                = isControlled ? checked : on

    function handleToggle() {
        const next = !isOn
        if (!isControlled) setOn(next)
        if (onChange) onChange(next)
    }

    return (
        <div className="flex items-center justify-between gap-4">
            {label && (
                <span style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                    {label}
                </span>
            )}
            <button
                onClick={handleToggle}
                style={{
                    background: isOn ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                }}
                className="relative w-12 h-6 rounded-full transition-colors duration-200"
            >
                <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                        isOn ? 'left-7' : 'left-1'
                    }`}
                />
            </button>
        </div>
    )
}

export default Toggle