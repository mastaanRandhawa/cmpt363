import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import TaskCreate from './pages/TaskCreate'
import Robo from './pages/Robo'
import Calendar from './pages/Calendar'
import Help from './pages/help'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import LockScreen from './pages/LockScreen'
import BottomNav from './components/BottomNav'
import BottomTray from './components/BottomTray'
import Timer from './pages/Timer'
import Toast from './components/Toast'
import useToastStore from './data/useToastStore'
import useTaskStore from './data/useTaskStore'
import useNotificationStore from './data/useNotificationStore'
import useRoboStore from './data/useRoboStore'
import useBottomTrayStore from './data/useBottomTrayStore'
import useSessionStore from './data/useSessionStore'
//import DebugPanel from './components/DebugPanel'
import Chat from "./pages/Chat.jsx";
import { useDeviceProfile } from './hooks/useDeviceProfile'
import OnboardingOverlay from './components/OnboardingOverlay'

const themes = [
    { value: 'lavender', label: 'Lavender Mist' },
    { value: 'ocean',    label: 'Midnight Ocean' },
    { value: 'arctic',   label: 'Arctic Dusk' },
    { value: 'matcha',   label: 'Matcha Latte' },
    { value: 'original', label: 'Original' },
]

const devControlStyle = {
    background: '#1a1a1a',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none',
}

function StatusBar() {
    const [time, setTime] = useState(() => {
        const now = new Date()
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    })

    useEffect(() => {
        const id = setInterval(() => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
        }, 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '54px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingBottom: '6px',
            paddingLeft: '28px',
            paddingRight: '28px',
            background: 'var(--color-bg)',
            zIndex: 9,
            pointerEvents: 'none',
        }}>
            <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '0.01em',
                lineHeight: 1,
            }}>
                {time}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Signal bars */}
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <rect x="0"   y="8"   width="3" height="4"    rx="1" fill="var(--color-text-main)" />
                    <rect x="4.5" y="5"   width="3" height="7"    rx="1" fill="var(--color-text-main)" />
                    <rect x="9"   y="2.5" width="3" height="9.5"  rx="1" fill="var(--color-text-main)" />
                    <rect x="13.5" y="0"  width="3" height="12"   rx="1" fill="var(--color-text-main)" opacity="0.3" />
                </svg>
                {/* Wi-Fi */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="var(--color-text-main)" />
                    <path d="M3.5 6.5C4.9 5.1 6.4 4.4 8 4.4s3.1.7 4.5 2.1" stroke="var(--color-text-main)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M1 3.8C3.1 1.7 5.4.7 8 .7s4.9 1 7 3.1" stroke="var(--color-text-main)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                </svg>
                {/* Battery */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                    <div style={{
                        width: '25px',
                        height: '12px',
                        borderRadius: '3px',
                        border: '1.5px solid var(--color-text-main)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            width: '75%',
                            height: '100%',
                            background: 'var(--color-text-main)',
                            borderRadius: '1px',
                        }} />
                    </div>
                    <div style={{
                        width: '2px',
                        height: '5px',
                        background: 'var(--color-text-main)',
                        borderRadius: '0 1px 1px 0',
                        opacity: 0.5,
                    }} />
                </div>
            </div>
        </div>
    )
}

