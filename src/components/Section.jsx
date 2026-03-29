// Section
// Container for children with optional label, collapse support, and right action.
// Will self-manage its collapsed state UNLESS both 'collapsed' and 'onSetCollapsed' props are provided.
//
// Props:
//   header         – string, small caps label displayed to the left of the divider
//   headerColor    – string, CSS 'color' property for the label
//   headerStyle    – object, CSS passed to the header
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
                            headerStyle,
                            dividerColor = 'var(--color-divider)', // Defaulting to theme divider

                            collapsible = false,
                            collapseMode = 'hide',

                            rightAction,
                            children,

                            style,

                            collapsed: externCollapsed,
                            onSetCollapsed: externSetCollapsed,
                        }) {
    // Internal state for self-managed collapse
    const [internalCollapsed, setInternalCollapsed] = useState(false);

    // Check if parent is controlling state
    const isControlled = externCollapsed !== undefined && externSetCollapsed !== undefined;
    const collapsed = isControlled ? externCollapsed : internalCollapsed;
    const setCollapsed = isControlled ? externSetCollapsed : setInternalCollapsed;

    const shouldHideContents = collapsed && (collapseMode === 'hide');
    const shouldRemoveContents = collapsed && (collapseMode === 'remove');

    return (
        <div style={{ marginBottom: '16px', ...style }}>
            <SectionHeading
                text={header}
                collapsible={collapsible}
                collapsed={collapsed}
                onSetCollapsed={setCollapsed}
                rightAction={rightAction}
                color={headerColor}
                dividerColor={dividerColor}
                style={headerStyle}
            />
            {(!shouldRemoveContents) &&
                <div style={shouldHideContents ? { display: "none" } : {}}>
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

                                   // Defaulting to a softer secondary color for better hierarchy
                                   color = 'var(--color-text-secondary)',
                                   dividerColor = 'var(--color-divider)',

                                   style,
                               }) {
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        background: 'none',
        border: 'none',
        padding: '12px 0',
        color,
        ...style,
    }

    const contents = (
        <>
            {/* Text for the section heading - Using label-caps for consistency */}
            {text != null &&
                <span className="label-caps" style={{ whiteSpace: 'nowrap' }}>
                    {text}
                </span>
            }

            {/* Horizontal divider */}
            <div style={{
                flex: 1,
                height: '1px',
                background: dividerColor,
                opacity: 0.6 // Keeping the line subtle
            }} />

            {/* Right Side Logic: Chevron or RightAction */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {rightAction}

                {collapsible && (
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                        {collapsed
                            ? <ChevronDown size={16} color="var(--color-text-secondary-muted)" />
                            : <ChevronUp size={16} color="var(--color-text-secondary-muted)" />
                        }
                    </div>
                )}
            </div>
        </>
    )

    if (collapsible) {
        return (
            <button
                onClick={() => onSetCollapsed(!collapsed)}
                style={{ ...containerStyle, cursor: "pointer" }}
                className="active:opacity-70 transition-opacity"
            >
                {contents}
            </button>
        )
    }

    return <div style={containerStyle}>{contents}</div>
}

export default Section