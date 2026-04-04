/**
 * REST API (JSON). Auth: optional header `X-User-Id`, else `DEFAULT_USER_ID` from .env, else first user.
 *
 * GET  /api/health
 * GET  /api/me
 * GET  /api/tasks | POST /api/tasks | GET /api/tasks/:id | PATCH /api/tasks/:id | DELETE /api/tasks/:id
 * POST /api/tasks/:id/toggle-complete
 * PATCH /api/tasks/:id/subtasks/reorder  body: { orderedIds }
 * PATCH /api/tasks/:id/subtasks/:subtaskId  body: { done }
 * POST /api/tasks/:id/subtasks  body: { label, ai?, estimatedMinutes? }
 * DELETE /api/tasks/:id/subtasks/:subtaskId
 * GET  /api/notifications | POST /api/notifications | PATCH /api/notifications/read-all | DELETE /api/notifications
 * GET  /api/robo | POST /api/robo/xp | /mood | /complete-task | /check-streak | /reset
 * GET  /api/task-templates | GET /api/task-templates/similar?taskName= | POST /api/task-templates/save | DELETE /api/task-templates
 * POST /api/ai/breakdown  body: { task }
 * POST /api/ai/recommend  body: { tasks, moodIndex, streak }
 */
import 'dotenv/config'
import express, { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { createResolveUser } from './middleware/resolveUser.js'
import { createTasksRouter } from './routes/tasks.js'
import { createNotificationsRouter } from './routes/notifications.js'
import { createRoboRouter } from './routes/robo.js'
import { createTemplatesRouter } from './routes/templates.js'
import { createAiRouter } from './routes/ai.js'

const prisma = new PrismaClient()
const app    = express()
const port   = Number(process.env.PORT) || 3001

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-User-Id')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})
app.use(express.json())

app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

const api           = Router()
const resolveUser   = createResolveUser(prisma)
api.use(resolveUser)

api.get('/me', (req, res) => {
    res.json({ userId: req.userId })
})

api.use('/tasks', createTasksRouter(prisma))
api.use('/notifications', createNotificationsRouter(prisma))
api.use('/robo', createRoboRouter(prisma))
api.use('/task-templates', createTemplatesRouter(prisma))
api.use('/ai', createAiRouter(prisma))

app.use('/api', api)

app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(port, () => {
    console.log(`API http://localhost:${port}`)
})
