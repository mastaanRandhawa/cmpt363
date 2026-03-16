import { useState } from 'react'
import { Command } from 'lucide-react'

const moods = ['😄', '🙂', '😊', '😐', '😕', '😮']

const xpSources = [
    { label: 'Complete a Task',   xp: 15 },
    { label: 'Early Finish Bonus', xp: 10 },
    { label: 'Focus Session',     xp: 10 },
    { label: 'Daily Streak',      xp: 15 },
]

const upgrades = [
    { label: 'Identity Chip',         level: 1,  description: 'Give your Robo a name. They\'ve earned it!',                                                                                                                                 unlocked: true },
    { label: 'Priority Radar',        level: 2,  description: 'Robo scans your task list and points you toward the one that actually needs doing right now. Less scrolling, less second-guessing, more doing.',                             unlocked: true },
    { label: 'Big Task Destroyer',    level: 3,  description: 'Scary task? Robo chops it into bite-sized pieces. Accept the whole plan, tweak a few steps, or toss what doesn\'t fit. Either way, "where do I even start" is no longer your problem.', unlocked: true },
    { label: 'Personal Scheduling Chip', level: 4, description: 'Tell Robo when you actually work and they\'ll stop suggesting things at 11pm. Revolutionary concept, honestly.',                                                           unlocked: true },
    { label: 'Energy Calibrator',     level: 5,  description: 'Robo checks your energy level before making suggestions. Beast mode? Big tasks. Survival mode? Easy wins. No mismatch, no guilt.',                                           unlocked: false },
    { label: 'Habit Scanner',         level: 6,  description: 'Robo quietly notices your patterns and starts planning around them. Less "why is this scheduled then?" and more "oh wow, Robo actually gets me."',                           unlocked: false },
    { label: 'Celebration Unit',      level: 7,  description: 'Hit a personal best? Robo goes full confetti mode. Every win counts, and Robo will make sure you know it.',                                                                  unlocked: false },
    { label: 'Mid-Week Pulse',        level: 8,  description: 'Every Wednesday, Robo checks in with a quick progress update. Think of it as a friendly tap on the shoulder, not a performance review.',                                     unlocked: false },
    { label: 'Victory Log',           level: 9,  description: 'A running record of everything you\'ve completed. Open it on a hard day and remember — past you was pretty capable. Current you is too.',                                    unlocked: false },
    { label: 'CBT Chip',              level: 10, description: 'Robo\'s most powerful upgrade. Gentle, evidence-based prompts to help you reflect, reframe, and build better habits over time. Still your Robo — just a little wiser. Toggle on or off anytime in Settings.', unlocked: false },
]

function Robo() {
    const [selectedMood, setSelectedMood] = useState(null)
    const [xpOpen, setXpOpen] = useState(true)

    const xp = 230
    const xpMax = 500
    const xpPercent = (xp / xpMax) * 100

    return (
        <div className="page flex flex-col gap-6 p-5 pb-24" style={{ color: 'var(--color-text)' }}>

            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>
                        YOUR COMPANION
                    </p>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Robo</h1>
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1.5px solid var(--color-text)',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    background: 'none',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                }}>
                    <Command size={14} />
                    CHAT
                </button>
            </div>

            {/* mood selector */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
            TODAYS MOOD
          </span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {moods.map((mood, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedMood(i)}
                            style={{
                                fontSize: '24px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: selectedMood === i ? 'var(--color-surface-alt)' : 'none',
                                transition: 'background 0.15s',
                            }}
                        >
                            {mood}
                        </button>
                    ))}
                </div>
            </div>

            {/* robo card */}
            <div style={{
                background: 'linear-gradient(135deg, #7C6FCD 0%, #5B4FAA 100%)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '14px',
                            width: '52px',
                            height: '52px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Command size={28} color="white" />
                        </div>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>ROBO</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '16px' }}>Level 4</span>
                </div>

                {/* stats */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[{ value: '3 Days', label: 'STREAK' }, { value: 'x1.5', label: 'COMBO' }].map(stat => (
                        <div key={stat.label} style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            padding: '10px',
                            textAlign: 'center',
                        }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: 0 }}>{stat.value}</p>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', margin: 0 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* xp bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 600 }}>XP</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{xp} / {xpMax}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '6px' }}>
                        <div style={{
                            width: `${xpPercent}%`,
                            height: '100%',
                            background: 'white',
                            borderRadius: '999px',
                        }} />
                    </div>
                </div>
            </div>

            {/* xp sources */}
            <div>
                <button
                    onClick={() => setXpOpen(o => !o)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        padding: 0,
                        marginBottom: '12px',
                        width: '100%',
                    }}
                >
                    <span>{xpOpen ? '▼' : '▶'}</span>
                    XP SOURCES
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)', marginLeft: '8px' }} />
                </button>

                {xpOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {xpSources.map(source => (
                            <div key={source.label} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px 4px',
                                borderBottom: '1px solid var(--color-surface-alt)',
                            }}>
                                <span style={{ fontSize: '14px' }}>{source.label}</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
                  + {source.xp}
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* unlocked upgrades */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>UPGRADES ACQUIRED</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {upgrades.filter(u => u.unlocked).map(upgrade => (
                        <div key={upgrade.label} style={{ background: 'var(--color-surface)', borderRadius: '14px', padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Command size={16} color="var(--color-text-muted)" />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{upgrade.label}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
            LEVEL {upgrade.level} 🔓
          </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>{upgrade.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* locked upgrades */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>LOCKED UPGRADE CHIPS</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-surface-alt)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {upgrades.filter(u => !u.unlocked).map(upgrade => (
                        <div key={upgrade.label} style={{ background: 'var(--color-surface)', borderRadius: '14px', padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Command size={16} color="var(--color-text-muted)" />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{upgrade.label}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 600 }}>
            LEVEL {upgrade.level} 🔒
          </span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>{upgrade.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Robo