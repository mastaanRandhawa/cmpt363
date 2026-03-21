import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Header
// Top-of-page title bar with optional back button, subtitle, and right-side action slot.
//
// Props:
//   title       – string, large bold page title
//   subtitle    – string, small caps label displayed above the title (e.g. 'TIMER', 'YOUR COMPANION')
//   onBack      – () => void, if provided renders a back chevron; if omitted no back button is shown.
//                 If you just want default navigate(-1) behaviour, pass onBack={true} or a no-op.
//   rightAction – ReactNode, anything rendered on the right side (icon buttons, chips, etc.)
//
// Usage examples:
//   // Simple page title (no back)
//   <Header title="Tasks" />
//
//   // Back navigation with subtitle (e.g. Task Detail / Timer)
//   <Header subtitle="TIMER" title="Write CMPT376W Essay" onBack={() => navigate(-1)} />
//
//   // Title with right-side action (e.g. Home screen with level chip + notification bell)
//   <Header
//     title="Good Morning, Bob!"
//     rightAction={
//       <>
//         <Chip label="LVL 4 · 330XP" color="primary" />
//         <Bell size={20} color="var(--color-text-muted)" />
//       </>
//     }
//   />
//
//   // Add Task (back to Tasks list)
//   <Header title="Add A New Task" onBack={() => navigate('/tasks')} />

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