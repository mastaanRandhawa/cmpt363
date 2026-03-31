import { useState } from 'react'

function Input({
                   label,
                   required = false,
                   placeholder,
                   value,
                   onChange,
                   multiline = false,
                   rows = 4,
                   type = 'text',
                   disabled = false
               }) {
    const [isFocused, setIsFocused] = useState(false)

    const fieldStyle = {
        background: 'var(--color-card)',
        // Border gets primary color when focused
        border: `1.5px solid ${isFocused ? 'var(--color-primary)' : 'var(--color-divider)'}`,
        borderRadius: '16px', // Matches your buttons/trays
        padding: '14px 16px',
        color: 'var(--color-text-main)',
        fontSize: '15px',
        width: '100%',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        // colorScheme allows native pickers (date/time) to match the theme
        colorScheme: 'inherit',
        ...(multiline ? { resize: 'none', lineHeight: 1.6 } : {}),
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {label && (
                <label className="label-caps" style={{
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {label}
                    {required && (
                        <span style={{ color: 'var(--color-important)', marginLeft: '4px' }}>*</span>
                    )}
                </label>
            )}

            {multiline ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={fieldStyle}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={fieldStyle}
                />
            )}
        </div>
    )
}

export default Input