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

function Toggle({
    label,
    checked,
    defaultOn = false,

    onChange,

    thumbWidthEm = 0.9,
    thumbHeightEm = 0.9,
    trackWidthEm = 2.2, // 250% of the font size
    hPaddingEm = 0.15,
    vPaddingEm = 0.15,
    transitionTime = '0.2s',
    transitionFormula = 'ease-out',

    style = {
        fontSize: '22px',
    },
}) {
    const isControlled        = checked !== undefined
    const [on, setOn]         = useState(defaultOn)
    const isOn                = isControlled ? checked : on

    function handleToggle() {
        const next = !isOn
        if (!isControlled) setOn(next)
        if (onChange) onChange(next)
    }

    const labelStyle = {
        color: 'var(--color-text-muted)',
        fontSize: '0.75em',
    };

    const trackStyle = {
        position: 'relative',
        width: `${trackWidthEm}em`,
        height: `calc(1em + ${vPaddingEm}em)`,
        borderRadius: `calc(1em + ${vPaddingEm}em)`,
        transition: `background ${transitionTime} ${transitionFormula}`,
        backgroundColor: 'var(--color-divider)',
        cursor: 'pointer',
    }
            
    const thumbStyle = {
        position: 'absolute',
        top: `calc(${vPaddingEm/2}em + ${(1-thumbHeightEm)/2}em)`,
        left: `${hPaddingEm}em`,
        width: `${thumbWidthEm}em`,
        height: `${thumbHeightEm}em`,
        borderRadius: `calc(1em - ${vPaddingEm}em)`,
        transition: `background ${transitionTime} ${transitionFormula}, left ${transitionTime} ${transitionFormula}`,
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }

    if (isOn) {
        trackStyle.backgroundColor = 'var(--color-primary)'
        thumbStyle.left = `${trackWidthEm - thumbWidthEm - hPaddingEm}em`
    }

    return (
        <div 
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                gap: 4,
                ...(style ?? {}),
            }}
        >
            {label && (
                <span style={labelStyle}>
                    {label}
                </span>
            )}
            <button onClick={handleToggle} style={trackStyle}>
                <span style={thumbStyle} />
            </button>
        </div>
    )
}

export default Toggle