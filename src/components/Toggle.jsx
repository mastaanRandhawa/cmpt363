import { useState } from 'react'

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