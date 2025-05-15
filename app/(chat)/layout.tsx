import { authOptions } from '@/lib/auth-options'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React, { FC } from 'react'

interface Props {
    children: React.ReactNode
}

const Layout: FC<Props> = async ({ children }) => {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth")
    return (
        <div>{children}</div>
    )
}

export default Layout
