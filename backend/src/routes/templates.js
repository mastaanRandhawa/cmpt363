import { Router } from 'express'
import { randomUUID } from 'crypto'
import {
    normaliseName,
    findSimilarTemplates,
    buildDiff,
} from '../lib/templateMatch.js'

/** @param {import('@prisma/client').PrismaClient} prisma */
export function createTemplatesRouter(prisma) {
    const r = Router()

    function format(t) {
        const out = {
            id:            t.id,
            normalizedKey: t.normalizedKey,
            taskName:      t.taskName,
            timesUsed:     t.timesUsed,
            savedAt:       t.savedAt.toISOString(),
            finalSubtasks: t.finalSubtasks,
            diff:          t.diff,
        }
        if (t.score != null) out.score = t.score
        return out
    }

    r.get('/', async (req, res, next) => {
        try {
            const rows = await prisma.taskTemplate.findMany({
                where: { userId: req.userId },
            })
            res.json(rows.map(t => format(t)))
        } catch (e) { next(e) }
    })

    r.get('/similar', async (req, res, next) => {
        try {
            const taskName = req.query.taskName
            if (!taskName || typeof taskName !== 'string') {
                return res.status(400).json({ error: 'query taskName required' })
            }

            const rows = await prisma.taskTemplate.findMany({
                where: { userId: req.userId },
            })
            const matches = findSimilarTemplates(taskName, rows)
            res.json(matches.map(format))
        } catch (e) { next(e) }
    })

    r.post('/save', async (req, res, next) => {
        try {
            const { taskName, aiSuggested, finalSubtasks } = req.body
            if (!taskName || !Array.isArray(finalSubtasks)) {
                return res.status(400).json({ error: 'taskName and finalSubtasks[] required' })
            }

            const normalisedKey = normaliseName(taskName)
            const diff          = buildDiff(
                Array.isArray(aiSuggested) ? aiSuggested : [],
                finalSubtasks
            )

            const diffPayload = {
                kept: diff.kept.map(s => ({
                    label:          s.label,
                    estSubtaskTime: s.estSubtaskTime ?? null,
                })),
                removed: diff.removed.map(s => ({ label: s.label })),
                userAdded: diff.userAdded.map(s => ({
                    label:          s.label,
                    estSubtaskTime: s.estSubtaskTime ?? null,
                })),
            }

            const finalPayload = finalSubtasks.map(sub => ({
                label:          sub.label,
                estSubtaskTime: sub.estSubtaskTime ?? null,
                fromAI:         !!sub.ai,
            }))

            const existing = await prisma.taskTemplate.findUnique({
                where: {
                    userId_normalizedKey: {
                        userId:        req.userId,
                        normalizedKey: normalisedKey,
                    },
                },
            })

            const timesUsed = (existing?.timesUsed ?? 0) + 1

            const row = await prisma.taskTemplate.upsert({
                where: {
                    userId_normalizedKey: {
                        userId:        req.userId,
                        normalizedKey: normalisedKey,
                    },
                },
                create: {
                    id:            randomUUID(),
                    userId:        req.userId,
                    normalizedKey: normalisedKey,
                    taskName,
                    timesUsed,
                    savedAt:       new Date(),
                    finalSubtasks: finalPayload,
                    diff:          diffPayload,
                },
                update: {
                    taskName,
                    timesUsed,
                    savedAt:       new Date(),
                    finalSubtasks: finalPayload,
                    diff:          diffPayload,
                },
            })

            res.json(format(row))
        } catch (e) { next(e) }
    })

    r.delete('/', async (req, res, next) => {
        try {
            await prisma.taskTemplate.deleteMany({ where: { userId: req.userId } })
            res.sendStatus(204)
        } catch (e) { next(e) }
    })

    return r
}