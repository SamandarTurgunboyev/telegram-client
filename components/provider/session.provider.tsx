"use client"

import { SessionProvider as Session } from "next-auth/react"
import React, { FC } from 'react'

interface Props {
    children: React.ReactNode
}

const SessionProvider: FC<Props> = ({ children }) => {
    return (
        <Session>
            {children}
        </Session>
    )
}

export default SessionProvider
