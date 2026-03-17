import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Cpu, Calendar, MoreHorizontal } from 'lucide-react'

// TODO: Update Robo icon
const tabs = [
    { label: 'Home',     icon: Home,           path: '/' },
    { label: 'Tasks',    icon: CheckSquare,     path: '/tasks' },
    { label: 'Robo',       icon: Cpu,             path: '/Robo' },
    { label: 'Calendar', icon: Calendar,        path: '/calendar' },
    { label: 'More',     icon: MoreHorizontal,  path: '/more' },
]

// Bottom Navigation bar
function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-surface-alt)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 0 28px',
        }}>
            {tabs.map(({ label, icon: Icon, path }) => {
                const active = location.pathname === path
                return (
                    <button
                        key={path}
                        onClick={() => navigate(path)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}
                    >
                        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: active ? '600' : '400',
                        }}>
              {label}
            </span>
                    </button>
                )
            })}
        </div>
    )
}

export default BottomNav