const LEVEL_XP = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4200]

export function xpForLevel(level) {
    return LEVEL_XP[Math.min(level - 1, LEVEL_XP.length - 1)]
}

export function xpForNextLevel(level) {
    if (level >= LEVEL_XP.length) return null
    return LEVEL_XP[level]
}

export function levelFromXp(xp) {
    let level = 1
    for (let i = 1; i < LEVEL_XP.length; i++) {
        if (xp >= LEVEL_XP[i]) level = i + 1
        else break
    }
    return level
}

export function xpProgressInLevel(xp) {
    const level    = levelFromXp(xp)
    const levelMin = xpForLevel(level)
    const levelMax = xpForNextLevel(level)
    if (levelMax === null) return { current: xp - levelMin, max: xp - levelMin, percent: 100 }
    return {
        current: xp - levelMin,
        max:     levelMax - levelMin,
        percent: Math.round(((xp - levelMin) / (levelMax - levelMin)) * 100),
    }
}

export function todayStr() {
    return new Date().toISOString().slice(0, 10)
}

export function daysBetween(a, b) {
    if (!a || !b) return Infinity
    return Math.round((new Date(b) - new Date(a)) / 86400000)
}

const XP_LOG_CAP = 20

/** @param {import('@prisma/client').PrismaClient} prisma */
export async function appendXpLog(prisma, userId, entries) {
    for (const e of [...entries].reverse()) {
        await prisma.xpLogEntry.create({
            data: { userId, reason: e.reason, amount: e.amount, date: e.date },
        })
    }
    const overflow = await prisma.xpLogEntry.findMany({
        where:      { userId },
        orderBy:    { createdAt: 'desc' },
        skip:       XP_LOG_CAP,
        select:     { id: true },
    })
    if (overflow.length) {
        await prisma.xpLogEntry.deleteMany({
            where: { id: { in: overflow.map(x => x.id) } },
        })
    }
}

/** @returns {{ events: { reason: string, amount: number, date: string }[], xpGained: number, streak: number, lastActivityDate: string }} */
export function computeTaskComplete(prev, task) {
    const today  = todayStr()
    const events = []
    let xpGained = 0

    events.push({ reason: 'Task completed', amount: 15, date: today })
    xpGained += 15

    if (task?.due) {
        const due = task.due
        if (due >= today) {
            events.push({ reason: 'Early finish bonus', amount: 10, date: today })
            xpGained += 10
        }
    }

    const last = prev.lastActivityDate
    const diff = daysBetween(last, today)
    let streak = prev.streak

    if (diff === 0) {
        // same day
    } else if (diff === 1) {
        streak += 1
        events.push({ reason: 'Daily streak', amount: 15, date: today })
        xpGained += 15
    } else {
        streak = 1
    }

    return {
        events,
        xpGained,
        streak,
        lastActivityDate: today,
    }
}
