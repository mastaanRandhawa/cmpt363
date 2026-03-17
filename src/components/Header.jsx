import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Header({ title, subtitle, onBack, rightAction }) {
    const navigate = useNavigate()

    function handleBack() {
        if (onBack) onBack()
        else navigate(-1)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
        }}>

            {/* left side */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                {onBack && (
                    <button
                        onClick={handleBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 4px 2px 0',
                        }}
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}
                <div>
                    {subtitle && (
                        <p style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: 'var(--color-text-muted)',
                            margin: 0,
                        }}>
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            margin: 0,
                            lineHeight: 1.1,
                        }}>
                            {title}
                        </h1>
                    )}
                </div>
            </div>

            {/* right side */}
            {rightAction && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '4px' }}>
                    {rightAction}
                </div>
            )}

        </div>
    )
}

export default Header