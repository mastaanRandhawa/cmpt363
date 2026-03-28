import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/** Same id as `.env.example` — use header `X-User-Id` or set `DEFAULT_USER_ID`. */
const DEMO_USER_ID = 'a0000001-0001-4001-8001-000000000001'

const SEED_TASKS = [
    {
        name:        'Study for CMPT363 Midterm',
        priority:    'high',
        effort:      4,
        status:      'in-progress',
        description: 'Cover all lecture slides from weeks 1-6. Focus on heuristic evaluation and user research methods.',
        due:         '2026-03-24',
        time:        null,
        location:    { type: 'fixed', label: 'Library' },
        repeat:      null,
        subtasks:    [
            { label: 'Review week 1-3 slides', done: true, ai: true },
            { label: 'Review week 4-6 slides', done: false, ai: true },
            { label: 'Complete practice questions', done: false, ai: false },
            { label: 'Make summary sheet', done: false, ai: false },
        ],
    },
    {
        name:        'Grocery Shopping',
        priority:    'med',
        effort:      1,
        status:      'todo',
        description: 'Weekly grocery run. Check the fridge before leaving.',
        due:         '2026-03-22',
        time:        null,
        location:    { type: 'place', label: 'Superstore' },
        repeat:      { frequency: 'weekly', days: ['Tuesday'] },
        subtasks:    [
            { label: 'Check pantry inventory', done: true, ai: false },
            { label: 'Write shopping list', done: true, ai: false },
            { label: 'Buy groceries', done: false, ai: false },
        ],
    },
    {
        name:        'Write CMPT376W Essay',
        priority:    'high',
        effort:      4,
        status:      'todo',
        description: '1200 word essay on Vibe Coding definition. Needs IEEE citations.',
        due:         '2026-03-27',
        time:        null,
        location:    { type: 'flexible', label: 'Anywhere' },
        repeat:      null,
        subtasks:    [
            { label: 'Research topic', done: false, ai: true },
            { label: 'Write outline', done: false, ai: true },
            { label: 'Draft introduction', done: false, ai: false },
            { label: 'Write body paragraphs', done: false, ai: false },
            { label: 'Add IEEE citations', done: false, ai: false },
            { label: 'Proofread and submit', done: false, ai: false },
        ],
    },
    {
        name:        'Make Doctor Appointment',
        priority:    'med',
        effort:      1,
        status:      'todo',
        description: 'Book annual checkup. Call before 4pm on weekdays.',
        due:         '2026-03-25',
        time:        '14:00',
        location:    { type: 'place', label: 'Medical Clinic' },
        repeat:      { frequency: 'yearly', label: 'Annual Checkup' },
        subtasks:    [
            { label: 'Find clinic phone number', done: false, ai: false },
            { label: 'Call and book', done: false, ai: false },
            { label: 'Add to calendar', done: false, ai: false },
        ],
    },
    {
        name:        'Pick Up Textbooks',
        priority:    'low',
        effort:      1,
        status:      'todo',
        description: 'Pick up reserved textbooks from the SFU bookstore before they release the hold.',
        due:         '2026-03-23',
        time:        '11:00',
        location:    { type: 'place', label: 'SFU Bookstore' },
        repeat:      null,
        subtasks:    [],
    },
    {
        name:        'Pick Up Birthday Present',
        priority:    'high',
        effort:      1,
        status:      'todo',
        description: "Pick up Mia's birthday gift from the mall. It's already paid for, just needs collection.",
        due:         '2026-03-23',
        time:        '15:30',
        location:    { type: 'place', label: 'Metropolis at Metrotown' },
        repeat:      null,
        subtasks:    [
            { label: 'Confirm store has order ready', done: false, ai: false },
            { label: 'Pick up gift', done: false, ai: false },
            { label: 'Wrap gift', done: false, ai: false },
        ],
    },
    {
        name:        'Morning Run',
        priority:    'low',
        effort:      3,
        status:      'todo',
        description: '5km loop around the park. Track with Strava.',
        due:         '2026-03-22',
        time:        '07:00',
        location:    { type: 'outdoor', label: 'Tynehead Park' },
        repeat:      { frequency: 'custom', days: ['Monday', 'Wednesday', 'Friday'] },
        subtasks:    [],
    },
    {
        name:        'Team Project Check-in',
        priority:    'med',
        effort:      1,
        status:      'todo',
        description: 'Weekly sync with group for CMPT372 project. Discuss sprint progress and blockers.',
        due:         '2026-03-26',
        time:        '13:00',
        location:    { type: 'fixed', label: 'SFU AQ 3149' },
        repeat:      { frequency: 'weekly', days: ['Thursday'] },
        subtasks:    [
            { label: 'Prepare progress update', done: false, ai: false },
            { label: "Review others' PRs", done: false, ai: false },
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
                    name:        t.name,
                    due:         t.due,
                    time:        t.time,
                    priority:    t.priority,
                    effort:      t.effort,
                    description: t.description,
                    status:      t.status,
                    location:    t.location ?? undefined,
                    repeat:      t.repeat ?? undefined,
                    subtasks: {
                        create: t.subtasks.map((s, i) => ({
                            label:     s.label,
                            done:      s.done,
                            ai:        s.ai ?? false,
                            sortOrder: i,
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
