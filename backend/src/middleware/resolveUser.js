/** @param {import('@prisma/client').PrismaClient} prisma */
export function createResolveUser(prisma) {
    return async function resolveUser(req, res, next) {
        try {
            let id = req.header('x-user-id') || process.env.DEFAULT_USER_ID
            if (id) {
                const u = await prisma.user.findUnique({ where: { id } })
                if (!u) {
                    return res.status(404).json({ error: 'User not found for id', id })
                }
                req.userId = id
                return next()
            }
            const u = await prisma.user.findFirst()
            if (!u) {
                return res.status(400).json({ error: 'No users in database. Run: npm run db:seed' })
            }
            req.userId = u.id
            next()
        } catch (err) {
            next(err)
        }
    }
}
