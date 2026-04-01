import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Same id as `.env.example` — use header `X-User-Id` or set `DEFAULT_USER_ID`. */
const DEMO_USER_ID = 'a0000001-0001-4001-8001-000000000001'

// ── Task shape reference ────────────────────────────────────────────────────
//
//  name           String            display name
//  priority       'low'|'med'|'high'
//  effort         1–5               rough size estimate
//  status         'todo'|'in-progress'|'completed'
//  notes          String            visible to AI unless privateNotes: true
//  privateNotes   Boolean           if true, AI cannot read notes
//  due            'YYYY-MM-DD'|null
//  time           'HH:MM'|null
//  location       { type, label }|null   type: 'fixed'|'place'|'flexible'|'outdoor'
//  repeat         { frequency, days? }|null
//  useTimer       Boolean           whether the timer UI is shown on the task page
//  useAI          Boolean           whether AI breakdown is enabled for this task
//  timeLogged     Int               cumulative seconds logged via timer
//  aiInstructions String            extra context fed to AI when useAI is true
//  totalTimeEst   Int|null          AI-estimated total seconds (sum of subtask estimates)
//  subtasks       { label, done, ai, estSubtaskTime }[]
//                   estSubtaskTime: Int|null  minutes

/** Returns a YYYY-MM-DD string for today + n days (use negative n for past). */
function daysFromToday(n) {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}

// ── XP thresholds ───────────────────────────────────────────────────────────
// Level 1:   0 XP   Level 2: 100 XP   Level 3: 250 XP
// Level 4: 500 XP   Level 5: 850 XP
// Target: 375 XP = comfortable mid-level 3 (~50% progress)

// ── Completed tasks (spread over past 12 days) ──────────────────────────────
// ── Active / in-progress tasks ──────────────────────────────────────────────

