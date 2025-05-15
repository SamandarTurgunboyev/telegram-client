"use client"

import { IUser } from '@/types'
import React, { FC, useEffect, useState } from 'react'
import Setting from './setting'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import { useRouter } from 'next/navigation'
import { useCorrentContact } from '@/hook/use-current'
import { cn, sliceText } from '@/lib/utils'
import { useLoading } from '@/hook/use-loading'
import { format } from "date-fns"
import { CONST } from '@/lib/constants'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface Props {
    contacts: IUser[]
}

const ContactList: FC<Props> = ({ contacts }) => {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const { onlineUser } = useLoading()
    const { data: session } = useSession()

    const filteredContacts = contacts.filter(contact => contact.email.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
        const dateA = a.lastMessage?.updatedAt ? new Date(a.lastMessage.updatedAt).getTime() : 0
        const dateB = b.lastMessage?.updatedAt ? new Date(b.lastMessage.updatedAt).getTime() : 0
        return dateB - dateA
    })

    const { currentContact, setCurrentContact } = useCorrentContact()
    const renderContact = (contact: IUser) => {
        const onChat = () => {
            if (currentContact?._id == contact._id) return
            setCurrentContact(contact)
            router.push(`/?chat=${contact._id}`)
        }

        return (
            <div
                className={cn(
                    'flex mt-2 justify-between max-md:justify-center items-center cursor-pointer hover:bg-[var(--secondary)] md:p-2',
                    currentContact?._id === contact._id && 'bg-[var(--secondary)]'
                )}
                onClick={onChat}
            >
                <div className='flex items-center gap-2'>
                    <div className='relative'>
                        <Avatar className='z-40 bg-secondary flex justify-center items-center'>
                            <AvatarImage className='object-cover' src={contact.avatar} alt={contact.email} />
                            <AvatarFallback className='uppercase'>{contact.email[0]}</AvatarFallback>
                        </Avatar>
                        {onlineUser.some(user => user._id === contact._id) &&
                            <div className='size-3 bg-green-500 absolute rounded-full bottom-0 right-0 !z-50' />
                        }
                    </div>
                    <div className='max-md:hidden'>
                        <h2 className='capitalize line-clamp-1 text-sm'>{contact.email?.split("@")[0]}</h2>
                        {contact.lastMessage?.image && (
                            <div className='flex items-center gap-2'>
                                <Image src={contact.lastMessage.image} alt={contact.lastMessage._id} width={20} height={20} className='object-cover' />
                                <p
                                    className={cn('text-xs line-clamp-1',
                                        contact.lastMessage
                                            ? contact.lastMessage.sender._id === session?.currentUser._id ? "text-muted-foreground" : contact.lastMessage.satus !== CONST.READ
                                                ? " text-foreground"
                                                : "text-muted-foreground"
                                            : "text-muted-foreground"
                                    )}>
                                    Photo
                                </p>
                            </div>
                        )}
                        {!contact.lastMessage?.image && (
                            <p className={
                                cn('text-xs line-clamp-1',
                                    contact.lastMessage
                                        ? contact.lastMessage.sender._id === session?.currentUser._id ? "text-muted-foreground" : contact.lastMessage.satus !== CONST.READ
                                            ? " text-foreground"
                                            : "text-muted-foreground"
                                        : "text-muted-foreground"
                                )
                            }>
                                {contact.lastMessage ? sliceText(contact.lastMessage.text, 20) : 'No message yet'}
                            </p>
                        )}
                    </div>
                </div>
                <div className='self-end max-md:hidden '>
                    <p className='text-xs text-muted-foreground'>
                        {contact?.lastMessage?.updatedAt && format(contact?.lastMessage?.updatedAt, "hh:mm a")}
                    </p>
                </div>
            </div>
        )
    }
    return (
        <>
            {/* Top Bar */}
            <div className='flex items-center bg-[var(--secondary)] pl-2 sticky top-0 bg-backdrop'>
                <Setting />
                <div className='m-2 w-full max-md:hidden'>
                    <Input className='focus:outline-none' type='text' placeholder='Search...' value={query} onChange={e => setQuery(e.target.value)} />
                </div>
            </div>
            {/* contact */}

            {filteredContacts.length === 0 ? (
                <div className='w-full h-[95vh] flex justify-center items-center text-center'>
                    <p>Contact list is empty</p>
                </div>
            ) : (
                filteredContacts?.map(contact => (
                    <div key={contact._id}>
                        {renderContact(contact)}
                    </div>
                ))
            )}
        </>
    )
}

export default ContactList
