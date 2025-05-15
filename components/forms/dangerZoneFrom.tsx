import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { confirmTextSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '../ui/separator'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useMutation } from '@tanstack/react-query'
import { signOut, useSession } from 'next-auth/react'
import { generateToken } from '@/lib/generate-token'
import { api } from '@/http/axios'

const DangerZoneFrom = () => {
    const { data: session } = useSession()

    const form = useForm<z.infer<typeof confirmTextSchema>>({
        resolver: zodResolver(confirmTextSchema),
        defaultValues: { confirmText: "" }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.delete(
                "/api/v1/user/",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            return data
        },
        onSuccess: () => {
            signOut()
        }
    })

    const onSubmit = () => {
        mutate()
    }

    return (
        <>
            <p className='text-xs text-muted-foreground text-center'>
                Are you sure you want to delete you account? This action cannot be undone
            </p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className='mt-2 w-full font-bold' variant={"destructive"}>
                        Delete permenantly
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-2'
                        >
                            <FormField
                                control={form.control}
                                name='confirmText'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormDescription>
                                            Please type <span className='font-bold'>Delete</span> to confirm
                                        </FormDescription>
                                        <FormControl>
                                            <Input className='bg-secondary' {...field} disabled={isPending} />
                                        </FormControl>
                                        <FormMessage className='text-xs text-red-500' />
                                    </FormItem>
                                )}
                            />
                            <Button className='w-full font-bold' disabled={isPending}>Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

        </>
    )
}

export default DangerZoneFrom
