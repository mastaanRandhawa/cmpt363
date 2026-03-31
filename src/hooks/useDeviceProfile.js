import { useState, useEffect } from 'react'

const DEVICE_PROFILES = [

    // ── Apple iPhone 16 series (2024) ───────────────────────────────────────────
    { name: 'iPhone 16',           w: 393,  h: 852,  dpr: 3   },
    { name: 'iPhone 16 Plus',      w: 430,  h: 932,  dpr: 3   },
    { name: 'iPhone 16 Pro',       w: 402,  h: 874,  dpr: 3   },
    { name: 'iPhone 16 Pro Max',   w: 440,  h: 956,  dpr: 3   },

    // ── Apple iPhone 15 series (2023) ───────────────────────────────────────────
    { name: 'iPhone 15',           w: 393,  h: 852,  dpr: 3   },
    { name: 'iPhone 15 Plus',      w: 430,  h: 932,  dpr: 3   },
    { name: 'iPhone 15 Pro',       w: 393,  h: 852,  dpr: 3   },
    { name: 'iPhone 15 Pro Max',   w: 430,  h: 932,  dpr: 3   },

    // ── Apple iPhone 14 series (2022) ───────────────────────────────────────────
    { name: 'iPhone 14',           w: 390,  h: 844,  dpr: 3   },
    { name: 'iPhone 14 Plus',      w: 428,  h: 926,  dpr: 3   },
    { name: 'iPhone 14 Pro',       w: 393,  h: 852,  dpr: 3   },
    { name: 'iPhone 14 Pro Max',   w: 430,  h: 932,  dpr: 3   },

    // ── Apple iPhone 13 series (2021) ───────────────────────────────────────────
    { name: 'iPhone 13 mini',      w: 375,  h: 812,  dpr: 3   },
    { name: 'iPhone 13',           w: 390,  h: 844,  dpr: 3   },
    { name: 'iPhone 13 Pro',       w: 390,  h: 844,  dpr: 3   },
    { name: 'iPhone 13 Pro Max',   w: 428,  h: 926,  dpr: 3   },

    // ── Apple iPhone 12 series (2020) ───────────────────────────────────────────
    { name: 'iPhone 12 mini',      w: 360,  h: 780,  dpr: 3   },
    { name: 'iPhone 12',           w: 390,  h: 844,  dpr: 3   },
    { name: 'iPhone 12 Pro',       w: 390,  h: 844,  dpr: 3   },
    { name: 'iPhone 12 Pro Max',   w: 428,  h: 926,  dpr: 3   },

    // ── Apple iPhone SE & older ─────────────────────────────────────────────────
    { name: 'iPhone SE (3rd gen)', w: 375,  h: 667,  dpr: 2   },
    { name: 'iPhone SE (2nd gen)', w: 375,  h: 667,  dpr: 2   },
    { name: 'iPhone 11',           w: 414,  h: 896,  dpr: 2   },
    { name: 'iPhone 11 Pro',       w: 375,  h: 812,  dpr: 3   },
    { name: 'iPhone 11 Pro Max',   w: 414,  h: 896,  dpr: 3   },
    { name: 'iPhone XR',           w: 414,  h: 896,  dpr: 2   },
    { name: 'iPhone XS',           w: 375,  h: 812,  dpr: 3   },
    { name: 'iPhone XS Max',       w: 414,  h: 896,  dpr: 3   },
    { name: 'iPhone X',            w: 375,  h: 812,  dpr: 3   },

    // ── Apple iPad Pro ──────────────────────────────────────────────────────────
    { name: 'iPad Pro 11" M4',     w: 834,  h: 1210, dpr: 2   },
    { name: 'iPad Pro 13" M4',     w: 1032, h: 1376, dpr: 2   },
    { name: 'iPad Pro 11" M2',     w: 834,  h: 1194, dpr: 2   },
    { name: 'iPad Pro 12.9" M2',   w: 1024, h: 1366, dpr: 2   },

    // ── Apple iPad Air ──────────────────────────────────────────────────────────
    { name: 'iPad Air 11" M2',     w: 820,  h: 1180, dpr: 2   },
    { name: 'iPad Air 13" M2',     w: 1024, h: 1366, dpr: 2   },
    { name: 'iPad Air M1',         w: 820,  h: 1180, dpr: 2   },

    // ── Apple iPad (standard) ───────────────────────────────────────────────────
    { name: 'iPad 10th gen',       w: 820,  h: 1180, dpr: 2   },
    { name: 'iPad 9th gen',        w: 810,  h: 1080, dpr: 2   },

    // ── Apple iPad mini ─────────────────────────────────────────────────────────
    { name: 'iPad mini 7th gen',   w: 744,  h: 1133, dpr: 2   },
    { name: 'iPad mini 6th gen',   w: 744,  h: 1133, dpr: 2   },

    // ── Samsung Galaxy S25 series (2025) ────────────────────────────────────────
    { name: 'Galaxy S25',          w: 360,  h: 780,  dpr: 3      },
    { name: 'Galaxy S25+',         w: 384,  h: 832,  dpr: 3      },
    { name: 'Galaxy S25 Ultra',    w: 384,  h: 832,  dpr: 3.088  },

    // ── Samsung Galaxy S24 series (2024) ────────────────────────────────────────
    { name: 'Galaxy S24',          w: 360,  h: 780,  dpr: 3      },
    { name: 'Galaxy S24+',         w: 384,  h: 832,  dpr: 3      },
    { name: 'Galaxy S24 Ultra',    w: 384,  h: 832,  dpr: 3.088  },
    { name: 'Galaxy S24 FE',       w: 360,  h: 800,  dpr: 3      },

    // ── Samsung Galaxy S23 series (2023) ────────────────────────────────────────
    { name: 'Galaxy S23',          w: 360,  h: 780,  dpr: 3      },
    { name: 'Galaxy S23+',         w: 384,  h: 832,  dpr: 3      },
    { name: 'Galaxy S23 Ultra',    w: 384,  h: 832,  dpr: 3.088  },
    { name: 'Galaxy S23 FE',       w: 360,  h: 800,  dpr: 3      },

    // ── Samsung Galaxy A series ─────────────────────────────────────────────────
    { name: 'Galaxy A55',          w: 360,  h: 800,  dpr: 3   },
    { name: 'Galaxy A54',          w: 360,  h: 800,  dpr: 3   },
    { name: 'Galaxy A35',          w: 360,  h: 800,  dpr: 3   },
    { name: 'Galaxy A15',          w: 360,  h: 800,  dpr: 2   },

    // ── Samsung Galaxy Z Fold & Flip ────────────────────────────────────────────
    { name: 'Galaxy Z Fold 6 (cover)',  w: 373,  h: 832,  dpr: 3   },
    { name: 'Galaxy Z Fold 6 (inner)',  w: 768,  h: 1080, dpr: 2   },
    { name: 'Galaxy Z Fold 5 (cover)',  w: 373,  h: 832,  dpr: 3   },
    { name: 'Galaxy Z Fold 5 (inner)',  w: 768,  h: 1080, dpr: 2   },
    { name: 'Galaxy Z Flip 6',          w: 360,  h: 780,  dpr: 3   },
    { name: 'Galaxy Z Flip 5',          w: 360,  h: 780,  dpr: 3   },

    // ── Samsung Galaxy Tab ──────────────────────────────────────────────────────
    { name: 'Galaxy Tab S9',            w: 834,  h: 1194, dpr: 2   },
    { name: 'Galaxy Tab S9+',           w: 924,  h: 1308, dpr: 2   },
    { name: 'Galaxy Tab S9 Ultra',      w: 1180, h: 1848, dpr: 2   },
    { name: 'Galaxy Tab S9 FE',         w: 800,  h: 1280, dpr: 1.5 },
    { name: 'Galaxy Tab A9+',           w: 800,  h: 1280, dpr: 2   },

    // ── Google Pixel 9 series (2024) ────────────────────────────────────────────
    { name: 'Pixel 9',                  w: 412,  h: 892,  dpr: 2.625 },
    { name: 'Pixel 9 Pro',              w: 412,  h: 892,  dpr: 2.625 },
    { name: 'Pixel 9 Pro XL',           w: 412,  h: 924,  dpr: 3.5   },
    { name: 'Pixel 9 Pro Fold (cover)', w: 412,  h: 748,  dpr: 2.1   },
    { name: 'Pixel 9 Pro Fold (inner)', w: 792,  h: 1008, dpr: 2     },

    // ── Google Pixel 8 series (2023) ────────────────────────────────────────────
    { name: 'Pixel 8',             w: 412,  h: 892,  dpr: 2.625 },
    { name: 'Pixel 8 Pro',         w: 412,  h: 924,  dpr: 3.5   },
    { name: 'Pixel 8a',            w: 412,  h: 892,  dpr: 2.625 },

    // ── Google Pixel 7 series (2022) ────────────────────────────────────────────
    { name: 'Pixel 7',             w: 412,  h: 915,  dpr: 2.625 },
    { name: 'Pixel 7 Pro',         w: 412,  h: 892,  dpr: 3.5   },
    { name: 'Pixel 7a',            w: 412,  h: 892,  dpr: 2.625 },

    // ── Google Pixel Tablet ─────────────────────────────────────────────────────
    { name: 'Pixel Tablet',        w: 1280, h: 800,  dpr: 2   },

    // ── OnePlus ─────────────────────────────────────────────────────────────────
    { name: 'OnePlus 13',               w: 412,  h: 919,  dpr: 3   },
    { name: 'OnePlus 12',               w: 412,  h: 919,  dpr: 3   },
    { name: 'OnePlus Open (cover)',      w: 412,  h: 748,  dpr: 2.5 },
    { name: 'OnePlus Open (inner)',      w: 800,  h: 920,  dpr: 2.5 },

    // ── Xiaomi ──────────────────────────────────────────────────────────────────
    { name: 'Xiaomi 15',           w: 393,  h: 851,  dpr: 3   },
    { name: 'Xiaomi 15 Ultra',     w: 412,  h: 892,  dpr: 3   },
    { name: 'Xiaomi 14',           w: 393,  h: 851,  dpr: 3   },
    { name: 'Xiaomi 14 Ultra',     w: 412,  h: 892,  dpr: 3   },
    { name: 'Xiaomi 14T Pro',      w: 412,  h: 892,  dpr: 3   },
    { name: 'Redmi Note 13 Pro',   w: 393,  h: 851,  dpr: 3   },

    // ── Motorola ────────────────────────────────────────────────────────────────
    { name: 'Moto G Power (2024)', w: 412,  h: 892,  dpr: 2.625 },
    { name: 'Motorola Edge 50',    w: 412,  h: 892,  dpr: 3     },
    { name: 'Moto Razr+ (2024)',   w: 412,  h: 892,  dpr: 3     },

    // ── Generic / fallback buckets ───────────────────────────────────────────────
    { name: 'Small phone',         w: 360,  h: 640,  dpr: 2   },
    { name: 'Mid phone',           w: 390,  h: 844,  dpr: 2.5 },
    { name: 'Large phone',         w: 412,  h: 915,  dpr: 2.6 },
    { name: 'Android tablet 10"',  w: 800,  h: 1280, dpr: 2   },
    { name: 'Android tablet 12"',  w: 1200, h: 1600, dpr: 2   },
]

function detectProfile() {
    const sw  = window.screen.width
    const sh  = window.screen.height
    const dpr = window.devicePixelRatio || 1
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // A real device: touch-capable and screen fits a mobile/tablet footprint
    const isRealDevice = hasTouch && sw <= 1600

    // Score each profile by combined pixel + dpr distance; pick closest match.
    // Hard-reject anything > 40px off on either axis to avoid wild mismatches.
    let best      = null
    let bestScore = Infinity

    for (const p of DEVICE_PROFILES) {
        const wDiff   = Math.abs(p.w   - sw)
        const hDiff   = Math.abs(p.h   - sh)
        const dprDiff = Math.abs(p.dpr - dpr) * 50 // weight dpr heavily

        if (wDiff > 40 || hDiff > 40) continue

        const score = wDiff + hDiff + dprDiff
        if (score < bestScore) {
            bestScore = score
            best = p
        }
    }

    return { sw, sh, dpr, hasTouch, isRealDevice, match: best }
}

export function useDeviceProfile() {
    const [profile, setProfile] = useState(detectProfile)

    useEffect(() => {
        const handler = () => setProfile(detectProfile())
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return profile
}