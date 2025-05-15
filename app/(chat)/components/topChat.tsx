import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCorrentContact } from '@/hook/use-current'
import { useLoading } from '@/hook/use-loading'
import { sliceText } from '@/lib/utils'
import { IMessage } from '@/types'
import { Settings2 } from 'lucide-react'
import Image from 'next/image'
import React, { FC } from 'react'

interface Props {
    messages: IMessage[]
}

const TopChat: FC<Props> = ({ messages }) => {
    const { currentContact } = useCorrentContact()
    const { onlineUser } = useLoading()
    const { isTypeng } = useLoading()
    return (
        <div className='w-full flex items-center justify-between sticky top-0 z-50 h-auto p-2 border-b border-secondary bg-background'>
            <div className='flex items-center'>
                <Avatar className='z-40'>
                    <AvatarImage className='object-cover' src={currentContact?.avatar} alt={currentContact?.email} />
                    <AvatarFallback className='uppercase'>{currentContact?.email[0]}</AvatarFallback>
                </Avatar>
                <div className='ml-2'>
                    <h2 className='font-medium text-sm'>{currentContact?.email.split("@")[0]}</h2>
                    {/* Is typing */}
                    {isTypeng.length > 0 ? (
                        <div className='text-xs flex items-center gap-1 text-muted-foreground'>
                            <p className='text-secondary-foreground animate-pulse line-clamp-1'>{sliceText(isTypeng, 20)}</p>
                            <div className='self-end mb-1'>
                                <div className='flex justify-center items-center gap-1'>
                                    <div className='w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                                    <div className='w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animation-delay:-0.10s]'></div>
                                    <div className='w-1 h-1 bg-secondary-foreground rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className='text-xs'>
                            {onlineUser.some(user => user._id === currentContact?._id) ?
                                (
                                    <>
                                        <span className='text-green-500'>●</span> Online
                                    </>
                                ) :
                                (
                                    <>
                                        <span className='text-muted-foreground'>●</span> Last seen recently
                                    </>
                                )
                            }
                        </p>
                    )}
                </div>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button size={"icon"} variant={"secondary"}>
                        <Settings2 />
                    </Button>
                </SheetTrigger>
                <SheetContent className='w-80 max-md:w-full p-2 overflow-y-scroll border-secondary'>
                    <SheetHeader>
                        <SheetTitle />
                    </SheetHeader>
                    <div className='mx-auto w-36 h-36 relative'>
                        <Avatar className='w-full h-full'>
                            <AvatarImage src={currentContact?.avatar} alt={currentContact?.email} className='object-cover' />
                            <AvatarFallback className='text-6xl uppercase font-spaceGrotesk'>
                                {currentContact?.email[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <Separator className='mx-auto' />

                    <h1 className='text-center capitalize font-spaceGrotesk text-md'>{currentContact?.email}</h1>

                    <div className='flex flex-col w-full gap-2'>
                        {currentContact?.firstName && (
                            <div className='flex items-center gap-1'>
                                <p className='font-spaceGrotesk'>First Name:</p>
                                <p className='font-spaceGrotesk text-muted-foreground'>{currentContact?.firstName}</p>
                            </div>
                        )}
                        {currentContact?.lastName && (
                            <div className='flex items-center gap-1'>
                                <p className='font-spaceGrotesk'>Last Name:</p>
                                <p className='font-spaceGrotesk text-muted-foreground'>{currentContact?.lastName}</p>
                            </div>
                        )}
                        {currentContact?.bio && (
                            <div className='flex items-center gap-1'>
                                <p className='font-spaceGrotesk'>
                                    About: <span className='font-spaceGrotesk text-muted-foreground'>{currentContact?.bio}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    <Separator className='mx-auto' />
                    <h2 className='text-xl'>Images</h2>
                    <div className='flex flex-col space-y-2'>
                        {messages.filter(msg => msg.image).map((item) => (
                            <div className='w-full h-36 relative' key={item.image}>
                                <Image
                                    src={item.image}
                                    alt={item._id}
                                    fill
                                    className='object-cover rounded-md'
                                />
                            </div>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default TopChat
