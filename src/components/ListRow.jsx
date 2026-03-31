// ListRow
// A single settings-style row with a label, optional description, and a right-side slot.
// For rows that need a control below the label (SegmentedControl, Input), pass it as children.
//
// Props:
//   label       – string, primary row label
//   description – string, smaller muted text below the label (optional)
//   right       – ReactNode, rendered on the right side — pass a <Toggle>, <Chip>, or <ChevronRight>
//                 icon for the three most common patterns (optional)
//   onPress     – () => void, makes the whole row tappable (used for chevron rows) (optional)
//   children    – ReactNode, rendered below the label row — use for SegmentedControl or Input
//                 controls that need their own full-width line (optional)
//
// Usage examples:
//   // Toggle row (e.g. Push Notifications)
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
//   </ListRow>

// ListSection
// Small-caps section divider label with a horizontal rule, used to group ListRows.
//
// Props:
//   label – string, section heading text (e.g. 'GENERAL', 'AI ASSISTANCE')
//
// Usage:
//   <ListSection label="GENERAL" />
//   <ListRow ... />
//   <ListRow ... />
//   <ListSection label="TASKS" />
//   <ListRow ... />

// Since ListRow and ListSection are always called together, they are both in this file for simplicity
// ListRow
// A single settings-style row with a label, optional description, and a right-side slot.
// For rows that need a control below the label (SegmentedControl, Input), pass it as children.
//
// Props:
//   label       – string, primary row label
//   description – string, smaller muted text below the label (optional)
//   right       – ReactNode, rendered on the right side — pass a <Toggle>, <Chip>, or <ChevronRight>
//                 icon for the three most common patterns (optional)
//   onPress     – () => void, makes the whole row tappable (used for chevron rows) (optional)
//   children    – ReactNode, rendered below the label row — use for SegmentedControl or Input
//                 controls that need their own full-width line (optional)
//
// Usage examples:
//   // Toggle row (e.g. Push Notifications)
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
//   </ListRow>

// ListSection
// Small-caps section divider label with a horizontal rule, used to group ListRows.
//
// Props:
//   label – string, section heading text (e.g. 'GENERAL', 'AI ASSISTANCE')
//
// Usage:
//   <ListSection label="GENERAL" />
//   <ListRow ... />
//   <ListRow ... />
//   <ListSection label="TASKS" />
//   <ListRow ... />

// Since ListRow and ListSection are always called together, they are both in this file for simplicity

export function ListSection({ label }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '20px 20px 8px',
        }}>
            <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
            }}>
                {label}
            </span>
            <div style={{
                flex: 1,
                height: '1px',
                background: 'var(--color-divider)',
            }} />
        </div>
    )
}

export function ListRow({ label, description, right, onPress, children }) {
    const isClickable = !!onPress

    return (
        <div
            onClick={onPress}
            style={{
                padding: '14px 20px',
                cursor: isClickable ? 'pointer' : 'default',
                background: isClickable ? 'transparent' : undefined,
                transition: isClickable ? 'opacity 0.15s' : undefined,
            }}
            className={isClickable ? 'active:opacity-60' : ''}
        >
            {/* label row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
            }}>
                {/* left: label + description */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--color-text-main)',
                    }}>
                        {label}
                    </span>
                    {description && (
                        <span style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            lineHeight: 1.4,
                        }}>
                            {description}
                        </span>
                    )}
                </div>

                {/* right slot */}
                {right && (
                    <div style={{ flexShrink: 0 }}>
                        {right}
                    </div>
                )}
            </div>

            {/* children slot — full-width control below the label row */}
            {children && (
                <div style={{ marginTop: '12px' }}>
                    {children}
                </div>
            )}
        </div>
    )
}

export default ListRow