import { oldEmailSchame, otpSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useMutation } from '@tanstack/react-query'
import { generateToken } from '@/lib/generate-token'
import { signOut, useSession } from 'next-auth/react'
import { api } from '@/http/axios'
import { toast } from 'sonner'
import { IError } from '@/types'

const EmailForm = () => {
    const [verify, setVerify] = useState(false)
    const { data: session } = useSession()

    const form = useForm<z.infer<typeof oldEmailSchame>>({
        resolver: zodResolver(oldEmailSchame),
        defaultValues: { email: "", oldEmail: session?.currentUser.email }
    })

    const otpFrom = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { email: "", otp: "" }
    })

    const otpMutation = useMutation({
        mutationFn: async (email: string) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.post<{ email: string }>("/api/v1/user/send-otp/", { email }, { headers: { Authorization: `Bearer ${token}` } })
            return data
        },
        onSuccess: ({ email }) => {
            toast("Otp sent to your email")
            otpFrom.setValue("email", email)
            setVerify(true)
        }
    })

    const onEmailSubmit = (data: z.infer<typeof oldEmailSchame>) => {
        otpMutation.mutate(data.email)
    }
    const verifyMutation = useMutation({
        mutationFn: async (otp: string) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.put<{ otp: string }>(
                "/api/v1/user/email/",
                { email: otpFrom.getValues("email"), otp },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            return data
        },
        onSuccess: () => {
            toast("Email update successfully")
            signOut()
        }
    })

    const onOtpSubmit = (data: z.infer<typeof otpSchema>) => {
        verifyMutation.mutate(data.otp)
    }

    return verify ? (
        <Form {...otpFrom}>
            <form onSubmit={otpFrom.handleSubmit(onOtpSubmit)} className='space-y-2'>
                <Label>New Email:</Label>
                <Input className='bg-secondary' disabled value={form.watch("email")} />
                <FormField
                    control={otpFrom.control}
                    name='otp'
                    render={({ field }) => (
                        <FormItem>
                            <Label>One-Time Password</Label>
                            <FormControl>
                                <InputOTP maxLength={6} className='w-full' pattern={REGEXP_ONLY_DIGITS} {...field} disabled={verifyMutation.isPending}>
                                    <InputOTPGroup className='w-full '>
                                        <InputOTPSlot index={0} className='w-full dark:bg-primary-foreground bg-secondary' />
                                        <InputOTPSlot index={1} className='w-full dark:bg-primary-foreground bg-secondary' />
                                        <InputOTPSlot index={2} className='w-full dark:bg-primary-foreground bg-secondary' />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup className='w-full '>
                                        <InputOTPSlot index={3} className='w-full dark:bg-primary-foreground bg-secondary' />
                                        <InputOTPSlot index={4} className='w-full dark:bg-primary-foreground bg-secondary' />
                                        <InputOTPSlot index={5} className='w-full dark:bg-primary-foreground bg-secondary' />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage className='text-xs text-red-500' />
                        </FormItem>
                    )}
                />
                <Button type='submit' className='w-full bg-blue-500' size={'lg'} disabled={verifyMutation.isPending}>
                    Submit
                </Button>
            </form>
        </Form>
    ) : (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmailSubmit)} className='space-y-2'>
                <FormField
                    control={form.control}
                    name='oldEmail'
                    render={({ field }) => (
                        <FormItem>
                            <Label>Current email</Label>
                            <FormControl>
                                <Input className='bg-secondary' disabled {...field} />
                            </FormControl>
                            <FormMessage className='text-xs text-red-500' />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem>
                            <Label>Enter a new email</Label>
                            <FormControl>
                                <Input className='bg-secondary' {...field} disabled={otpMutation.isPending} />
                            </FormControl>
                            <FormMessage className='text-xs text-red-500' />
                        </FormItem>
                    )}
                />
                <Button type='submit' className='w-full cursor-pointer' disabled={otpMutation.isPending}>
                    Verify
                </Button>
            </form>
        </Form>
    )
}

export default EmailForm
