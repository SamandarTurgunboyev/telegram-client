import { IUser } from '@/types'
import { create } from 'zustand'

type Store = {
    isCreating: boolean,
    setCreating: (isCreating: boolean) => void,
    isLoading: boolean,
    setLoading: (isLoading: boolean) => void,
    onlineUser: IUser[],
    selOnlineUser: (users: IUser[]) => void,
    laodMessage: boolean,
    setLoadMessage: (laodMessage: boolean) => void,
    isTypeng: string,
    setIsTypeng: (isTypeng: string) => void
}

export const useLoading = create<Store>()((set) => ({
    isLoading: false,
    setLoading: isLoading => set({ isLoading }),
    isCreating: false,
    setCreating: isCreating => set({ isCreating }),
    onlineUser: [],
    selOnlineUser: users => set({ onlineUser: users }),
    laodMessage: false,
    setLoadMessage: laodMessage => set({ laodMessage }),
    isTypeng: "",
    setIsTypeng: isTypeng => set({ isTypeng })
}))