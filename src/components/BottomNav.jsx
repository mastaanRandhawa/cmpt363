import { useNavigate, useLocation } from 'react-router-dom'
import {
    Home, CheckSquare, Cpu, Calendar, MoreHorizontal, Settings, ChevronRight, HelpCircle, CircleAlert,
    MessageSquare, TimerIcon
} from 'lucide-react'
import useBottomTrayStore from '../data/useBottomTrayStore'
import useNavGuardStore from '../data/useNavGuardStore'
import { BottomTrayItem } from './BottomTray'
import useSettingsStore from '../data/useSettingsStore'

const tabs = [
    { label: 'Home',     icon: Home,           path: '/' },
    { label: 'Tasks',    icon: CheckSquare,     path: '/tasks' },
    { label: 'Robo',       icon: Cpu,             path: '/robo' },
    { label: 'Calendar', icon: Calendar,        path: '/calendar' },
    { label: 'More',     icon: MoreHorizontal,  action: showMoreTray },
]

const trayItems = [
    { label: 'Chat', icon: MessageSquare, path: '/robo/chat' },
    { label: 'Timer', icon: TimerIcon, path: '/timer' },
    { label: 'Notifications', icon: CircleAlert, path: '/notifications' },
    { label: 'Settings', icon: Settings, path: '/settings' },
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
            // Updated to use card/divider for a lifted bar feel
            background: 'var(--color-card)',
            borderTop: '1px solid var(--color-divider)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '12px 0 28px',
            zIndex: 50,
        }}>
            {tabs.map(({ label, icon: Icon, path, action }) => {
                const effectiveLabel = (label === "Robo" && settings.aiAssistantName.trim() !== '')
                    ? settings.aiAssistantName.trim()
                    : label;

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
                            width: '18%', // Increased slightly for better tap targets
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            // Primary for active, muted for inactive
                            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary-muted)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                        <span className="label-caps" style={{
                            // Override label-caps size for the tiny nav text
                            fontSize: '10px',
                            fontWeight: active ? '700' : '500',
                            textAlign: 'center',
                            width: '100%',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                        }}>
                            {effectiveLabel}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default BottomNav