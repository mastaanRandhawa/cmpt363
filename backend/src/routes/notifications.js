import { Router } from 'express'
import { randomUUID } from 'crypto'

/** @param {import('@prisma/client').PrismaClient} prisma */
export function createNotificationsRouter(prisma) {
    const r = Router()

    function format(n) {
        return {
            id:        n.id,
            title:     n.title,
            body:      n.body,
            read:      n.read,
            createdAt: n.createdAt.toISOString(),
        }
    }

    r.get('/', async (req, res, next) => {
        try {
            const rows = await prisma.notification.findMany({
                where:   { userId: req.userId },
                orderBy: { createdAt: 'desc' },
            })
            res.json(rows.map(format))
        } catch (e) { next(e) }
    })

    r.post('/', async (req, res, next) => {
        try {
            const { title, body } = req.body
            if (!title || !body) return res.status(400).json({ error: 'title and body required' })

            const n = await prisma.notification.create({
                data: {
                    id:     randomUUID(),
                    userId: req.userId,
                    title,
                    body,
                    read: false,
                },
            })
            res.status(201).json(format(n))
        } catch (e) { next(e) }
    })

    r.patch('/read-all', async (req, res, next) => {
        try {
            await prisma.notification.updateMany({
                where: { userId: req.userId },
                data:  { read: true },
            })
            const rows = await prisma.notification.findMany({
                where:   { userId: req.userId },
                orderBy: { createdAt: 'desc' },
            })
            res.json(rows.map(format))
        } catch (e) { next(e) }
    })

    r.delete('/', async (req, res, next) => {
        try {
            await prisma.notification.deleteMany({ where: { userId: req.userId } })
            res.sendStatus(204)
        } catch (e) { next(e) }
    })

    return r
}
