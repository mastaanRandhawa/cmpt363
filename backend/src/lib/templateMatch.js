const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'my', 'do', 'doing', 'some', 'all', 'our',
])

export function normaliseName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w))
        .sort()
        .join(' ')
}

export function similarity(nameA, nameB) {
    const a = new Set(normaliseName(nameA).split(' '))
    const b = new Set(normaliseName(nameB).split(' '))
    if (a.size === 0 || b.size === 0) return 0
    const intersection = [...a].filter(w => b.has(w)).length
    const union        = new Set([...a, ...b]).size
    return intersection / union
}

export function findSimilarTemplates(taskName, templates, threshold = 0.3) {
    return templates
        .map(t => ({ ...t, score: similarity(taskName, t.taskName) }))
        .filter(t => t.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
}

export function buildDiff(aiOriginal, finalSubtasks) {
    const aiIds    = new Set(aiOriginal.map(s => s.id))
    const finalIds = new Set(finalSubtasks.map(s => s.id))

    const kept = finalSubtasks.filter(s => s.ai && aiIds.has(s.id))

    const removed = aiOriginal.filter(s => !finalIds.has(s.id))

    const userAdded = finalSubtasks.filter(s => !s.ai)

    return { kept, removed, userAdded }
}
