import React, { useState } from 'react'
import { Button } from '../ui/button'
import { PlayCircle } from 'lucide-react'
import { SOUNDS } from '@/lib/constants'
import { cn, getSoundLabel } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import useAudio from '@/hook/use-audio'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { useMutation } from '@tanstack/react-query'
import { generateToken } from '@/lib/generate-token'
import { useSession } from 'next-auth/react'
import { api } from '@/http/axios'
import { toast } from 'sonner'

const NotificationForm = () => {
    const [selectSound, setSelectSound] = useState<string>("")
    const [isNotification, setisNotification] = useState<string | null>(null)
    const [isSounding, setisSounding] = useState<string | null>(null)
    const { data: session, update } = useSession()

    const playSound = useAudio()

    const { mutate, isPending } = useMutation({
        mutationFn: async (payload: IPayload) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.put(
                "/api/v1/user/profile/",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            return data
        },
        onSuccess: () => {
            toast("Profile update successfully")
            update()
            setisNotification(null)
            setisSounding(null)
        }
    })

    const onPlaySound = (value: string) => {
        setSelectSound(value)
        playSound(value)
    }

    return (
        <>
            <div className='flex items-center justify-between raltive'>
                <Accordion type="single" value={isNotification!} onValueChange={setisNotification} collapsible className='mt-4 flex flex-col gap-2 border-none w-80'>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='flex'>
                            <div className='flex flex-col'>
                                <p>Notification sound</p>
                                <p className='text-muted-foreground text-xs'>{getSoundLabel(session?.currentUser.notificationSound!)}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className={cn("flex flex-col justify-between items-center bg-secondary cursor-pointer")}>
                            {SOUNDS.map((sound) => (
                                <div
                                    className={cn(
                                        'w-full flex justify-between border-b border-forground hover:bg-[var(--primary-foreground)]',
                                        selectSound === sound.value && "bg-primary-foreground text-white",
                                        session?.currentUser.notificationSound === sound.value && "bg-[var(--primary-foreground)]"
                                    )}
                                    key={sound.value}
                                    onClick={() => onPlaySound(sound.value)}
                                >
                                    <Button size={"lg"} variant={"ghost"}>
                                        {sound.label}
                                    </Button>
                                    <Button size={"icon"} variant={"ghost"}>
                                        <PlayCircle />
                                    </Button>
                                </div>
                            ))}
                        </AccordionContent>
                        <Button className='w-full mt-2 font-bold' disabled={isPending} onClick={() => mutate({ notificationSound: selectSound })}>Submit</Button>
                    </AccordionItem>
                </Accordion>
            </div>
            <Separator className='mt-2' />
            <div className='flex items-center justify-between raltive'>
                <Accordion type="single" collapsible className='mt-4 flex flex-col gap-2 border-none w-80' value={isSounding!} onValueChange={setisSounding} >
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='flex'>
                            <div className='flex flex-col'>
                                <p>Sending sound</p>
                                <p className='text-muted-foreground text-xs'>
                                    {getSoundLabel(session?.currentUser.sendingSound!)}
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className={cn("flex flex-col justify-between items-center bg-secondary cursor-pointer")}>
                            {SOUNDS.map((sound) => (
                                <div
                                    className={cn(
                                        'w-full flex justify-between border-b border-forground hover:bg-[var(--primary-foreground)]',
                                        selectSound === sound.value && "bg-primary-foreground text-white",
                                        session?.currentUser.sendingSound === sound.value && "bg-[var(--primary-foreground)]"
                                    )}
                                    key={sound.value}
                                    onClick={() => onPlaySound(sound.value)}
                                >
                                    <Button size={"lg"} variant={"ghost"}>
                                        {sound.label}
                                    </Button>
                                    <Button size={"icon"} variant={"ghost"}>
                                        <PlayCircle />
                                    </Button>
                                </div>
                            ))}
                        </AccordionContent>
                        <Button className='w-full mt-2 font-bold' disabled={isPending} onClick={() => mutate({ sendingSound: selectSound })}>Submit</Button>
                    </AccordionItem>
                </Accordion>
            </div>
            <Separator className='mt-2' />
            <div className='flex justify-between items-center relative'>
                <div className='flex flex-col'>
                    <p>Mode Mute</p>
                    <p className='text-muted-foreground text-xs'>
                        {session?.currentUser.muted ? "Muted" : "UnMuted"}
                    </p>
                </div>
                <Switch
                    className='bg-blue-500'
                    checked={session?.currentUser.muted}
                    onCheckedChange={() => mutate({ muted: !session?.currentUser.muted })}
                    disabled={isPending}
                />
            </div>
        </>
    )
}

export default NotificationForm


interface IPayload {
    notificationSound?: string,
    sendingSound?: string,
    muted?: boolean
}