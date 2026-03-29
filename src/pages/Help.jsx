import { Command } from "lucide-react"

import Button from "../components/Button"
import Header from "../components/Header"

function Settings() {
    const cancelConfirmButtonStyles = {
        minWidth: '30%',
        cursor: 'not-allowed',
    }
    return (
        <>
            <Header title="Help" onBack={true} />

            {/* Open Help in Browser */}
            <div style={{
                marginTop: '32px',
                color: 'var(--color-text)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    fontSize: '48px',
                }}>
                    <Command size={48} />
                    &nbsp;<span>Help</span>
                </div>
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
                    <Button label="Cancel" variant='outline' style={cancelConfirmButtonStyles} />
                    <Button label="Confirm" style={cancelConfirmButtonStyles} />
                </div>
            </div>
        </>
    )
}

export default Settings
