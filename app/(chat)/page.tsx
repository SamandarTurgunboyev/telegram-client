"use client"
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import ContactList from './components/contact-list'
import { useCorrentContact } from '@/hook/use-current'
import { useRouter, useSearchParams } from 'next/navigation'
import AddContact from './components/addContact'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { emailSchema, messageSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import TopChat from './components/topChat'
import Chat from './components/chat'
import { useLoading } from '@/hook/use-loading'
import { generateToken } from '@/lib/generate-token'
import { useSession } from 'next-auth/react'
import { api } from '@/http/axios'
import { IError, IMessage, IUser } from '@/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { io } from "socket.io-client"
import useAudio from '@/hook/use-audio'
import { CONST } from '@/lib/constants'
import { useGetContacts } from '@/http/request/contacts'
import { DeleteMsg, EditMsg, ReactionMsg } from '@/http/request/messages'

interface GetSoketType {
  sender: IUser,
  receiver: IUser,
  newMessage: IMessage
  updateMessage: IMessage
  deleteMessage: IMessage
  filteredMsg: IMessage[]
  message: string
}

const HomePage = () => {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<IUser[]>([])
  const [messages, setMessages] = useState<IMessage[]>([])
  const { setCreating, selOnlineUser, setLoadMessage, setIsTypeng } = useLoading()
  const { currentContact, message, setMessage } = useCorrentContact()
  const playSound = useAudio()
  const router = useRouter()
  const socket = useRef<ReturnType<typeof io> | null>(null)
  const searchParams = useSearchParams()
  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    },
  })

  const CONTACT_ID = searchParams.get("chat")

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      text: "",
      image: ""
    },
  })

  useEffect(() => {
    router.replace("/")
    socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL)
  }, [])

  const { data: myContacts, isPending: isLoading } = useGetContacts()

  useEffect(() => {
    if (myContacts) {
      setContacts(myContacts)
    }
  }, [myContacts])

  const getMessage = async () => {
    setLoadMessage(true)
    const token = await generateToken(session?.currentUser._id)
    try {
      const { data } = await api.get<{ message: IMessage[] }>(
        `/api/v1/user/message/${currentContact?._id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(data.message)
      setContacts(prev =>
        prev.map(item =>
          item._id === currentContact?._id ? { ...item, lastMessage: item.lastMessage ? { ...item.lastMessage, satus: CONST.READ } : null } : item
        )
      )
    } catch (error) {
      toast("Cannot get Message")
    } finally {
      setLoadMessage(false)
    }
  }

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!session?.currentUser || hasRunRef.current) return;
    hasRunRef.current = true;

    socket.current?.emit("addOnlineUser", session.currentUser);
    socket.current?.on("getOnlineUser", (data: { socket: string, user: IUser }[]) => {
      selOnlineUser(data.map(item => item.user))
    });
  }, [session?.currentUser]);

  useEffect(() => {
    if (session?.currentUser) {
      socket.current?.on("getCreatedUser", user => {
        setContacts(prev => {
          const isExist = prev.some(item => item._id === user._id)
          return isExist ? prev : [...prev, user]
        })
      })
      socket.current?.on("getNewMessage", ({ newMessage, receiver, sender }: GetSoketType) => {
        console.log("newMessage socket", newMessage);

        setIsTypeng("")
        if (CONTACT_ID === sender._id) {
          setMessages((prev) => [...prev, newMessage])
        }
        setContacts((prev) => {
          return prev.map(item => {
            if (item._id === sender._id) {
              return { ...item, lastMessage: { ...newMessage, satus: CONTACT_ID === sender._id ? CONST.READ : newMessage.satus } }
            }
            return item
          })
        })
        toast(`${sender.email.split("@")[0]} send you a message`)
        if (receiver.muted) {
          playSound(String(receiver.notificationSound))
        }
      })
      socket.current?.on("getReadMessage", (messages: IMessage[]) => {
        setMessages(prev => {
          return prev.map(item => {
            const message = messages.find(msg => msg._id === item._id)
            return message ? { ...item, satus: CONST.READ } : item
          })
        })
      })

      socket.current?.on("getUpdateMessage", ({ updateMessage, receiver, sender }: GetSoketType) => {
        setIsTypeng("")
        setMessages(prev => prev.map(item => item._id === updateMessage._id ? { ...item, reaction: updateMessage.reaction, text: updateMessage.text } : item))
        setContacts(prev => prev.map(item => item._id === sender._id ? { ...item, lastMessage: item.lastMessage?._id === updateMessage._id ? updateMessage : item.lastMessage } : item))
      })

      socket.current?.on("getDeleteMessage", ({ deleteMessage, receiver, sender, filteredMsg }: GetSoketType) => {
        const lastMessage = filteredMsg.length ? filteredMsg[filteredMsg.length - 1] : null
        setMessages(filteredMsg)
        setContacts(prev =>
          prev.map(item =>
            item._id === sender?._id ?
              { ...item, lastMessage: item.lastMessage?._id === deleteMessage._id ? lastMessage : item.lastMessage }
              : item
          ))
      })

      socket.current?.on("getTyping", ({ message, sender }: GetSoketType) => {
        if (CONTACT_ID === sender._id) {
          setIsTypeng(message)
        }
      })
    }
  }, [session?.currentUser, socket])

  useEffect(() => {
    if (currentContact) {
      getMessage()
    }
  }, [currentContact])

  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    setCreating(true)
    const token = await generateToken(session?.currentUser._id)
    try {
      const { data } = await api.post<{ contacts: IUser }>(
        "/api/v1/user/create-contact/",
        values,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setContacts(prev => [...prev, data.contacts])
      socket.current?.emit("createContact", { currentUser: session?.currentUser, receiver: data.contacts })
      toast("Contact added Successfully")
      contactForm.reset()
    } catch (error: any) {
      if ((error as IError).response?.data?.messsage) {
        return toast((error as IError).response.data.messsage)
      }
      return toast("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true)
    const token = await generateToken(session?.currentUser._id)
    try {
      const { data } = await api.post<GetSoketType>(
        "/api/v1/user/create-message/",
        { ...values, receiver: currentContact?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev => [...prev, data.newMessage])
      setContacts(prev => prev.map((item) => item._id === currentContact?._id ? { ...item, lastMessage: { ...data.newMessage, satus: CONST.READ } } : item))
      messageForm.reset()
      socket.current?.emit("newMessage", { newMessage: data.newMessage, receiver: data.receiver, sender: data.sender })
    } catch {
      return toast("Cannot send Message")
    } finally {
      setCreating(false)
    }
  }

  const onReadMessages = async () => {
    const receiverMessage = messages
      .filter(m => m.receiver._id === session?.currentUser._id)
      .filter(m => m.satus !== CONST.READ)

    if (receiverMessage.length === 0) return
    const token = await generateToken(session?.currentUser._id)
    try {
      const { data } = await api.post<{ messages: IMessage[] }>(
        "/api/v1/user/read-message/",
        { messages: receiverMessage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      socket.current?.emit("readMessage", { receiver: currentContact, messages: data.messages })
      setMessages(prev => {
        return prev.map(item => {
          const message = data.messages.find(msg => msg._id === item._id)
          return message ? { ...item, satus: CONST.READ } : item
        })
      })
    } catch (error) {
      toast("Cannot read messages")
    }
  }

  const { mutateAsync } = ReactionMsg((updateMessage) => {
    setMessages(prev => prev.map((item) => item._id === updateMessage._id ? { ...item, reaction: updateMessage.reaction } : item))
    socket.current?.emit('updateMessage', {
      updateMessage,
      receiver: currentContact,
      sender: session?.currentUser
    })
  })

  const { mutateAsync: deleteMsg } = DeleteMsg((deleteMessage) => {
    const filteredMsg = messages.filter((item) => item._id !== deleteMessage._id)
    const lastMessage = filteredMsg.length ? filteredMsg[filteredMsg.length - 1] : null
    setMessages(filteredMsg)
    setContacts(prev =>
      prev.map(item =>
        item._id === currentContact?._id ?
          { ...item, lastMessage: item.lastMessage?._id === deleteMessage._id ? lastMessage : item.lastMessage }
          : item
      ))
    socket.current?.emit("deleteMessage", {
      deleteMessage,
      receiver: currentContact,
      sender: session?.currentUser,
      filteredMsg
    })
  })

  const { mutateAsync: textMsg } = EditMsg((updateMessage) => {
    setMessages(prev =>
      prev.map(item => item._id === updateMessage._id ? { ...item, text: updateMessage.text } : item))
    socket.current?.emit('updateMessage', {
      updateMessage,
      receiver: currentContact,
      sender: session?.currentUser
    })
    messageForm.reset()
    setContacts(prev => prev.map(item => item._id === currentContact?._id ?
      { ...item, lastMessage: item.lastMessage?._id === updateMessage._id ? updateMessage : item.lastMessage }
      : item))
    setMessage(null)
  })

  const onReaction = async (reaction: string, messageId: string) => {
    await mutateAsync({ reaction, messageId })
  }

  const onDeleteMessage = async (messageId: string) => {
    await deleteMsg(messageId)
  }

  const onEditMessage = async (messageId: string, text: string) => {
    await textMsg({ messageId, text })
  }

  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setCreating(true)
    if (message?._id) {
      onEditMessage(message._id, values.text)
    } else {
      onSendMessage(values)
    }
  }

  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {
    socket.current?.emit("typing", { receiver: currentContact, sender: session?.currentUser, message: e.target.value })
  }

  return (
    <>
      {/* Sidebar */}
      <div className='w-80 max-md:w-16 h-screen border-r border-secondary fixed inset-0 z-50 overflow-y-scroll sidebar-custom-scrollbar'>

        {/* Loading */}
        {isLoading && (
          <div className='w-full h-[95vh] flex justify-center items-center absolute'>
            <Loader2 size={50} className='animate-spin' />
          </div>
        )}

        {/* contact list */}
        <ContactList contacts={contacts} />

        {/* Chat area */}
      </div>
      <div className='max-md:pl-16 pl-80 w-full'>

        {/* Add contact  */}
        {!currentContact?._id && <AddContact contactForm={contactForm} onCreateContact={onCreateContact} />}

        {/* Chat */}
        {currentContact?._id && (
          <div className='w-full relative'>
            {/* Top chat  */}
            <TopChat messages={messages} />

            {/* chat message */}
            <Chat
              messageForm={messageForm}
              onSendMessage={onSubmitMessage}
              messages={messages}
              onReadMessages={onReadMessages}
              onReaction={onReaction}
              onDeleteMessage={onDeleteMessage}
              onTyping={onTyping}
            />
          </div>
        )}
      </div>
    </>
  )
}

const contacts = [
  {
    email: "john1@gmail.com",
    _id: "1",
    avatar: "https://github.com/shadcn.png",
    firstName: "John",
    lastName: "Doe",
    bio: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam, ipsam."
  },
  { email: "john2@gmail.com", _id: "2" },
  { email: "john3@gmail.com", _id: "3" },
  { email: "john4@gmail.com", _id: "4" },
]

export default HomePage