const SEED_TASKS = [

    // ── COMPLETED ────────────────────────────────────────────────────────────

    {
        name:           'Do Laundry',
        priority:       'low',
        effort:         1,
        status:         'completed',
        notes:          'Bedding and clothes.',
        privateNotes:   false,
        due:            daysFromToday(-11),
        time:           null,
        location:       null,
        repeat:         { frequency: 'weekly', days: ['Sunday'] },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks:       [],
    },
    {
        name:           'Reply to Professor About Extension',
        priority:       'high',
        effort:         1,
        status:         'completed',
        notes:          'Email Prof. Chen about the CMPT363 assignment deadline.',
        privateNotes:   false,
        due:            daysFromToday(-10),
        time:           null,
        location:       null,
        repeat:         null,
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Draft the email',  done: true, ai: false, estSubtaskTime: null },
            { label: 'Proofread + send', done: true, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'CMPT363 Assignment 1',
        priority:       'high',
        effort:         3,
        status:         'completed',
        notes:          'Heuristic evaluation of the SFU library website.',
        privateNotes:   false,
        due:            daysFromToday(-8),
        time:           null,
        location:       { type: 'fixed', label: 'Library' },
        repeat:         null,
        useTimer:       true,
        useAI:          true,
        timeLogged:     7200,           // 2 hours logged
        aiInstructions: 'Focus on Nielsen heuristics framework.',
        totalTimeEst:   7200,
        subtasks: [
            { label: 'Choose evaluation target',              done: true, ai: true,  estSubtaskTime: 10 },
            { label: 'Conduct heuristic walkthrough',         done: true, ai: true,  estSubtaskTime: 45 },
            { label: 'Document violations with screenshots',  done: true, ai: false, estSubtaskTime: 30 },
            { label: 'Write up findings',                     done: true, ai: true,  estSubtaskTime: 60 },
            { label: 'Submit on CourSys',                     done: true, ai: false, estSubtaskTime: 5  },
        ],
    },
    {
        name:           'Weekly Grocery Run',
        priority:       'med',
        effort:         1,
        status:         'completed',
        notes:          'Picked up basics for the week.',
        privateNotes:   false,
        due:            daysFromToday(-7),
        time:           null,
        location:       { type: 'place', label: 'Superstore' },
        repeat:         { frequency: 'weekly', days: ['Tuesday'] },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Check pantry',        done: true, ai: false, estSubtaskTime: null },
            { label: 'Write shopping list', done: true, ai: false, estSubtaskTime: null },
            { label: 'Buy groceries',       done: true, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Clean Room',
        priority:       'low',
        effort:         2,
        status:         'completed',
        notes:          '',
        privateNotes:   false,
        due:            daysFromToday(-6),
        time:           null,
        location:       null,
        repeat:         null,
        useTimer:       true,
        useAI:          false,
        timeLogged:     2400,           // 40 min logged
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks:       [],
    },
    {
        name:           'Submit CMPT276 Lab Report',
        priority:       'high',
        effort:         2,
        status:         'completed',
        notes:          'Lab 4 — testing and debugging.',
        privateNotes:   false,
        due:            daysFromToday(-4),
        time:           null,
        location:       null,
        repeat:         null,
        useTimer:       true,
        useAI:          false,
        timeLogged:     5400,           // 1.5 hours logged
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Finish test cases',  done: true, ai: false, estSubtaskTime: null },
            { label: 'Write lab writeup',  done: true, ai: false, estSubtaskTime: null },
            { label: 'Submit on CourSys',  done: true, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Pay Phone Bill',
        priority:       'med',
        effort:         1,
        status:         'completed',
        notes:          '',
        privateNotes:   false,
        due:            daysFromToday(-2),
        time:           null,
        location:       null,
        repeat:         { frequency: 'monthly' },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks:       [],
    },
    {
        name:           'Plan Weekend Trip',
        priority:       'low',
        effort:         2,
        status:         'completed',
        notes:          'Day trip to Whistler with roommates.',
        privateNotes:   false,
        due:            daysFromToday(-1),
        time:           null,
        location:       null,
        repeat:         null,
        useTimer:       false,
        useAI:          true,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Check trail conditions',  done: true, ai: true,  estSubtaskTime: 5  },
            { label: 'Book accommodation',      done: true, ai: true,  estSubtaskTime: 15 },
            { label: 'Coordinate transport',    done: true, ai: false, estSubtaskTime: 10 },
            { label: 'Pack essentials',         done: true, ai: false, estSubtaskTime: 20 },
        ],
    },

    // ── IN-PROGRESS ──────────────────────────────────────────────────────────

    {
        name:           'Study for CMPT363 Midterm',
        priority:       'high',
        effort:         4,
        status:         'in-progress',
        notes:          'Cover all lecture slides from weeks 1-6. Focus on heuristic evaluation and user research methods.',
        privateNotes:   false,
        due:            daysFromToday(3),
        time:           null,
        location:       { type: 'fixed', label: 'Library' },
        repeat:         null,
        useTimer:       true,
        useAI:          true,
        timeLogged:     5400,           // 1.5 hours already logged
        aiInstructions: 'Prioritize evaluation methods and user research frameworks.',
        totalTimeEst:   10800,
        subtasks: [
            { label: 'Review week 1-3 slides',      done: true,  ai: true,  estSubtaskTime: 45 },
            { label: 'Review week 4-6 slides',      done: false, ai: true,  estSubtaskTime: 45 },
            { label: 'Complete practice questions', done: false, ai: false, estSubtaskTime: 60 },
            { label: 'Make summary sheet',          done: false, ai: false, estSubtaskTime: 30 },
        ],
    },
    {
        name:           'Write CMPT376W Essay',
        priority:       'high',
        effort:         4,
        status:         'in-progress',
        notes:          '1200 word essay on Vibe Coding definition. Needs IEEE citations.',
        privateNotes:   false,
        due:            daysFromToday(6),
        time:           null,
        location:       { type: 'flexible', label: 'Anywhere' },
        repeat:         null,
        useTimer:       true,
        useAI:          true,
        timeLogged:     2700,           // 45 min logged
        aiInstructions: 'Use IEEE citation format. Focus on the academic definition angle.',
        totalTimeEst:   14400,
        subtasks: [
            { label: 'Research topic',          done: true,  ai: true,  estSubtaskTime: 45 },
            { label: 'Write outline',           done: true,  ai: true,  estSubtaskTime: 30 },
            { label: 'Draft introduction',      done: false, ai: false, estSubtaskTime: 30 },
            { label: 'Write body paragraphs',   done: false, ai: false, estSubtaskTime: 90 },
            { label: 'Add IEEE citations',      done: false, ai: false, estSubtaskTime: 30 },
            { label: 'Proofread and submit',    done: false, ai: false, estSubtaskTime: 15 },
        ],
    },

    // ── TODO ─────────────────────────────────────────────────────────────────

    {
        name:           'Grocery Shopping',
        priority:       'med',
        effort:         1,
        status:         'todo',
        notes:          'Weekly grocery run. Check the fridge before leaving.',
        privateNotes:   false,
        due:            daysFromToday(0),
        time:           null,
        location:       { type: 'place', label: 'Superstore' },
        repeat:         { frequency: 'weekly', days: ['Tuesday'] },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Check pantry inventory', done: false, ai: false, estSubtaskTime: null },
            { label: 'Write shopping list',    done: false, ai: false, estSubtaskTime: null },
            { label: 'Buy groceries',          done: false, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Pick Up Birthday Present',
        priority:       'high',
        effort:         1,
        status:         'todo',
        notes:          "Pick up Mia's birthday gift from the mall. It's already paid for, just needs collection.",
        privateNotes:   false,
        due:            daysFromToday(2),
        time:           '15:30',
        location:       { type: 'place', label: 'Metropolis at Metrotown' },
        repeat:         null,
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Confirm store has order ready', done: false, ai: false, estSubtaskTime: null },
            { label: 'Pick up gift',                  done: false, ai: false, estSubtaskTime: null },
            { label: 'Wrap gift',                     done: false, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Make Doctor Appointment',
        priority:       'med',
        effort:         1,
        status:         'todo',
        notes:          'Book annual checkup. Call before 4pm on weekdays.',
        privateNotes:   false,
        due:            daysFromToday(4),
        time:           '14:00',
        location:       { type: 'place', label: 'Medical Clinic' },
        repeat:         { frequency: 'yearly' },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Find clinic phone number', done: false, ai: false, estSubtaskTime: null },
            { label: 'Call and book',            done: false, ai: false, estSubtaskTime: null },
            { label: 'Add to calendar',          done: false, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Pick Up Textbooks',
        priority:       'low',
        effort:         1,
        status:         'todo',
        notes:          'Pick up reserved textbooks from the SFU bookstore before they release the hold.',
        privateNotes:   false,
        due:            daysFromToday(1),
        time:           '11:00',
        location:       { type: 'place', label: 'SFU Bookstore' },
        repeat:         null,
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks:       [],
    },
    {
        name:           'Morning Run',
        priority:       'low',
        effort:         3,
        status:         'todo',
        notes:          '5km loop around the park. Track with Strava.',
        privateNotes:   false,
        due:            daysFromToday(0),
        time:           '07:00',
        location:       { type: 'outdoor', label: 'Tynehead Park' },
        repeat:         { frequency: 'custom', days: ['Monday', 'Wednesday', 'Friday'] },
        useTimer:       true,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   1800,
        subtasks:       [],
    },
    {
        name:           'Team Project Check-in',
        priority:       'med',
        effort:         1,
        status:         'todo',
        notes:          'Weekly sync with group for CMPT372 project. Discuss sprint progress and blockers.',
        privateNotes:   false,
        due:            daysFromToday(5),
        time:           '13:00',
        location:       { type: 'fixed', label: 'SFU AQ 3149' },
        repeat:         { frequency: 'weekly', days: ['Thursday'] },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Prepare progress update', done: false, ai: false, estSubtaskTime: null },
            { label: "Review others' PRs",      done: false, ai: false, estSubtaskTime: null },
        ],
    },
    {
        // privateNotes: true — AI will not receive the notes field for this task
        name:           'Therapy Session Prep',
        priority:       'med',
        effort:         2,
        status:         'todo',
        notes:          'Write down what I want to talk about this week. Feeling anxious about deadlines.',
        privateNotes:   true,
        due:            daysFromToday(7),
        time:           '10:00',
        location:       { type: 'fixed', label: 'Counselling Services' },
        repeat:         { frequency: 'weekly', days: ['Friday'] },
        useTimer:       false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Journal for 10 minutes',    done: false, ai: false, estSubtaskTime: 10 },
            { label: 'Write 3 topics to discuss', done: false, ai: false, estSubtaskTime: 5  },
        ],
    },
]

// ── XP log (oldest → newest, 20 entries) ────────────────────────────────────
// Robo total XP will be set to 375 (mid level 3).
// The log shows the last ~9 days of activity; earlier history is implied.

const XP_LOG = [
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-8) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-8) },
    { reason: 'Mood check-in',      amount: 5,  date: daysFromToday(-8) },
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-7) },
    { reason: 'Early finish bonus', amount: 10, date: daysFromToday(-7) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-7) },
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-6) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-6) },
    { reason: 'Mood check-in',      amount: 5,  date: daysFromToday(-5) },
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-4) },
    { reason: 'Early finish bonus', amount: 10, date: daysFromToday(-4) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-4) },
    { reason: 'Mood check-in',      amount: 5,  date: daysFromToday(-3) },
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-2) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-2) },
    { reason: 'Mood check-in',      amount: 5,  date: daysFromToday(-2) },
    { reason: 'Task completed',     amount: 15, date: daysFromToday(-1) },
    { reason: 'Early finish bonus', amount: 10, date: daysFromToday(-1) },
    { reason: 'Daily streak',       amount: 15, date: daysFromToday(-1) },
    { reason: 'Mood check-in',      amount: 5,  date: daysFromToday(0)  },
]

