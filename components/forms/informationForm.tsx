import { profileSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/http/axios'
import { IError } from '@/types'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { generateToken } from '@/lib/generate-token'

const InformationForm = () => {
    const { data: session, update } = useSession()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: { firstName: session?.currentUser?.firstName, lastName: session?.currentUser?.lastName, bio: session?.currentUser?.bio }
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (payload: z.infer<typeof profileSchema>) => {
            const token = await generateToken(session?.currentUser._id)
            console.log(token, 'token');
            const { data } = await api.put(
                "/api/v1/user/profile/",
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            return data
        },
        onSuccess: () => {
            toast("Profile update successfully")
            update()
        },
    })

    const onSubmit = (data: z.infer<typeof profileSchema>) => {
        mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
                <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                        <FormItem>
                            <Label>First Name</Label>
                            <FormControl>
                                <Input placeholder='First Name' className='bg-secondary' {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage className='text-xs text-red-500' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                        <FormItem>
                            <Label>First Name</Label>
                            <FormControl>
                                <Input placeholder='Last Name' className='bg-secondary' {...field} disabled={isPending} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                        <FormItem>
                            <Label>First Name</Label>
                            <FormControl>
                                <Textarea placeholder='Enter anything about yourself' className='bg-secondary' {...field} disabled={isPending} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type='submit' className='w-full' disabled={isPending}>Submit</Button>
            </form>
        </Form>
    )
}

export default InformationForm
