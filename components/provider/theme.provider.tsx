"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import NoSrr from "react-no-ssr"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>
        <NoSrr>
            {children}
        </NoSrr>
    </NextThemesProvider>
}