async function main() {
    await prisma.user.deleteMany()

    const user = await prisma.user.create({
        data: {
            id:    DEMO_USER_ID,
            email: 'demo@local.test',
            roboState: {
                create: {
                    xp:               375,   // mid level 3 (level 3: 250–499 XP)
                    streak:           5,
                    lastActivityDate: daysFromToday(-1),  // last task completed yesterday
                    mood:             1,     // 'Good'
                    moodDate:         daysFromToday(0),
                },
            },
            notifications: {
                create: [
                    {
                        title: '🔥 5-Day Streak!',
                        body:  "You've been on a roll — 5 days in a row. Keep it going!",
                        read:  true,
                    },
                    {
                        title: 'CMPT363 Midterm coming up',
                        body:  'Your midterm is in 3 days. Time to hit the books!',
                        read:  true,
                    },
                    {
                        title: 'Task completed 🎉',
                        body:  '"Plan Weekend Trip" marked complete. +25 XP earned.',
                        read:  false,
                    },
                ],
            },
            tasks: {
                create: SEED_TASKS.map(t => ({
                    name:           t.name,
                    due:            t.due,
                    time:           t.time,
                    priority:       t.priority,
                    effort:         t.effort,
                    status:         t.status,
                    notes:          t.notes,
                    privateNotes:   t.privateNotes,
                    useTimer:       t.useTimer,
                    useAI:          t.useAI,
                    timeLogged:     t.timeLogged,
                    aiInstructions: t.aiInstructions,
                    totalTimeEst:   t.totalTimeEst ?? undefined,
                    location:       t.location ?? undefined,
                    repeat:         t.repeat ?? undefined,
                    subtasks: {
                        create: t.subtasks.map((s, i) => ({
                            label:          s.label,
                            done:           s.done,
                            ai:             s.ai ?? false,
                            estSubtaskTime: s.estSubtaskTime ?? undefined,
                            sortOrder:      i,
                        })),
                    },
                })),
            },
        },
    })

    // Insert XP log oldest-first so createdAt order matches chronology
    for (const entry of XP_LOG) {
        await prisma.xpLogEntry.create({
            data: {
                userId: user.id,
                reason: entry.reason,
                amount: entry.amount,
                date:   entry.date,
            },
        })
    }

    console.log('Seeded demo user:', DEMO_USER_ID)
    console.log(`  Tasks:     ${SEED_TASKS.length} (${SEED_TASKS.filter(t => t.status === 'completed').length} completed, ${SEED_TASKS.filter(t => t.status === 'in-progress').length} in-progress, ${SEED_TASKS.filter(t => t.status === 'todo').length} todo)`)
    console.log(`  Robo:      Level 3 | 375 XP | 5-day streak`)
    console.log(`  XP log:    ${XP_LOG.length} entries`)
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })
