import { Router } from 'express'
import { randomUUID } from 'crypto'

/** @param {import('@prisma/client').PrismaClient} prisma */
export function createTasksRouter(prisma) {
    const r = Router()

    function formatSubtask(s) {
        return {
            id:            s.id,
            label:         s.label,
            done:          s.done,
            ai:            s.ai,
            estSubtaskTime: s.estSubtaskTime ?? null,
        }
    }

    function formatTask(t) {
        return {
            id:             t.id,
            name:           t.name,
            due:            t.due,
            time:           t.time,
            priority:       t.priority,
            effort:         t.effort,
            status:         t.status,
            notes:          t.notes,
            privateNotes:   t.privateNotes,
            timer:          t.timer,
            useAI:          t.useAI,
            timeLogged:     t.timeLogged,
            aiInstructions: t.aiInstructions,
            totalTimeEst:   t.totalTimeEst ?? null,
            location:       t.location ?? null,
            repeat:         t.repeat ?? null,
            subtasks:       [...t.subtasks].sort((a, b) => a.sortOrder - b.sortOrder).map(formatSubtask),
        }
    }

    r.get('/', async (req, res, next) => {
        try {
            const tasks = await prisma.task.findMany({
                where:  { userId: req.userId },
                include: {
                    subtasks: true,
                },
                orderBy: { updatedAt: 'desc' },
            })
            res.json(tasks.map(formatTask))
        } catch (e) { next(e) }
    })

    r.get('/:id', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where:   { id: req.params.id, userId: req.userId },
                include: { subtasks: true },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })
            res.json(formatTask(task))
        } catch (e) { next(e) }
    })

    r.post('/', async (req, res, next) => {
        try {
            const {
                name, due, time, priority, effort, status,
                notes, privateNotes, timer, useAI, timeLogged, aiInstructions, totalTimeEst,
                location, repeat, subtasks = [],
            } = req.body

            if (!name || !priority || effort == null) {
                return res.status(400).json({ error: 'name, priority, and effort are required' })
            }

            const task = await prisma.task.create({
                data: {
                    id:             req.body.id ?? randomUUID(),
                    userId:         req.userId,
                    name,
                    due:            due ?? null,
                    time:           time ?? null,
                    priority,
                    effort:         Number(effort),
                    status:         status ?? 'todo',
                    notes:          notes ?? '',
                    privateNotes:   privateNotes ?? false,
                    timer:          timer ?? false,
                    useAI:          useAI ?? false,
                    timeLogged:     timeLogged ?? 0,
                    aiInstructions: aiInstructions ?? '',
                    totalTimeEst:   totalTimeEst ?? null,
                    location:       location === undefined ? undefined : location,
                    repeat:         repeat === undefined ? undefined : repeat,
                    subtasks: {
                        create: subtasks.map((s, i) => ({
                            id:             s.id ?? randomUUID(),
                            label:          s.label,
                            done:           !!s.done,
                            ai:             !!s.ai,
                            estSubtaskTime: s.estSubtaskTime ?? null,
                            sortOrder:      i,
                        })),
                    },
                },
                include: { subtasks: true },
            })
            res.status(201).json(formatTask(task))
        } catch (e) { next(e) }
    })

    r.patch('/:id', async (req, res, next) => {
        try {
            const existing = await prisma.task.findFirst({
                where: { id: req.params.id, userId: req.userId },
            })
            if (!existing) return res.status(404).json({ error: 'Task not found' })

            const {
                name, due, time, priority, effort, status,
                notes, privateNotes, timer, useAI, timeLogged, aiInstructions, totalTimeEst,
                location, repeat, subtasks,
            } = req.body

            const data = {}
            if (name !== undefined)           data.name           = name
            if (due !== undefined)            data.due            = due
            if (time !== undefined)           data.time           = time
            if (priority !== undefined)       data.priority       = priority
            if (effort !== undefined)         data.effort         = Number(effort)
            if (status !== undefined)         data.status         = status
            if (notes !== undefined)          data.notes          = notes
            if (privateNotes !== undefined)   data.privateNotes   = privateNotes
            if (timer !== undefined)          data.timer          = timer
            if (useAI !== undefined)          data.useAI          = useAI
            if (timeLogged !== undefined)     data.timeLogged     = timeLogged
            if (aiInstructions !== undefined) data.aiInstructions = aiInstructions
            if (totalTimeEst !== undefined)   data.totalTimeEst   = totalTimeEst
            if (location !== undefined)       data.location       = location
            if (repeat !== undefined)         data.repeat         = repeat

            const task = await prisma.$transaction(async (tx) => {
                await tx.task.update({
                    where: { id: existing.id },
                    data,
                })

                if (Array.isArray(subtasks)) {
                    await tx.subtask.deleteMany({ where: { taskId: existing.id } })
                    await tx.subtask.createMany({
                        data: subtasks.map((s, i) => ({
                            id:             s.id ?? randomUUID(),
                            taskId:         existing.id,
                            label:          s.label,
                            done:           !!s.done,
                            ai:             !!s.ai,
                            estSubtaskTime: s.estSubtaskTime ?? null,
                            sortOrder:      i,
                        })),
                    })
                }

                return tx.task.findUnique({
                    where:   { id: existing.id },
                    include: { subtasks: true },
                })
            })

            res.json(formatTask(task))
        } catch (e) { next(e) }
    })

    r.delete('/:id', async (req, res, next) => {
        try {
            const result = await prisma.task.deleteMany({
                where: { id: req.params.id, userId: req.userId },
            })
            if (result.count === 0) return res.status(404).json({ error: 'Task not found' })
            res.status(204).end()
        } catch (e) { next(e) }
    })

    r.post('/:id/toggle-complete', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where:   { id: req.params.id, userId: req.userId },
                include: { subtasks: true },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })

            const nextStatus = task.status === 'completed' ? 'todo' : 'completed'
            const updated = await prisma.task.update({
                where:   { id: task.id },
                data:    { status: nextStatus },
                include: { subtasks: true },
            })
            res.json(formatTask(updated))
        } catch (e) { next(e) }
    })

    r.patch('/:id/subtasks/reorder', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where:   { id: req.params.id, userId: req.userId },
                include: { subtasks: true },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })

            const { orderedIds } = req.body
            if (!Array.isArray(orderedIds)) {
                return res.status(400).json({ error: 'orderedIds array required' })
            }

            const idSet = new Set(task.subtasks.map(s => s.id))
            if (orderedIds.length !== idSet.size || !orderedIds.every(id => idSet.has(id))) {
                return res.status(400).json({ error: 'orderedIds must be a permutation of subtask ids' })
            }

            await prisma.$transaction(
                orderedIds.map((id, i) =>
                    prisma.subtask.update({
                        where: { id },
                        data:  { sortOrder: i },
                    })
                )
            )

            const full = await prisma.task.findUnique({
                where:   { id: task.id },
                include: { subtasks: true },
            })
            res.json(formatTask(full))
        } catch (e) { next(e) }
    })

    r.patch('/:id/subtasks/:subtaskId', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where: { id: req.params.id, userId: req.userId },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })

            const sub = await prisma.subtask.findFirst({
                where: { id: req.params.subtaskId, taskId: task.id },
            })
            if (!sub) return res.status(404).json({ error: 'Subtask not found' })

            const done = req.body.done
            if (typeof done !== 'boolean') {
                return res.status(400).json({ error: 'body.done (boolean) required' })
            }

            await prisma.subtask.update({
                where: { id: sub.id },
                data:  { done },
            })

            const full = await prisma.task.findUnique({
                where:   { id: task.id },
                include: { subtasks: true },
            })
            res.json(formatTask(full))
        } catch (e) { next(e) }
    })

    r.post('/:id/subtasks', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where:   { id: req.params.id, userId: req.userId },
                include: { subtasks: true },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })

            const { label, ai, estSubtaskTime } = req.body
            if (!label || typeof label !== 'string') {
                return res.status(400).json({ error: 'label required' })
            }

            const maxOrder = task.subtasks.reduce((m, s) => Math.max(m, s.sortOrder), -1)
            await prisma.subtask.create({
                data: {
                    id:             randomUUID(),
                    taskId:         task.id,
                    label:          label.trim(),
                    done:           false,
                    ai:             !!ai,
                    estSubtaskTime: estSubtaskTime ?? null,
                    sortOrder:      maxOrder + 1,
                },
            })

            const full = await prisma.task.findUnique({
                where:   { id: task.id },
                include: { subtasks: true },
            })
            res.status(201).json(formatTask(full))
        } catch (e) { next(e) }
    })

    r.delete('/:id/subtasks/:subtaskId', async (req, res, next) => {
        try {
            const task = await prisma.task.findFirst({
                where: { id: req.params.id, userId: req.userId },
            })
            if (!task) return res.status(404).json({ error: 'Task not found' })

            const result = await prisma.subtask.deleteMany({
                where: { id: req.params.subtaskId, taskId: task.id },
            })
            if (result.count === 0) return res.status(404).json({ error: 'Subtask not found' })

            const full = await prisma.task.findUnique({
                where:   { id: task.id },
                include: { subtasks: true },
            })
            res.json(formatTask(full))
        } catch (e) { next(e) }
    })

    return r
}