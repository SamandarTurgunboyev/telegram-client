"use client"

import { IError } from "@/types"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { FC } from "react"
import { toast } from "sonner"

interface Props {
    children: React.ReactNode
}

const onError = (error: IError | Error) => {
    if ((error as IError).response?.data?.messsage) {
        return toast((error as IError).response.data.messsage)
    }
    return toast("Something went wrong")
}

const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            onError: onError
        }
    }
})

const QueryProvider: FC<Props> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

export default QueryProvider
