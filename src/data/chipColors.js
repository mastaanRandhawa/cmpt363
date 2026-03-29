export const priority = {
    high: {
        label: 'HIGH',
        color: 'var(--color-important)',
        chipColor: 'important', // used for the -soft background
    },
    med: {
        label: 'MED',
        color: 'var(--color-primary)',
        chipColor: 'primary',
    },
    low: {
        label: 'LOW',
        color: 'var(--color-success)',
        chipColor: 'success',
    },
}

export const effort = {
    1: { label: '1', color: 'var(--color-success)',   soft: 'var(--color-success-soft)' },
    2: { label: '2', color: 'var(--color-primary)',   soft: 'var(--color-primary-soft)' },
    3: { label: '3', color: 'var(--color-accent)',    soft: 'var(--color-accent-soft)' },
    4: { label: '4', color: 'var(--color-secondary)', soft: 'var(--color-secondary-soft)' },
    5: { label: '5', color: 'var(--color-important)', soft: 'var(--color-important-soft)' },
}