function App() {
    const [theme, setTheme] = useState(() => {
        document.documentElement.setAttribute('data-theme', 'original')
        return 'original'
    })

    const [locked, setLocked] = useState(true)
    const setUnlocked         = useSessionStore(s => s.setUnlocked)

    function handleUnlock() {
        setLocked(false)
        setUnlocked()
    }

    const { isRealDevice, match, sw, sh } = useDeviceProfile()
    const bottomTrayAboveNav = useBottomTrayStore(s => s.aboveNav ?? false)
    const bottomTrayID       = useBottomTrayStore(s => s.id)
    const bottomTray         = useBottomTrayStore(s => s.contents)
    const toast              = useToastStore(s => s.toast)
    const fetchTasks         = useTaskStore(s => s.fetchTasks)
    const fetchNotifications = useNotificationStore(s => s.fetchNotifications)
    const fetchRobo          = useRoboStore(s => s.fetchRobo)
    const checkStreak        = useRoboStore(s => s.checkStreak)

    useEffect(() => {
        fetchTasks()
        fetchNotifications()
        fetchRobo().then(() => checkStreak())
    }, []) // eslint-disable-line

    function handleTheme(value) {
        setTheme(value)
        document.documentElement.setAttribute('data-theme', value)
        bottomTrayAboveNav.marginBottom = 80
    }

    const frameW = match ? match.w : 440
    const frameH = match ? match.h : 956

    const desktopScale = Math.min(
        1,
        (window.innerHeight - 120) / frameH,
        (window.innerWidth  - 48)  / frameW,
    )

    const routes = (
        <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/tasks"         element={<Tasks />} />
            <Route path="/tasks/create"  element={<TaskCreate />} />
            <Route path="/tasks/:id"     element={<TaskDetail />} />
            <Route path="/robo"          element={<Robo />} />
            <Route path="/calendar"      element={<Calendar />} />
            <Route path="/help"          element={<Help />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/timer"         element={<Timer />} />
            <Route path="/tasks/:id/edit" element={<TaskCreate />} />
            <Route path="/robo/chat"     element={<Chat />} />
        </Routes>
    )

    // ─── Real device (phone / tablet): full-screen, no frame ───────────────────
    if (isRealDevice) {
        return (
            <div
                data-phone-frame
                style={{
                    width: '100vw',
                    height: '100dvh',
                    background: 'var(--color-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                ref={el => {
                    if (!el) return
                    el._swipeGuard = el._swipeGuard || (() => {
                        function handler(e) {
                            const x = e.touches[0].clientX
                            if (x < 24 || x > window.innerWidth - 24) e.preventDefault()
                        }
                        el.addEventListener('touchstart', handler, { passive: false })
                        el._swipeGuardCleanup = () => el.removeEventListener('touchstart', handler)
                    })()
                }}
            >
                {locked && <LockScreen onUnlock={handleUnlock} />}

                <BrowserRouter>
                    <div
                        className="phone-scroll"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            paddingTop: 'env(safe-area-inset-top, 0px)',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {routes}
                    </div>

                    {toast && (
                        <Toast
                            message={toast.message}
                            icon={toast.icon}
                            progress={toast.progress}
                            barColor={toast.barColor}
                            actionLabel={toast.actionLabel}
                            onAction={toast.onAction}
                        />
                    )}

                    {bottomTray && (
                        <BottomTray id={bottomTrayID} aboveNav={bottomTrayAboveNav}>
                            {bottomTray}
                        </BottomTray>
                    )}

                    <BottomNav />
                    <OnboardingOverlay />
                </BrowserRouter>
            </div>
        )
    }

    // ─── Desktop: scaled phone frame + dev controls ─────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
        }}>
            {/* dev controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <select
                    value={theme}
                    onChange={e => handleTheme(e.target.value)}
                    style={devControlStyle}
                >
                    {themes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                <button onClick={fetchTasks} style={devControlStyle}>
                    ↺ Refresh Tasks
                </button>

                <span style={{ ...devControlStyle, cursor: 'default', opacity: 0.6 }}>
                    {match ? match.name : `${sw}×${sh}`} · ×{desktopScale.toFixed(2)}
                </span>
            </div>

            {/* Phone frame */}
            <div
                id="phone-frame"
                data-phone-frame
                style={{
                    width:  `${frameW}px`,
                    height: `${frameH}px`,
                    transform: `scale(${desktopScale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(frameH * desktopScale) - frameH}px`,
                    background: 'var(--color-bg)',
                    borderRadius: '56px',
                    border: '8px solid #2a2a2a',
                    boxShadow: '0 0 0 1px #444, 0 32px 80px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Status Bar */}
                <StatusBar />

                {/* Dynamic Island */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '126px',
                    height: '36px',
                    background: '#0a0a0a',
                    borderRadius: '20px',
                    zIndex: 1000,
                }} />

                {locked && <LockScreen onUnlock={handleUnlock} />}

                <BrowserRouter>
                    <div
                        className="phone-scroll"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            paddingTop: '54px',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {routes}
                    </div>

                    {toast && (
                        <Toast
                            message={toast.message}
                            icon={toast.icon}
                            progress={toast.progress}
                            barColor={toast.barColor}
                            actionLabel={toast.actionLabel}
                            onAction={toast.onAction}
                        />
                    )}

                    {/* Bottom tray */}
                    {bottomTray && (
                        <BottomTray id={bottomTrayID} aboveNav={bottomTrayAboveNav}>
                            {bottomTray}
                        </BottomTray>
                    )}

                    <BottomNav />
                    <OnboardingOverlay />
                </BrowserRouter>
            </div>
        </div>
    )
}

export default App