import SegmentedControl from "../components/SegmentedControl"
import ListRow from "../components/ListRow"
import Toggle from "../components/Toggle"
import Header from "../components/Header"
import Section from "../components/Section"
import Chip from "../components/Chip"
import Input from "../components/Input"
import useSettingsStore from "../data/useSettingsStore"

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
            <div className="page flex flex-col gap-4 p-6 min-h-screen">

                <Section header="GENERAL" {...sectionProps}>
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
                        label="Involvement Level"
                        description="How the AI will help you with your task management."
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
                    >
                        <SegmentedControl
                            options={[
                                { value: 'mentee', label: 'Mentee' },
                                { value: 'mentor', label: 'Mentor' },
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
