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

import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Header({ title, subtitle, onBack, rightAction }) {
    const navigate = useNavigate()

    function handleBack() {
        if (typeof onBack === 'function') onBack()
        else navigate(-1)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            height: '72px',
            flexShrink: 0,
        }}>

            {/* text column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>

                {/* subtitle — fixed height, indented to match title (skips arrow width) */}
                <p style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                    height: '16px',
                    lineHeight: '16px',
                    paddingLeft: '26px',
                    visibility: subtitle ? 'visible' : 'hidden',
                    userSelect: 'none',
                }}>
                    {subtitle || 'X'}
                </p>

                {/* title row — arrow slot always 26px so title never shifts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '26px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
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
                                    padding: '0',
                                }}
                            >
                                <ChevronLeft size={22} />
                            </button>
                        )}
                    </div>

                    {title && (
                        <h1 style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            margin: 0,
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {title}
                        </h1>
                    )}
                </div>

            </div>

            {/* right side */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
                visibility: rightAction ? 'visible' : 'hidden',
            }}>
                {rightAction || <span style={{ width: '44px', height: '44px' }} />}
            </div>

        </div>
    )
}

export default Header