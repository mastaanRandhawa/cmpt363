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
            gap: '10px',
            background: 'var(--color-card)',
            border: '1px solid var(--color-divider)',
            borderRadius: '100px', // True pill shape
            padding: '12px 16px',
            width: '100%',
            transition: 'border-color 0.2s ease',
        }}>
            {/* Magnifying glass */}
            <Search
                size={18}
                color="var(--color-text-secondary)"
                strokeWidth={2.2}
                style={{ flexShrink: 0 }}
            />

            {/* Input field */}
            <input
                type="text"
                className="label-medium"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--color-text-main)',
                    fontSize: '15px',
                    caretColor: 'var(--color-primary)',
                    padding: 0,
                    margin: 0,
                }}
            />

            {/* Clear button */}
            {value.length > 0 && (
                <button
                    onClick={() => onChange('')}
                    className="active:scale-90 transition-transform"
                    style={{
                        background: 'var(--color-divider)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                    }}
                >
                    <X size={12} color="var(--color-text-secondary-muted)" strokeWidth={3} />
                </button>
            )}
        </div>
    )
}

export default SearchBar