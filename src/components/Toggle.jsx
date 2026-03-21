import { useState } from 'react'

// Toggle
// On/off switch with an optional inline label. Used in Settings rows and the AI Suggestions
// panel on Add Task.
//
// Props:
//   label     – string, displayed to the left of the switch (optional)
//   defaultOn – boolean, initial state (default false)
//   onChange  – (isOn: boolean) => void
//
// Note: This is an uncontrolled component — it manages its own state internally.
// If you need to control it from outside (e.g. to sync with saved settings), lift the
// state up and pass value/onChange instead, or refactor to a controlled pattern.
//
// Usage examples:
//   // Settings row (label on left, toggle on right)
//   <Toggle label="Push Notifications" defaultOn onChange={val => setSetting('push', val)} />
//
//   // No label (toggle sits inside a custom layout, e.g. AI Suggestions card on Add Task)
//   <Toggle defaultOn={aiSuggest} onChange={setAiSuggest} />
//
//   // Pre-toggled off
//   <Toggle label="Location-Based Tasks" onChange={val => setLocation(val)} />

function Toggle({ label, defaultOn = false, onChange }) {
    const [on, setOn] = useState(defaultOn)

    function handleToggle() {
        const next = !on
        setOn(next)
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
                    background: on ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                }}
                className="relative w-12 h-6 rounded-full transition-colors duration-200"
            >
        <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                on ? 'left-7' : 'left-1'
            }`}
        />
            </button>
        </div>
    )
}

export default Toggle