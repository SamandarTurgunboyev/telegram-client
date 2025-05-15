import { IMessage, IUser } from '@/types'
import { create } from 'zustand'

type Store = {
    currentContact: IUser | null,
    setCurrentContact: (contact: IUser) => void,
    message: IMessage | null,
    setMessage: (message: IMessage | null) => void
}

export const useCorrentContact = create<Store>()((set) => ({
    currentContact: null,
    setCurrentContact: contact => set({ currentContact: contact }),
    setMessage: message => set({ message: message }),
    message: null
}))