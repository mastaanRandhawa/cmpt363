import { useNavigate } from 'react-router-dom'
import { Command, Lock, Unlock } from 'lucide-react'
import Header from '../components/Header'
import useRoboStore, { xpProgressInLevel, levelFromXp } from '../data/useRoboStore'

const moods = [
    { label: 'Energized', emoji: '🚀' },
    { label: 'Good',      emoji: '😊' },
    { label: 'Meh',       emoji: '😐' },
    { label: 'Stressed',  emoji: '😰' },
    { label: 'Tired',     emoji: '😴' },
    { label: 'Frustrated',emoji: '😤' },
]

const xpSources = [
    { label: 'Complete a Task',    xp: 15 },
    { label: 'Early Finish Bonus', xp: 10 },
    { label: 'Daily Streak',       xp: 15 },
    { label: 'Mood Check-in',      xp:  5 },
]

const upgrades = [
    { label: 'Identity Chip',            level: 1,  description: "Give your Robo a name. They've earned it!" },
    { label: 'Priority Radar',           level: 2,  description: 'Robo scans your task list and points you toward the one that actually needs doing right now. Less scrolling, less second-guessing, more doing.' },
    { label: 'Big Task Destroyer',       level: 3,  description: "Scary task? Robo chops it into bite-sized pieces. Accept the whole plan, tweak a few steps, or toss what doesn't fit." },
    { label: 'Personal Scheduling Chip', level: 4,  description: "Tell Robo when you actually work and they'll stop suggesting things at 11pm. Revolutionary concept, honestly." },
    { label: 'Energy Calibrator',        level: 5,  description: 'Robo checks your energy level before making suggestions. Beast mode? Big tasks. Survival mode? Easy wins.' },
    { label: 'Habit Scanner',            level: 6,  description: 'Robo quietly notices your patterns and starts planning around them. Less "why is this scheduled then?" and more "oh wow, Robo actually gets me."' },
    { label: 'Celebration Unit',         level: 7,  description: 'Hit a personal best? Robo goes full confetti mode. Every win counts, and Robo will make sure you know it.' },
    { label: 'Mid-Week Pulse',           level: 8,  description: 'Once a week, Robo checks in with a quick progress update. A friendly tap on the shoulder, not a performance review.' },
    { label: 'Victory Log',              level: 9,  description: "A running record of everything you've completed. Open it on a hard day and remember — past you was pretty capable." },
    { label: 'CBT Chip',                 level: 10, description: "Robo's most powerful upgrade. Gentle, evidence-based prompts to help you reflect, reframe, and build better habits over time." },
]

function Robo() {
    const navigate   = useNavigate()
    const xp         = useRoboStore(s => s.xp)
    const streak     = useRoboStore(s => s.streak)
    const mood       = useRoboStore(s => s.mood)
    const moodDate   = useRoboStore(s => s.moodDate)
    const xpLog      = useRoboStore(s => s.xpLog)
    const setMood    = useRoboStore(s => s.setMood)

    const level    = levelFromXp(xp)
    const progress = xpProgressInLevel(xp)
    const today    = new Date().toISOString().slice(0, 10)
    const moodToday = moodDate === today ? mood : null

    const unlockedUpgrades = upgrades.filter(u => u.level <= level)
    const lockedUpgrades   = upgrades.filter(u => u.level >  level)

    return (
        <div style={{ color: 'var(--color-text-main)', paddingBottom: '96px' }}>

            <Header
                subtitle="YOUR COMPANION"
                title="Robo"
                rightAction={
                    <button
                        onClick={() => navigate('/robo/chat')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1.5px solid var(--color-text-main)', borderRadius: '20px', padding: '8px 16px', background: 'none', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                    >
                        <Command size={14} /> CHAT
                    </button>
                }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px 20px 0' }}>

                {/* mood selector */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                            TODAY'S MOOD
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {moods.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => setMood(i)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: moodToday === i
                                        ? '1.5px solid var(--color-primary)'
                                        : '1.5px solid var(--color-divider)',
                                    background: moodToday === i
                                        ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                                        : 'var(--color-card',
                                    color: moodToday === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                    {moodToday === null && (
                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            Check in for +5 XP
                        </p>
                    )}
                </div>

                {/* robo card */}
                <div style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 70%, black) 0%, color-mix(in srgb, var(--color-primary-soft) 70%, black) 100%)',
                    borderRadius: '20px',
                    padding: '18px 20px 20px',
                    display: 'flex', flexDirection: 'column', gap: '14px',
                }}>
                    {/* top row: icon+name | level+xp badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.1)', borderRadius: '14px',
                                width: '48px', height: '48px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <Command size={26} color="white" />
                            </div>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '0.04em' }}>ROBO</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '17px' }}>Level {level}</span>
                        </div>
                    </div>

                    {/* stats: streak + combo */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '14px',
                            padding: '12px 14px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: 0 }}>
                                {streak > 0 ? `${streak} ${streak === 1 ? 'Day' : 'Days'}` : '—'}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', margin: '3px 0 0' }}>STREAK</p>
                        </div>
                        <div style={{
                            flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '14px',
                            padding: '12px 14px', textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: 0 }}>
                                x{(1 + streak * 0.1).toFixed(1)}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', margin: '3px 0 0' }}>COMBO</p>
                        </div>
                    </div>

                    {/* xp bar */}
                    {level < 10 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}>XP</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>
                                    {progress.current} / {progress.max}
                                </span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '7px' }}>
                                <div style={{
                                    width: `${progress.percent}%`,
                                    height: '100%',
                                    background: 'white',
                                    borderRadius: '999px',
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* xp log */}
                {xpLog.length > 0 && (
                    <div>
                        <SectionDivider label="RECENT XP" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {xpLog.slice(0, 6).map((entry, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 4px',
                                    borderBottom: '1px solid var(--color-divider)',
                                }}>
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>{entry.reason}</span>
                                    <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '13px' }}>+{entry.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* xp sources */}
                <div>
                    <SectionDivider label="XP SOURCES" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {xpSources.map(source => (
                            <div key={source.label} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '12px 4px',
                                borderBottom: '1px solid var(--color-divider)',
                            }}>
                                <span style={{ fontSize: '14px' }}>{source.label}</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>+{source.xp}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* unlocked upgrades */}
                {unlockedUpgrades.length > 0 && (
                    <div>
                        <SectionDivider label="UPGRADES ACQUIRED" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {unlockedUpgrades.map(upgrade => (
                                <UpgradeCard key={upgrade.label} upgrade={upgrade} unlocked />
                            ))}
                        </div>
                    </div>
                )}

                {/* locked upgrades */}
                {lockedUpgrades.length > 0 && (
                    <div>
                        <SectionDivider label="LOCKED UPGRADE CHIPS" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lockedUpgrades.map(upgrade => (
                                <UpgradeCard key={upgrade.label} upgrade={upgrade} unlocked={false} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

function SectionDivider({ label }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                {label}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
        </div>
    )
}

function UpgradeCard({ upgrade, unlocked }) {
    return (
        <div style={{
            background: 'var(--color-card',
            borderRadius: '14px',
            padding: '14px',
            opacity: unlocked ? 1 : 0.6,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Command size={16} color={unlocked ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{upgrade.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {unlocked
                        ? <Unlock size={12} color="var(--color-success)" />
                        : <Lock size={12} color="var(--color-text-muted)" />
                    }
                    <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: unlocked ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}>
                        LVL {upgrade.level}
                    </span>
                </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                {upgrade.description}
            </p>
        </div>
    )
}

export default Robo