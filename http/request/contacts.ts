// hooks/use-get-contacts.ts
import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "../axios"
import { IUser } from "@/types"
import { generateToken } from "@/lib/generate-token"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export const useGetContacts = () => {
    const { data: session } = useSession()

    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.get<{ contacts: IUser[] }>(
                '/api/v1/user/contacts/',
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data.contacts
        },
        enabled: !!session?.currentUser,
    })
}
