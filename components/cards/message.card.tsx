import { useCorrentContact } from '@/hook/use-current'
import { CONST } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { IMessage } from '@/types'
import { format } from 'date-fns'
import { Check, CheckCheck, Edit2, Trash } from 'lucide-react'
import React, { FC } from 'react'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'
import Image from 'next/image'

interface Props {
    isReceived?: boolean,
    message: IMessage
    onReaction: (reaction: string, messageId: string) => Promise<void>
    onDeleteMessage: (messageId: string) => Promise<void>
}

const MessageCard: FC<Props> = ({ isReceived, message, onReaction, onDeleteMessage }) => {
    const { currentContact, setMessage } = useCorrentContact()
    const reaction = ["👍", "😂", "❤", "😍", "👎"]
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className={cn("m-2.5 font-medium text-xs flex", message.receiver._id === currentContact?._id ? "justify-start" : "justify-end")}>
                    <div className={cn('relative inline p-2 pl-2.5 pr-12 w-[40%]', message.receiver._id === currentContact?._id ? "bg-blue-500" : "bg-gray-600")}>
                        {message.image && <Image src={message.image} alt={message._id} width={200} height={150} className='w-full h-full object-contain' />}
                        {message.text.length > 0 && <p className='text-sm text-white'>{message.text}</p>}
                        <div className='right-1 bottom-0 absolute opacity-60 text-[9px] flex gap-[3px]'>
                            <p>{format(message.updatedAt, "hh:mm")}</p>
                            <div className='self-end'>
                                {message.receiver._id === currentContact?._id && (
                                    message.satus === CONST.READ ? <CheckCheck size={12} /> : <Check size={12} />
                                )}
                            </div>
                            <p className='absolute -right-3.5 -bottom-2 text-md text-xl'>{message.reaction}</p>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='w-56 p-0 mb-10'>
                <ContextMenuItem className='grid grid-cols-5'>
                    {reaction.map((e) => (
                        <div
                            key={e}
                            className={cn("text-xl cursor-pointer p-1 hover:bg-[var(--primary)]", message.reaction === e && "bg-[var(--primary)]")}
                            onClick={() => onReaction(e, message._id)}
                        >
                            {e}
                        </div>
                    ))}
                </ContextMenuItem>
                {message.sender._id !== currentContact?._id && (
                    <>
                        <ContextMenuSeparator />
                        {!message.image && (
                            <ContextMenuItem className='cursor-pointer hover:bg-[var(--primary)]/20' onClick={() => setMessage(message)}>
                                <Edit2 size={14} className='mr-2' />
                                <span>Edit</span>
                            </ContextMenuItem>
                        )}
                        <ContextMenuItem
                            className='cursor-pointer hover:bg-[var(--primary)]/20'
                            onClick={() => onDeleteMessage(message._id)}
                        >
                            <Trash size={14} className='mr-2' />
                            <span>Delete</span>
                        </ContextMenuItem>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default MessageCard
