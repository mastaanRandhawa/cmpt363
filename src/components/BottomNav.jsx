import { useNavigate, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Cpu, Calendar, MoreHorizontal, Settings, ChevronRight, HelpCircle, CircleAlert } from 'lucide-react'
import useBottomTrayStore from '../data/useBottomTrayStore'
import useNavGuardStore from '../data/useNavGuardStore'
import { BottomTrayItem } from './BottomTray'
import useSettingsStore from '../data/useSettingsStore'

// TODO: Update Robo icon

// BottomNav
// Persistent bottom navigation bar. Renders the five primary tabs and highlights the active
// route. Sticks to the bottom of the phone frame via position: sticky.
//
// No props — reads the current route from React Router's useLocation automatically.
//
// Tab routes:
//   /          → Home
//   /tasks     → Tasks
//   /robo      → Robo  (AI companion)
//   /calendar  → Calendar
//   /more      → More  (Settings, Notifications, Help)
//
// Usage:
//   Place once inside <BrowserRouter>, below the scrollable content area.
//   <BrowserRouter>
//     <div className="phone-scroll"> <Routes>...</Routes> </div>
//     <BottomNav />
//   </BrowserRouter>

const tabs = [
    { label: 'Home',     icon: Home,           path: '/' },
    { label: 'Tasks',    icon: CheckSquare,     path: '/tasks' },
    { label: 'Robo',       icon: Cpu,             path: '/robo' },
    { label: 'Calendar', icon: Calendar,        path: '/calendar' },
    { label: 'More',     icon: MoreHorizontal,  action: showMoreTray },
]

const trayItems = [
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Notifications', icon: CircleAlert, path: '/notifications' },
    { label: 'Help', icon: HelpCircle, path: '/help' },
]

function showMoreTray({ bottomTrayStore, navigate }) {
    const { show, dismiss } = bottomTrayStore;
    show({
        id: "moreNav",
        aboveNav: true,
        contents: (
            <>
                {trayItems.map(item => {
                    return <BottomTrayItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        rightIcon={item.rightIcon ?? ChevronRight}
                        onClick={() => {
                            navigate(item.path)
                            dismiss()
                        }}
                    ></BottomTrayItem>
                })}
            </>
        ),
    })
}

// Bottom Navigation bar
function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const settings = useSettingsStore()
    const bottomTrayStore = useBottomTrayStore()
    const bottomTrayID = useBottomTrayStore(s => s.id)
    const guardFn = useNavGuardStore(s => s.guardFn)

    function navigateAndDismissMore(...args) {
        if (bottomTrayID == "moreNav") {
            bottomTrayStore.dismiss();
        }
        navigate(...args)
    }

    function guardedNav(path) {
        if (guardFn) { guardFn(path, () => navigateAndDismissMore(path)); return }
        navigateAndDismissMore(path)
    }

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
            zIndex: 50,
        }}>
            {tabs.map(({ label, icon: Icon, path, action }) => {
                if (label === "Robo" && settings.aiAssistantName.trim() !== '') {
                    label = settings.aiAssistantName.trim()
                }

                const active = location.pathname === path
                return (
                    <button
                        key={path ?? label}
                        onClick={() => {
                            if (action != null) {
                                return action({ bottomTrayStore, navigate: guardedNav })
                            }
                            guardedNav(path)
                        }}
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