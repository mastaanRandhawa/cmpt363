// Section
// Container for children with optional label, collapse support, and right action.
// Will self-manage its collapsed state UNLESS both 'collapsed' and 'onSetCollapsed' props are provided.
//
// Props:
//   header         – string, small caps label displayed to the left of the divider
//   headerColor    – string, CSS 'color' property for the label
//   dividerColor   – string, CSS 'background-color' property for the divider
//
//   collapsible    – boolean, if true allows the section to be collapsed
//   collapseMode   – 'hide'|'remove', specifies whether children should be hidden or removed when collapsed
//   collapsed      – boolean, if it and onSetCollapsed specified, provides the collapsed state
//   onSetCollapsed – (boolean) => void, if it and collapsed specified, is called to change the collapsed state
//
//   children       – ReactNode, content rendered within the section that will be collapsed
//   rightAction    – ReactNode, anything rendered on the right side (icon buttons, chips, etc.)
//
// Usage examples:
//   // Simple section (no collapse)
//   <Section header="GENERAL"> ... </Section>
//
//   // Simple section with custom colors (note the lack of 'u')
//   <Section header="GENERAL" headerColor="red" dividerColor="green"> ... </Section>
//
//   // Collapsible section
//   <Section header="TASKS" collapsible={true}> ... </Section>
//
//   // Collapsible section with state managed by parent
//   <Section
//       header="TASKS"
//       collapsible={true}
//       collapsed={tasksCollapsed}
//       onSetCollapsed={setTasksCollapsed}
//   > ... </Section>
//
//   // Section with right-side action (e.g. add new task)
//   <Section
//       header="TASKS"
//       rightAction={
//           <button
//               onClick={() => navigate('/tasks/create')}
//               style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: 0 }}
//           >
//               <Plus size={16} />
//           </button>
//       }
//   > ... </Section>
//

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react'

export function Section({
    header,
    headerColor,
    dividerColor,

    collapsible = false,
    collapseMode = 'hide', // 'hide' or 'remove'

    rightAction,
    children,

    // Only if externally managing collapsed state
    collapsed: externCollapsed,
    onSetCollapsed: externSetCollapsed,
}) {
    // Set up self-managed collapse state or refer to external collapsed state.
    let [collapsed, setCollapsed] = useState(false);
    if (externCollapsed != null && externSetCollapsed != null) {
        collapsed = externCollapsed
        setCollapsed = externSetCollapsed
    }

    // Determine how to handle collapsing.
    const shouldHideContents = collapsed && (collapseMode === 'hide');
    const shouldRemoveContents = collapsed && (collapseMode === 'remove');

    return (
        <div>
            <SectionHeading
                text={header}
                collapsible={collapsible}
                collapsed={collapsed}
                onSetCollapsed={setCollapsed}
                rightAction={rightAction}
                color={headerColor}
                dividerColor={dividerColor}
            />
            {(!shouldRemoveContents) &&
                <div style={shouldHideContents ? {display: "none"} : {}}>
                    {children}
                </div>
            }
        </div>
    )
}

export function SectionHeading({
    text,
    collapsible,
    collapsed,
    onSetCollapsed,
    rightAction,

    color = 'var(--color-primary)',
    dividerColor = 'var(--color-surface-alt)',

    style,
}) {
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        background: 'none',
        border: 'none',
        padding: '0 0 12px',

        // Add user-specified styles.
        color,
        ...style,
    }

    const contents = (
        <>
            {/* Chevron to indicate collapsed state */}
            {collapsible && (collapsed
                ? <ChevronUp size={14} color={color} />
                : <ChevronDown size={14} color={color} />
            )}

            {/* Text for the section heading */}
            {text != null &&
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {text}
                </span>
            }

            {/* Horizontal divider */}
            <div style={{ flex: 1, height: '1px', background: dividerColor, marginLeft: '4px' }} />

            {rightAction}
        </>
    )

    return collapsible
        ? <button
            onClick={() => onSetCollapsed(!collapsed)}
            style={{...containerStyle, cursor: "pointer"}}>{contents}</button>
        : <div style={containerStyle}>{contents}</div>
}

export default Section