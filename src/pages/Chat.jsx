import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Command } from 'lucide-react'
import Header from '../components/Header'
import useTaskStore from '../data/useTaskStore'
import useRoboStore from '../data/useRoboStore'

// ─── System prompt ────────────────────────────────────────────────────────────
// TODO: wire to real API — pass buildSystemPrompt(tasks, roboName) as the system
//       message, then append the conversation history as user/assistant turns.
//       e.g. OpenAI: { role: 'system', content: buildSystemPrompt(...) }
export function buildSystemPrompt(tasks, roboName = 'Robo') {
    const activeTasks = tasks.filter(t => !t._softDeleted && t.status !== 'completed')

    const taskBlock = activeTasks.length > 0
        ? activeTasks.map((t, i) =>
            `${i + 1}. "${t.name}"${t.due ? ` (due ${t.due})` : ''}${t.priority ? ` [${t.priority} priority]` : ''}`
        ).join('\n')
        : 'No active tasks.'

    return `You are ${roboName}, a witty and encouraging AI task companion inside FocusFlow — a personal productivity app.

YOUR ROLE:
Help the user manage and accomplish their active tasks. You have access to their current task list below.

CORE RULES:
1. Only help with topics that relate to the user's current tasks.
2. If the message has no reasonable connection to any task, redirect them back to their list with personality — never bluntly or rudely.
3. Keep replies concise and friendly. You are a companion, not an encyclopedia.
4. Reference the user's actual task names when possible to feel personal.

TASK RELEVANCE CHECK:
Before responding, ask yourself: "Does this question connect to any task the user currently has?"
- Direct match: question is literally about a task (e.g., they have "Bake a cake" → ask about cake recipes) → help fully
- Indirect match: question supports completing a task (e.g., they have "Write essay" → ask about thesis structure) → help
- No connection: question has nothing to do with any task → redirect with wit

REDIRECT TONE:
Be warm and funny, never dismissive. Reference their actual tasks so the redirect feels personal, not robotic.
Good example: "Cookies sound delicious, but I'm only equipped to handle what's on your plate — and right now that's 'Clean the house'. Want a hand with that instead?"
Bad example: "Sorry, I can only discuss your tasks."

PERSONALITY:
- Upbeat and encouraging
- Witty but not exhausting
- Direct and clear
- Casual language — contractions, light humour
- Occasionally uses productivity metaphors (mission, quest, unlocking, etc.)

CURRENT ACTIVE TASKS:
${taskBlock}`
}

