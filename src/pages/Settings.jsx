import SegmentedControl from "../components/SegmentedControl"
import ListRow from "../components/ListRow"
import Toggle from "../components/Toggle"
import Header from "../components/Header"
import Section from "../components/Section"
import Chip from "../components/Chip"
import Input from "../components/Input"

function Settings() {
    return (
        <>
            <Header title="Settings" onBack={true} />
            <div className="page flex flex-col gap-4 p-6 min-h-screen">

                <Section header="GENERAL">
                    <ListRow
                        label="Energy Level Check-in"
                        description="Daily prompt asking you to update your energy level."
                        right={<Toggle label="?" checked={true} />} // TODO
                    />
                    <ListRow
                        label="AI Assitant Name"
                        description="Change the name of your AI buddy."
                    >
                        <Input
                            placeholder="Robo"
                            value="Robo"
                            type="text"
                            onChange={value => {}} // TODO
                        />
                    </ListRow>
                </Section>
                
                <Section header="TASKS">
                    <ListRow
                        label="Location-Based Tasks"
                        description="Use your current location to suggest tasks."
                        right={<Toggle label="?" checked={true} />} // TODO
                    />
                </Section>

                <Section header="AI ASSISTANCE">
                    <ListRow
                        label="Involvement Level"
                        description="How the AI will help you with your task management."
                    >
                        <SegmentedControl
                            options={[
                                { value: 'off', label: 'Off' },
                                { value: 'suggestive', label: 'Suggestive' },
                                { value: 'collaborative', label: 'Collaborative' },
                            ]}
                            value={'suggestive'} // TODO
                            onChange={value => {}} // TODO
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
                            value={'mentor'} // TODO
                            onChange={value => {}} // TODO
                            fullWidth
                        />
                    </ListRow>
                </Section>

                <Section header="NOTIFICATIONS">
                    <ListRow
                        label="Push Notifications"
                        description="Remind you of tasks while outside the app."
                        right={<Toggle label="?" checked={true} />} // TODO
                    />
                    <ListRow
                        label="Due Soon Reminders"
                        description="Get notified before a task is about to be due."
                        right={<Toggle label="?" checked={true} />} // TODO
                    />
                    <ListRow
                        label="Daily Reminder Time"
                        description="Choose a preferred time to receive your daily task summary."
                        right={<Toggle label="?" checked={true} />} // TODO
                    />
                    <ListRow
                        label="Smart Notifications"
                        description="Tailored notifications based on context."
                        right={<Chip label="COMING SOON" color="muted" />} // TODO
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
                            value={'high-priority'} // TODO
                            onChange={value => {}} // TODO
                            fullWidth
                        />
                    </ListRow>
                </Section>

            </div>
        </>
    )
/* //   // Toggle row (e.g. Push Notifications)
//   <ListRow
//     label="Push Notifications"
//     description="Remind you of tasks while outside the app."
//     right={<Toggle defaultOn onChange={val => setSetting('push', val)} />}
//   />
//
//   // Chevron row (e.g. More screen → Settings)
//   <ListRow
//     label="Settings"
//     right={<ChevronRight size={18} color="var(--color-text-muted)" />}
//     onPress={() => navigate('/settings')}
//   />
//
//   // Chip row (e.g. Smart Notifications)
//   <ListRow
//     label="Smart Notifications"
//     description="Tailored notifications based on context."
//     right={<Chip label="COMING SOON" color="muted" />}
//   />
//
//   // Control row — SegmentedControl below the label
//   <ListRow label="Involvement Level" description="How the AI will help you with your task management.">
//     <SegmentedControl
//       options={[{ value: 'off', label: 'Off' }, { value: 'suggestive', label: 'Suggestive' }, { value: 'collaborative', label: 'Collaborative' }]}
//       value={involvement}
//       onChange={setInvolvement}
//       fullWidth
//     />
//   </ListRow>
//
//   // Control row — Input below the label (e.g. AI Assistant Name)
//   <ListRow label="AI Assistant Name" description="Change the name of your AI buddy.">
//     <Input value={name} onChange={e => setName(e.target.value)} placeholder="Robo" />
//   </ListRow> }
            <SegmentedControl
                options={[{ value: 'off', label: 'Off' }, { value: 'suggestive', label: 'Suggestive' }, { value: 'collaborative', label: 'Collaborative' }]}
                value={"off"}
                onChange={() => {}}
                fullWidth
            />
        </div>
        </>
    )*/
}

export default Settings
