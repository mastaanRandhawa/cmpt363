import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, CheckSquare, Cpu, Calendar, MoreHorizontal, Settings, ChevronRight, HelpCircle, CircleAlert,
    MessageSquare, TimerIcon
} from 'lucide-react'
import useBottomTrayStore from '../data/useBottomTrayStore'
import useNavGuardStore from '../data/useNavGuardStore'
import { BottomTrayItem } from './BottomTray'
import { useRef, useEffect } from 'react'
import useSettingsStore from "../data/useSettingsStore.js";

// TODO: Update Robo icon

// BottomNav
// Persistent bottom navigation bar. Renders the five primary tabs and highlights the active
// route. Sticks to the bottom of the phone frame via position: sticky.
//
// No props — reads the current route from React Router's useLocation automatically.
//
// Measures its own rendered height and publishes it as --bottom-nav-height on the nearest
// positioned ancestor (the phone frame). BottomTray reads this variable so its top edge
// always aligns exactly with BottomNav's top edge, regardless of device safe-area padding.
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
    { label: 'Robo',     icon: Cpu,             path: '/robo' },
    { label: 'Calendar', icon: Calendar,        path: '/calendar' },
    { label: 'More',     icon: MoreHorizontal,  action: showMoreTray },
]

const trayItems = [
    { key: 'notifications', label: 'Notifications', icon: CircleAlert,   path: '/notifications' },
    { key: 'chat',          label: 'Chat',           icon: MessageSquare, path: '/robo/chat' },
    { key: 'timer',         label: 'Timer',          icon: TimerIcon,     path: '/timer' },
    { key: 'settings',      label: 'Settings',       icon: Settings,      path: '/settings' },
    { key: 'help',          label: 'Help',           icon: HelpCircle,    path: '/help' },
]

function showMoreTray({ bottomTrayStore, navigate }) {
    const { show, dismiss } = bottomTrayStore;
    show({
        id: 'moreNav',
        aboveNav: true,
        contents: (
            <>
                {trayItems.map(item => (
                    <BottomTrayItem
                        key={item.key}
                        label={item.label}
                        icon={item.icon}
                        rightIcon={item.rightIcon ?? ChevronRight}
                        onClick={() => {
                            navigate(item.path)
                            dismiss()
                        }}
                    />
                ))}
            </>
        ),
    })
}

function BottomNav() {
    const navigate    = useNavigate()
    const location          = useLocation()
    const settings                   = useSettingsStore()
    const bottomTrayStore = useBottomTrayStore()
    const bottomTrayID    = useBottomTrayStore(s => s.id)
    const guardFn         = useNavGuardStore(s => s.guardFn)
    const navRef          = useRef(null)

    // Publish the nav's rendered height as a CSS custom property so BottomTray
    // can position its bottom edge flush with the nav's top edge — regardless of
    // which device profile is active (and therefore how large the bottom padding is).
    useEffect(() => {
        const el = navRef.current
        if (!el) return

        const publish = () => {
            // Walk up to the nearest positioned ancestor (the phone frame div)
            // and set the variable there so any absolute child can read it.
            const frame = el.closest('[data-phone-frame]') ?? el.offsetParent ?? document.documentElement
            frame.style.setProperty('--bottom-nav-height', `${el.offsetHeight}px`)
        }

        publish()

        const ro = new ResizeObserver(publish)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    function navigateAndDismissMore(...args) {
        if (bottomTrayID === 'moreNav') {
            bottomTrayStore.dismiss()
        }
        navigate(...args)
    }

    function guardedNav(path) {
        if (guardFn) { guardFn(path, () => navigateAndDismissMore(path)); return }
        navigateAndDismissMore(path)
    }

    return (
        <div
            ref={navRef}
            data-onboarding="bottom-nav"
            style={{
                position: 'sticky',
                bottom: 0,
                background: 'var(--color-card)',
                borderTop: '1px solid var(--color-divider)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '12px 0 16px',
                zIndex: 1000,
            }}
        >
            {tabs.map(({ label, icon: Icon, path, action }) => {
                if (label == "Robo" && settings.aiAssistantName.trim() != '') {
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
                            width: '12%',
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
                            // Hide text if too long
                            width: '100%', // of parent button
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            wordBreak: 'break-all',
                            overflow: 'clip',
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