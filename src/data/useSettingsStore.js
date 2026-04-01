// useSettingsStore
// Global, persistent settings store.
//
// Usage:
//   // Update a setting
//   const { setEnergyLevelCheckInPrompt } = useSettingsStore()
//   setEnergyLevelCheckInPrompt(false)
//
//   // Read a setting
//   const energyLevelCheckInPrompt = useSettingsStore(s => s.energyLevelCheckInPrompt)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import DebugPanel from '../components/DebugPanel'

const useSettingsStore = create(
    persist(
        (set, get) => {
            function assertType(value, typename) {
                if ((typeof value) !== typename) {
                    throw new Error(`Invalid setting value: expected ${typename}, got ${value}`)
                }
            }

            function assertEnum(value, options) {
                if (!options.includes(value)) {
                    throw new Error(`Invalid setting value: expected one of ${options.toString()}, got ${value}`)
                }
            }

            function update(values) {
                set({
                    ...get,
                    ...values,
                })
            }

            return {
                enableEnergyLevelCheckIn: true,
                setEnableEnergyLevelCheckIn(value) {
                    assertType(value, 'boolean')
                    update({
                        enableEnergyLevelCheckIn: value,
                    })
                },

                enableLocationBasedTasks: false,
                setEnableLocationBasedTasks(value) {
                    assertType(value, 'boolean')
                    update({
                        enableLocationBasedTasks: value,
                    })
                },

                enablePushNotifications: false,
                setEnablePushNotifications(value) {
                    assertType(value, 'boolean')
                    update({
                        enablePushNotifications: value,
                    })
                },

                enableDueSoonReminders: false,
                setEnableDueSoonReminders(value) {
                    assertType(value, 'boolean')
                    update({
                        enableDueSoonReminders: value,
                    })
                },

                enableDailyReminders: false,
                setEnableDailyReminders(value) {
                    assertType(value, 'boolean')
                    update({
                        enableDailyReminders: value,
                    })
                },
                
                notificationFrequency: "high-priority",
                setNotificationFrequency(value) {
                    assertEnum(value, ['everything', 'high-priority'])
                    update({
                        notificationFrequency: value,
                    })
                },

                userName: "User",
                setUserName(value) {
                    assertType(value, 'string')
                    update({
                        userName: value,
                    })
                },
                aiAssistantName: "",
                setAiAssistantName(value) {
                    assertType(value, 'string')
                    update({
                        aiAssistantName: value,
                    })
                },
                
                aiInvolvementLevel: "suggestive",
                setAiInvolvementLevel(value) {
                    assertEnum(value, ['off', 'suggestive', 'collaborative'])
                    update({
                        aiInvolvementLevel: value,
                    })
                },
                
                aiBehaviour: "mentee",
                setAiBehaviour(value) {
                    assertEnum(value, ['mentee', 'mentor'])
                    update({
                        aiBehaviour: value,
                    })
                },
                 }
        }
    )
)

export default useSettingsStore
