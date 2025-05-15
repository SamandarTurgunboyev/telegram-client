import MessageCard from '@/components/cards/message.card'
import ChatLoading from '@/components/loadings/chat.loading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { messageSchema } from '@/lib/validation'
import { Paperclip, Send, Smile } from 'lucide-react'
import React, { ChangeEvent, FC, useEffect, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import emojies from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTheme } from 'next-themes'
import { useLoading } from '@/hook/use-loading'
import { IMessage } from '@/types'
import { useCorrentContact } from '@/hook/use-current'
import { UploadButton } from '@/lib/uploadthing'

interface Props {
    messageForm: UseFormReturn<z.infer<typeof messageSchema>>
    onSendMessage: (values: z.infer<typeof messageSchema>) => void,
    onReadMessages: () => Promise<void>,
    messages: IMessage[]
    onReaction: (reaction: string, messageId: string) => Promise<void>
    onDeleteMessage: (messageId: string) => Promise<void>
    onTyping: (e: ChangeEvent<HTMLInputElement>) => void
}

const Chat: FC<Props> = ({ messageForm, onSendMessage, messages, onReadMessages, onReaction, onDeleteMessage, onTyping }) => {
    const { laodMessage } = useLoading()
    const { resolvedTheme } = useTheme()
    const scrollRef = useRef<HTMLFormElement | null>(null)

    const { message, setMessage } = useCorrentContact()

    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        onReadMessages()
    }, [messages])

    useEffect(() => {
        if (message) {
            messageForm.setValue("text", message.text)
            scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [message])

    const handleEmojiSelect = (emoji: string) => {
        const input = inputRef.current
        if (!input) return
        const text = messageForm.getValues('text')
        const start = input.selectionStart ?? 0
        const end = input.selectionEnd ?? 0

        const newText = text.slice(0, start) + emoji + text.slice(end)
        messageForm.setValue("text", newText)

        setTimeout(() => {
            input.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0);
    }
    return (
        <div className='flex flex-col justify-end z-40 min-h-[92vh]'>
            {/* Loading */}
            {laodMessage &&
                <ChatLoading />
            }
            {/* Message */}
            {messages.map((message) => (
                <MessageCard
                    isReceived
                    message={message}
                    key={message._id}
                    onReaction={onReaction}
                    onDeleteMessage={onDeleteMessage}
                />
            ))}
            {/* Message Input */}

            {/* Start chat */}
            {messages.length === 0 &&
                <div className='w-full h-[88vh] flex items-center justify-center'>
                    <div className='text-[50px] cursor-pointer' onClick={() => onSendMessage({ text: "🖐" })}>🖐</div>
                </div>
            }

            <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(onSendMessage)} className='w-full flex relative' ref={scrollRef}>
                    <UploadButton
                        endpoint={"imageUploder"}
                        onClientUploadComplete={res => {
                            onSendMessage({ text: "", image: res[0].url })
                            
                        }}
                        className='bg-none'
                        config={{ appendOnPaste: true, mode: "auto" }}
                        appearance={{ allowedContent: { display: "none" }, button: { width: "40px", height: "35px", } }}
                        content={{ button: <Paperclip size={16} /> }}
                    />
                    {/* <Button size={"icon"} type='button' variant={"secondary"}>
                        <Paperclip />
                    </Button> */}
                    <FormField
                        control={messageForm.control}
                        name='text'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <Input
                                        className='resize-none h-9'
                                        value={field.value}
                                        onBlur={() => field.onBlur()}
                                        placeholder='Type a message'
                                        onChange={(e) => {
                                            field.onChange(e.target.value)
                                            onTyping(e)
                                            if (e.target.value === "") setMessage(null)
                                        }}
                                        ref={inputRef}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button size={"icon"} type='button' variant={"secondary"}>
                                <Smile />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0 border-none rounded-md absolute right-6 bottom-0'>
                            <Picker
                                data={emojies}
                                theme={resolvedTheme === "dark" ? "dark" : "light"}
                                onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(emoji.native)}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button type='submit' size={"icon"}>
                        <Send />
                    </Button>
                </form>
            </Form>
        </div >
    )
}

export default Chat
