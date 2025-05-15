import DangerZoneFrom from '@/components/forms/dangerZoneFrom'
import EmailForm from '@/components/forms/emailForm'
import InformationForm from '@/components/forms/informationForm'
import NotificationForm from '@/components/forms/notificationForm'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { api } from '@/http/axios'
import { generateToken } from '@/lib/generate-token'
import { UploadButton } from '@/lib/uploadthing'
import { useMutation } from '@tanstack/react-query'
import { LogIn, Menu, Moon, Settings2, Sun, Upload, UserPlus, Volume2, VolumeX } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import React, { useState } from 'react'
import { toast } from 'sonner'
import "@uploadthing/react/styles.css";

interface IPayload {
    muted?: boolean,
    avatar?: string
}

const Setting = () => {
    const [profileOpen, setProfileOpen] = useState<boolean>(false)
    const { setTheme, resolvedTheme } = useTheme()
    const { data: session, update } = useSession()

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
        }
    })
    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button size={'icon'} variant={'secondary'} className='max-md:w-full'>
                        <Menu size={30} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0 w-80'>
                    <h2 className='pt-2 pl-2 text-muted-foreground text-sm'>
                        Settings: <span>{session?.currentUser.email}</span>
                    </h2>
                    <Separator className='my-2' />
                    <div className='flex flex-col'>
                        <div className='flex justify-between items-center p-2 hover:bg-[var(--secondary)] cursor-pointer' onClick={() => setProfileOpen(true)}>
                            <div className='flex items-center gap-1'>
                                <Settings2 size={16} />
                                <span className='text-sm'>Profile</span>
                            </div>
                        </div>

                        <div className='flex justify-between items-center p-2 hover:bg-[var(--secondary)] cursor-pointer'>
                            <div className='flex items-center gap-1'>
                                <UserPlus size={16} />
                                <span className='text-sm'>Create Contact</span>
                            </div>
                        </div>

                        <div className='flex justify-between items-center p-2 hover:bg-[var(--secondary)] cursor-pointer'>
                            <div className='flex items-center gap-1'>
                                {session?.currentUser.muted ?
                                    <Volume2 size={16} />
                                    : <VolumeX size={16} />
                                }
                                <span className='text-sm'>Mute</span>
                            </div>
                            <Switch
                                checked={session?.currentUser.muted}
                                id="airplane-mode"
                                className='bg-primary'
                                onCheckedChange={() => mutate({ muted: !session?.currentUser.muted })}
                                disabled={isPending}
                            />
                        </div>

                        <div className='flex justify-between items-center p-2 hover:bg-[var(--secondary)] cursor-pointer'>
                            <div className='flex items-center gap-1'>
                                {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                                <span className='text-sm'>
                                    {resolvedTheme == "dark" ? "Light Mode" : "Dark Mode"}
                                </span>
                            </div>
                            <Switch
                                checked={resolvedTheme === 'dark' ? true : false}
                                onCheckedChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                className='bg-primary'
                            />
                        </div>
                        <div className='flex justify-between items-center p-2 bg-destructive cursor-pointer' onClick={() => signOut()}>
                            <div className='flex items-center gap-1'>
                                <LogIn size={16} />
                                <span className='text-sm'>Logout</span>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetContent side='left' className='w-80 p-2 overflow-y-scroll sidebar-custom-scrollbar'>
                    <SheetHeader>
                        <SheetTitle className='text-2xl'>My Profile</SheetTitle>
                        <SheetDescription>
                            Setting up your profiles will help you connect with your friends and family easily
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className='my-2' />
                    <div className='mx-auto w-1/2 h-36 relative'>
                        <Avatar className='w-full h-36'>
                            <AvatarImage src={session?.currentUser.avatar} alt={session?.currentUser.email} className='object-cover' />
                            <AvatarFallback className='text-6xl uppercase' >
                                {session?.currentUser.email[0]}
                            </AvatarFallback>
                        </Avatar>
                        <UploadButton
                            endpoint={"imageUploder"}
                            onClientUploadComplete={res => {
                                mutate({ avatar: res[0].url })
                            }}
                            config={{ appendOnPaste: true, mode: "auto" }}
                            className='absolute right-0 bottom-0'
                            appearance={{ allowedContent: { display: "none" }, button: { width: "40px", height: "40px", borderRadius: "100%" } }}
                            content={{ button: <Upload size={16} /> }}
                        />
                    </div>
                    <Accordion type="single" collapsible className='mt-4 flex flex-col gap-2 border-none'>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className='border-none bg-secondary px-2'>Basic information</AccordionTrigger>
                            <AccordionContent className='px-2 mt-2'>
                                <InformationForm />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className='border-none  bg-secondary px-2'>Email</AccordionTrigger>
                            <AccordionContent className='px-2 mt-2'>
                                <EmailForm />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className='border-none bg-secondary px-2'>Notification</AccordionTrigger>
                            <AccordionContent className='px-2 mt-2'>
                                <NotificationForm />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className='bg-secondary px-2'>Danger Zone</AccordionTrigger>
                            <AccordionContent className='px-2 mt-2'>
                                <DangerZoneFrom />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </SheetContent>
            </Sheet >
        </>
    )
}

export default Setting
