import { cn } from '@/lib/utils'
import React, { FC } from 'react'
import { Skeleton } from '../ui/skeleton'

interface Props {
    isReceived: boolean
}

const MessageLoading: FC<Props> = ({ isReceived = false }) => {
    return (
        <div className={cn("m-2.5 font-medium text-xs flex ", isReceived ? "justify-start" : "justify-end")}>
            <Skeleton className={cn('relative inline p-2 pl-2.5 pr-12', isReceived ? "bg-blue-500/20" : "bg-gray-600/20")}>
                <Skeleton className='w-36 h-5' />
                <span className='text-xs right-1 bottom-0 opacity-60 absolute'>√</span>
            </Skeleton>
        </div>
    )
}

export default MessageLoading