// ─── Fake AI (replace with real API call) ────────────────────────────────────
// Returns a promise so the real API swap is a single-line change.
function fakeAIResponse(userMessage, tasks, roboName) {
    const lower   = userMessage.toLowerCase()
    const active  = tasks.filter(t => !t._softDeleted && t.status !== 'completed')

    if (active.length === 0) {
        return Promise.resolve(
            "You don't have any active tasks right now! Head over to your task list and add something — I'll be ready to help the moment you do. 🚀"
        )
    }

    // Simple relevance check: look for meaningful word overlap between message and task names
    const isRelated = active.some(task => {
        const words = task.name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        return words.some(word => lower.includes(word)) || lower.includes(task.name.toLowerCase())
    })

    if (isRelated) {
        const match = active.find(task => {
            const words = task.name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
            return words.some(word => lower.includes(word)) || lower.includes(task.name.toLowerCase())
        })
        return Promise.resolve(
            `That sounds related to "${match.name}" — nice! (Simulated response: once wired to a real API, ${roboName} will give you specific, helpful advice here based on your question and task context.)`
        )
    }

    // Not related — redirect with personality
    const names = active.slice(0, 2).map(t => `"${t.name}"`)
    const nameStr = names.length === 1 ? names[0] : `${names[0]} or ${names[1]}`
    const redirects = [
        `That's a fun question, but it's outside my mission parameters! I'm locked in on your tasks right now — specifically ${nameStr}. Want help tackling any of those?`,
        `I wish I could help with everything, but my programming keeps me focused on your task list! Right now that means ${nameStr}. Shall we dig in?`,
        `Interesting territory — but I'm strictly task mode over here! Let's keep the momentum going on ${nameStr} instead. What do you need?`,
        `That's above my pay grade (task-wise, anyway). I'm best used on ${nameStr} — point me at one and watch me go. 🤖`,
    ]
    return Promise.resolve(redirects[Math.floor(Math.random() * redirects.length)])
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

// ─── Component ───────────────────────────────────────────────────────────────
function Chat() {
    const navigate   = useNavigate()
    const allTasks   = useTaskStore(s => s.tasks)
    const tasks      = useMemo(() => allTasks.filter(t => !t._softDeleted), [allTasks])
    const roboName   = useRoboStore(s => s.roboName) || 'Robo'

    const [messages, setMessages] = useState(() => [{
        id:        'welcome',
        role:      'assistant',
        text:      `Hey there! I'm ${roboName} — your task companion. Ask me anything about your current tasks and I'll do my best to help. 🤖`,
        timestamp: new Date(),
    }])
    const [input,   setInput]   = useState('')
    const [loading, setLoading] = useState(false)

    const bottomRef    = useRef(null)
    const inputRef     = useRef(null)
    const containerRef = useRef(null)

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    async function sendMessage() {
        const text = input.trim()
        if (!text || loading) return

        const userMsg = { id: `u-${Date.now()}`, role: 'user', text, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        // Simulate network delay (remove when wiring real API)
        await new Promise(r => setTimeout(r, 900 + Math.random() * 600))

        const reply = await fakeAIResponse(text, tasks, roboName)
        setMessages(prev => [...prev, {
            id:        `a-${Date.now()}`,
            role:      'assistant',
            text:      reply,
            timestamp: new Date(),
        }])
        setLoading(false)
        inputRef.current?.focus()
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div style={{
            color: 'var(--color-text)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
        }}>
            <Header
                subtitle="YOUR COMPANION"
                title={roboName}
                onBack={() => navigate('/robo')}
            />

            {/* ── message list ──────────────────────────────────────────── */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} roboName={roboName} />
                ))}

                {/* typing indicator */}
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <RoboAvatar />
                        <div style={{
                            background: 'var(--color-surface)',
                            borderRadius: '18px 18px 18px 4px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <Dot delay="0s"   />
                            <Dot delay="0.2s" />
                            <Dot delay="0.4s" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* ── input bar ─────────────────────────────────────────────── */}
            <div style={{
                padding: '10px 12px 24px',
                borderTop: '1px solid var(--color-surface-alt)',
                background: 'var(--color-bg)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end',
            }}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${roboName} about your tasks...`}
                    rows={1}
                    style={{
                        flex: 1,
                        background: 'var(--color-surface)',
                        border: '1.5px solid var(--color-surface-alt)',
                        borderRadius: '20px',
                        padding: '10px 14px',
                        color: 'var(--color-text)',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                        lineHeight: '1.4',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        fontFamily: 'inherit',
                        scrollbarWidth: 'none',
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: input.trim() && !loading
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-alt)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: input.trim() && !loading ? 'pointer' : 'default',
                        flexShrink: 0,
                        transition: 'background 0.15s',
                    }}
                >
                    <Send
                        size={16}
                        color={input.trim() && !loading ? 'white' : 'var(--color-text-muted)'}
                    />
                </button>
            </div>
        </div>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function RoboAvatar() {
    return (
        <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #7C6FCD 0%, #5B4FAA 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Command size={13} color="white" />
        </div>
    )
}

function MessageBubble({ msg, roboName }) {
    const isUser = msg.role === 'user'
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            gap: '3px',
            width: '100%',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                width: '100%',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}>
                {!isUser && <RoboAvatar />}
                <div style={{
                    maxWidth: 'calc(76% - 36px)',
                    background: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isUser ? 'white' : 'var(--color-text)',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                }}>
                    {msg.text}
                </div>
            </div>
            <span style={{
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                paddingLeft: isUser ? 0 : '36px',
            }}>
                {isUser ? 'You' : roboName} · {formatTime(msg.timestamp)}
            </span>
        </div>
    )
}

function Dot({ delay }) {
    return (
        <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--color-text-muted)',
            animation: 'dotBounce 1.2s infinite ease-in-out',
            animationDelay: delay,
        }} />
    )
}

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('chat-dot-style')) {
    const style = document.createElement('style')
    style.id = 'chat-dot-style'
    style.textContent = `
        @keyframes dotBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30%            { transform: translateY(-5px); opacity: 1; }
        }
    `
    document.head.appendChild(style)
}

export default Chat