import { Router } from 'express'
import {
    todayStr,
    daysBetween,
    levelFromXp,
    xpProgressInLevel,
    appendXpLog,
    computeTaskComplete,
} from '../lib/robo.js'

/** @param {import('@prisma/client').PrismaClient} prisma */
export function createRoboRouter(prisma) {
    const r = Router()

    async function getOrCreateState(userId) {
        let state = await prisma.roboState.findUnique({ where: { userId } })
        if (!state) {
            state = await prisma.roboState.create({
                data: { userId },
            })
        }
        return state
    }

    async function xpLogResponse(userId) {
        const entries = await prisma.xpLogEntry.findMany({
            where:   { userId },
            orderBy: { createdAt: 'desc' },
            take:    20,
        })
        return entries.map(e => ({
            id:     e.id,
            reason: e.reason,
            amount: e.amount,
            date:   e.date,
        }))
    }

    async function fullPayload(userId) {
        const state = await getOrCreateState(userId)
        const xpLog = await xpLogResponse(userId)
        const xp    = state.xp
        return {
            xp,
            streak:           state.streak,
            lastActivityDate: state.lastActivityDate,
            mood:             state.mood,
            moodDate:         state.moodDate,
            xpLog,
            level:            levelFromXp(xp),
            progress:         xpProgressInLevel(xp),
        }
    }

    r.get('/', async (req, res, next) => {
        try {
            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    r.post('/xp', async (req, res, next) => {
        try {
            const { amount, reason } = req.body
            if (amount == null || !reason) {
                return res.status(400).json({ error: 'amount and reason required' })
            }

            const state = await getOrCreateState(req.userId)
            const today = todayStr()
            const newXp = state.xp + Number(amount)

            await prisma.roboState.update({
                where: { userId: req.userId },
                data:  { xp: newXp },
            })

            await appendXpLog(prisma, req.userId, [{
                reason,
                amount: Number(amount),
                date:   today,
            }])

            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    r.post('/mood', async (req, res, next) => {
        try {
            const { index } = req.body
            if (index == null || typeof index !== 'number') {
                return res.status(400).json({ error: 'index (number) required' })
            }

            const state = await getOrCreateState(req.userId)
            const today = todayStr()
            const firstToday = state.moodDate !== today

            let xp = state.xp
            if (firstToday) {
                xp += 5
                await appendXpLog(prisma, req.userId, [{
                    reason: 'Mood check-in',
                    amount: 5,
                    date:   today,
                }])
            }

            await prisma.roboState.update({
                where: { userId: req.userId },
                data:  {
                    mood:     index,
                    moodDate: today,
                    xp,
                },
            })

            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    r.post('/complete-task', async (req, res, next) => {
        try {
            const { task } = req.body
            const state = await getOrCreateState(req.userId)
            const { events, xpGained, streak, lastActivityDate } = computeTaskComplete(state, task)

            await prisma.roboState.update({
                where: { userId: req.userId },
                data:  {
                    xp:               state.xp + xpGained,
                    streak,
                    lastActivityDate,
                },
            })

            await appendXpLog(prisma, req.userId, events)

            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    r.post('/check-streak', async (req, res, next) => {
        try {
            const state = await getOrCreateState(req.userId)
            const today = todayStr()
            if (!state.lastActivityDate) {
                return res.json(await fullPayload(req.userId))
            }
            const diff = daysBetween(state.lastActivityDate, today)
            if (diff > 1) {
                await prisma.roboState.update({
                    where: { userId: req.userId },
                    data:  { streak: 0 },
                })
            }
            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    r.post('/reset', async (req, res, next) => {
        try {
            await getOrCreateState(req.userId)
            await prisma.xpLogEntry.deleteMany({ where: { userId: req.userId } })
            await prisma.roboState.update({
                where: { userId: req.userId },
                data:  {
                    xp: 0, streak: 0, lastActivityDate: null,
                    mood: null, moodDate: null,
                },
            })
            res.json(await fullPayload(req.userId))
        } catch (e) { next(e) }
    })

    return r
}
