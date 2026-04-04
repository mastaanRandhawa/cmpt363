import { useState } from "react"
import SegmentedControl from "../components/SegmentedControl"
import ListRow from "../components/ListRow"
import Toggle from "../components/Toggle"
import Header from "../components/Header"
import Section from "../components/Section"
import Chip from "../components/Chip"
import Input from "../components/Input"
import useSettingsStore from "../data/useSettingsStore"

const PERSONALITY_POOL = [
    'Witty', 'Encouraging', 'Direct', 'Calm', 'Playful',
    'Motivating', 'Gentle', 'Enthusiastic', 'Concise',
    'Friendly', 'Professional', 'Serious', 'Cheerful', 'Patient',
]

const VISIBLE_COUNT = 6

function PersonalitySection({ selected, onSelect, onRemove }) {
    const [poolOrder, setPoolOrder] = useState(PERSONALITY_POOL)

    const available = poolOrder.filter(p => !selected.includes(p))
    const visibleOptions = available.slice(0, VISIBLE_COUNT)

    function handleDismiss(name) {
        setPoolOrder(prev => [...prev.filter(p => p !== name), name])
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selected.length > 0 && (
                <div>
                    <p className="label-caps" style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
                        Current Personality
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {selected.map(name => (
                            <button
                                key={name}
                                onClick={() => onRemove(name)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '100px',
                                    padding: '5px 10px 5px 12px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: 500,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {name}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.25)',
                                    fontSize: 10,
                                    lineHeight: 1,
                                }}>✕</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <p className="label-caps" style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Add more personality
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {visibleOptions.map(name => (
                        <div key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                            <button
                                onClick={() => onSelect(name)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: 'var(--color-primary-soft)',
                                    color: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '100px 0 0 100px',
                                    padding: '5px 8px 5px 12px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: 500,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {name}
                            </button>
                            <button
                                onClick={() => handleDismiss(name)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 28,
                                    height: 28,
                                    background: 'var(--color-primary-soft)',
                                    color: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '0 100px 100px 0',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                    paddingRight: 6,
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {visibleOptions.length === 0 && (
                        <span className="label-caps" style={{ color: 'var(--color-text-muted)' }}>
                            No more options — remove some to free up space.
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

function Settings() {
    const settings = useSettingsStore()
    const sectionProps = {
        headerStyle: {
            paddingBottom: 0,
        },
        style: {
            marginBottom: 12,
        },
    }

    return (
        <>
            <Header title="Settings" onBack={true} />
            <div className="page flex flex-col gap-4 p-6 min-h-screen" style={{ padding: '16px' }}>

                <Section header="GENERAL" {...sectionProps}>
                    <ListRow
                        label="User Name"
                        description="What is your user name?"
                    >
                        <Input
                            placeholder="User"
                            value={settings.userName}
                            type="text"
                            onChange={evt => settings.setUserName(evt.target.value)}
                            onBlur={evt => {
                                if (!evt.target.value.trim()) settings.setUserName('')
                            }}
                        />
                    </ListRow>
                    <ListRow
                        label="Energy Level Check-in"
                        description="Daily prompt asking you to update your energy level."
                        right={<Toggle checked={settings.enableEnergyLevelCheckIn} onChange={settings.setEnableEnergyLevelCheckIn} />}
                    />
                    <ListRow
                        label="AI Assitant Name"
                        description="Change the name of your AI buddy."
                    >
                        <Input
                            placeholder="Robo"
                            value={settings.aiAssistantName}
                            type="text"
                            onChange={evt => {
                                settings.setAiAssistantName(evt.target.value)
                            }}
                        />
                    </ListRow>
                </Section>
                
                <Section header="TASKS" {...sectionProps}>
                    <ListRow
                        label="Location-Based Tasks"
                        description="Use your current location to suggest tasks."
                        right={<Toggle checked={settings.enableLocationBasedTasks} onChange={settings.setEnableLocationBasedTasks} />}
                    />
                </Section>

                <Section header="AI ASSISTANCE" {...sectionProps}>
                    <ListRow
                        label="Personality"
                        description="Shape how your AI assistant communicates with you."
                    >
                        <PersonalitySection
                            selected={settings.aiPersonalities}
                            onSelect={name => settings.setAiPersonalities([...settings.aiPersonalities, name])}
                            onRemove={name => settings.setAiPersonalities(settings.aiPersonalities.filter(p => p !== name))}
                        />
                    </ListRow>
                    <ListRow
                        label="Involvement Level"
                        description="How the AI will help you with your task management."
                        right={<Chip label="COMING SOON" color="muted" />}
                    >
                        <SegmentedControl
                            options={[
                                { value: 'off', label: 'Off', disabled: true },
                                { value: 'suggestive', label: 'Suggestive' },
                                { value: 'collaborative', label: 'Collaborative', disabled: true },
                            ]}
                            value={settings.aiInvolvementLevel}
                            onChange={settings.setAiInvolvementLevel}
                            fullWidth
                        />
                    </ListRow>
                    <ListRow
                        label="Behaviour"
                        description="How AI Assistant would behave."
                        right={<Chip label="COMING SOON" color="muted" />}
                    >
                        <SegmentedControl
                            options={[
                                { value: 'helper', label: 'Helper' },
                                { value: 'mentee', label: 'Mentee', disabled: true },
                                { value: 'mentor', label: 'Mentor', disabled: true },
                            ]}
                            value={settings.aiBehaviour}
                            onChange={settings.setAiBehaviour}
                            fullWidth
                        />
                    </ListRow>
                </Section>

                <Section header="NOTIFICATIONS" {...sectionProps}>
                    <ListRow
                        label="Push Notifications"
                        description="Remind you of tasks while outside the app."
                        right={<Toggle checked={settings.enablePushNotifications} onChange={settings.setEnablePushNotifications} />}
                    />
                    <ListRow
                        label="Due Soon Reminders"
                        description="Get notified before a task is about to be due."
                        right={<Toggle checked={settings.enableDueSoonReminders} onChange={settings.setEnableDueSoonReminders} />}
                    />
                    <ListRow
                        label="Daily Reminders"
                        description="Receive a daily summary of your upcoming tasks."
                        right={<Toggle checked={settings.enableDailyReminders} onChange={settings.setEnableDailyReminders} />}
                    />
                    <ListRow
                        label="Smart Notifications"
                        description="Tailored notifications based on context."
                        right={<Chip label="COMING SOON" color="muted" />}
                    />
                    <ListRow
                        label="Frequency"
                        description="What you want to be notified about."
                    >
                        <SegmentedControl
                            options={[
                                { value: 'everything', label: 'Everything' },
                                { value: 'high-priority', label: 'High Priority Only' },
                            ]}
                            value={settings.notificationFrequency}
                            onChange={settings.setNotificationFrequency}
                            fullWidth
                        />
                    </ListRow>
                </Section>

            </div>
        </>
    )
}

export default Settings
