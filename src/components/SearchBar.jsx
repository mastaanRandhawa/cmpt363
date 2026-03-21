// Only in Tasks.jsx but keeping separate for simplicity

// SearchBar
// Pill-shaped search input with a leading magnifying glass icon and an optional
// clear button that appears when there is text. Used on the Tasks screen above
// the filter tabs.
//
// Props:
//   value       – string, controlled value
//   onChange    – (value: string) => void  (passes the string directly, not the event)
//   placeholder – string (default 'Search tasks...')
//
// Usage:
//   const [query, setQuery] = useState('')
//
//   <SearchBar value={query} onChange={setQuery} />
//
// Then filter your task list:
//   const visible = tasks.filter(t =>
//     t.title.toLowerCase().includes(query.toLowerCase())
//   )

import { Search, X } from 'lucide-react'

function SearchBar({ value, onChange, placeholder = 'Search tasks...' }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-surface)',
            borderRadius: '999px',
            padding: '10px 14px',
        }}>
            {/* search icon */}
            <Search size={16} color="var(--color-text-muted)" strokeWidth={2} style={{ flexShrink: 0 }} />

            {/* input */}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    caretColor: 'var(--color-primary)',
                }}
            />

            {/* clear button — only shown when there is text */}
            {value.length > 0 && (
                <button
                    onClick={() => onChange('')}
                    style={{
                        background: 'var(--color-surface-alt)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                    }}
                >
                    <X size={11} color="var(--color-text-muted)" strokeWidth={2.5} />
                </button>
            )}
        </div>
    )
}

export default SearchBar