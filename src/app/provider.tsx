"use client"

import { usePlaygroundStore } from '@/store/Playground'
import { usePathname } from 'next/navigation'
import { getAllApiKeys } from '@/lib/storage'
import type { ProviderId } from '@/lib/models/config'

import React, { useEffect, useRef } from 'react'

function Provider({ children }: { children: React.ReactNode }) {

    const pathname = usePathname()
    const setApiKey = usePlaygroundStore((state) => state.setApiKey)
    const reset = usePlaygroundStore((state) => state.reset)
    const prevPathnameRef = useRef<string | null>(null)

    // Load API keys from storage on mount (only once)
    useEffect(() => {
        const allKeys = getAllApiKeys();
        Object.entries(allKeys).forEach(([provider, key]) => {
            if (key) {
                setApiKey(provider as ProviderId, key);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Reset store when pathname changes (but not on initial mount)
    useEffect(() => {
        // Skip reset on initial mount
        if (prevPathnameRef.current === null) {
            prevPathnameRef.current = pathname;
            return;
        }

        // Only reset if pathname actually changed
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;
            reset();
        }
    }, [pathname, reset])

    return (
        <div>
            {children}
        </div>
    )
}

export default Provider