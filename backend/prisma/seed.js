import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Same id as `.env.example` — use header `X-User-Id` or set `DEFAULT_USER_ID`. */
const DEMO_USER_ID = 'a0000001-0001-4001-8001-000000000001'

/** Returns a YYYY-MM-DD string for today + n days. */
function daysFromToday(n) {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}

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
//  useTimer          Boolean           whether the timer UI is shown on the task page
//  useAI          Boolean           whether AI breakdown is enabled for this task
//  timeLogged     Int               cumulative seconds logged via timer
//  aiInstructions String            extra context fed to AI when useAI is true
//  totalTimeEst   Int|null          AI-estimated total seconds (sum of subtask estimates)
//  subtasks       { label, done, ai, estSubtaskTime }[]
//                   estSubtaskTime: Int|null  seconds

const SEED_TASKS = [
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
        useTimer:          true,
        useAI:          true,
        timeLogged:     2700,           // 45 min already logged
        aiInstructions: 'Prioritize evaluation methods and user research frameworks.',
        totalTimeEst:   10800,          // 3 hours
        subtasks: [
            { label: 'Review week 1-3 slides',      done: true,  ai: true,  estSubtaskTime: 2700 },
            { label: 'Review week 4-6 slides',      done: false, ai: true,  estSubtaskTime: 2700 },
            { label: 'Complete practice questions', done: false, ai: false, estSubtaskTime: 3600 },
            { label: 'Make summary sheet',          done: false, ai: false, estSubtaskTime: 1800 },
        ],
    },
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
        useTimer:          false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Check pantry inventory', done: true,  ai: false, estSubtaskTime: null },
            { label: 'Write shopping list',    done: true,  ai: false, estSubtaskTime: null },
            { label: 'Buy groceries',          done: false, ai: false, estSubtaskTime: null },
        ],
    },
    {
        name:           'Write CMPT376W Essay',
        priority:       'high',
        effort:         4,
        status:         'todo',
        notes:          '1200 word essay on Vibe Coding definition. Needs IEEE citations.',
        privateNotes:   false,
        due:            daysFromToday(6),
        time:           null,
        location:       { type: 'flexible', label: 'Anywhere' },
        repeat:         null,
        useTimer:          true,
        useAI:          true,
        timeLogged:     0,
        aiInstructions: 'Use IEEE citation format. Focus on the academic definition angle.',
        totalTimeEst:   14400,          // 4 hours
        subtasks: [
            { label: 'Research topic',          done: false, ai: true,  estSubtaskTime: 2700 },
            { label: 'Write outline',           done: false, ai: true,  estSubtaskTime: 1800 },
            { label: 'Draft introduction',      done: false, ai: false, estSubtaskTime: 1800 },
            { label: 'Write body paragraphs',   done: false, ai: false, estSubtaskTime: 5400 },
            { label: 'Add IEEE citations',      done: false, ai: false, estSubtaskTime: 1800 },
            { label: 'Proofread and submit',    done: false, ai: false, estSubtaskTime: 900  },
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
        repeat:         { frequency: 'yearly', label: 'Annual Checkup' },
        useTimer:          false,
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
        useTimer:          false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks:       [],
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
        useTimer:          false,
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
        useTimer:          true,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   1800,           // 30 min
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
        useTimer:          false,
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
        useTimer:          false,
        useAI:          false,
        timeLogged:     0,
        aiInstructions: '',
        totalTimeEst:   null,
        subtasks: [
            { label: 'Journal for 10 minutes',    done: false, ai: false, estSubtaskTime: 600 },
            { label: 'Write 3 topics to discuss', done: false, ai: false, estSubtaskTime: 300 },
        ],
    },
]

async function main() {
    await prisma.user.deleteMany()

    await prisma.user.create({
        data: {
            id:    DEMO_USER_ID,
            email: 'demo@local.test',
            roboState: {
                create: {},
            },
            notifications: {
                create: {
                    title: 'Notification Example',
                    body:  'This is an example, yay',
                    read:  false,
                },
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
                    useTimer:          t.useTimer,
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

    console.log('Seeded demo user:', DEMO_USER_ID)
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        process.exit(1)
    })