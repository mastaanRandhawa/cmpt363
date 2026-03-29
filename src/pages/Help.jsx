import { Command } from "lucide-react"

import Button from "../components/Button"
import Header from "../components/Header"

function Settings() {
    const buttonStyles = {
        minWidth: '30%',
        padding: '12px 22px',
    }

    const sectionDivStyle = {
        marginTop: '32px',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    }
    return (
        <>
            <Header onBack={true} />
            <div style={{
                color: 'var(--color-text)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
            }}>
                <Command size={48} />
                &nbsp;<span>Help</span>
            </div>

            {/* Demo Onboarding Actions */}
            <div style={sectionDivStyle}>
                <div style={{
                    textAlign: 'center',
                }}>
                    <p>Would you like a step-by-step refresher</p>
                    <p>on how to use the app?</p>
                </div>
                <Button
                    label="Launch Onboarding"
                    style={{
                        minWidth: '30%',
                        padding: '12px 22px',
                    }}
                />
            </div>

            {/* Demo Onboarding Actions */}
            <Divider/>
            <div style={sectionDivStyle}>
                <div style={{
                    textAlign: 'center',
                }}>
                    <p>This demo comes with pre-populated</p>
                    <p>tasks and data. Would you like to</p>
                    <p>restore the original demo data?</p>
                </div>
                <Button
                    label="Reset Demo"
                    variant="destructive"
                    style={{
                        minWidth: '30%',
                        padding: '12px 22px',
                    }}
                />
            </div>
            
            {/* Open Help in Browser */}
            <Divider/>
            <div style={sectionDivStyle}>
                <div style={{
                    textAlign: 'center',
                }}>
                    <p>Would you like to visit the online help page?</p>
                    <p>This will open in your default browser.</p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '16px',
                    gap: '8px',
                }}>
                    <Button
                        label="View Documentation"
                        variant="outline"
                        style={{
                            ...buttonStyles,
                            cursor: 'not-allowed',
                        }}
                    />
                </div>
            </div>
        </>
    )
}

function Divider() {
    return <div style={{
        flex: 1,
        height: '1px',
        background: 'var(--color-surface-alt)',
        margin: '32px 0' }} />
}

export default Settings
