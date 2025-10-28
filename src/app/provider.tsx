"use client"

import { usePlaygroundStore } from '@/store/Playground'
import { usePathname } from 'next/navigation'

import React, { useEffect } from 'react'

function Provider({ children }: { children: React.ReactNode }) {

    const pathname = usePathname()
    const store = usePlaygroundStore()


    useEffect(() => {
        store.reset()
    }, [pathname])

    return (
        <div>
            {children}
        </div>
    )
}

export default Provider