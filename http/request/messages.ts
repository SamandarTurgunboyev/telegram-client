import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { api } from "../axios"
import { IMessage } from "@/types"
import { generateToken } from "@/lib/generate-token"
import { toast } from "sonner"

export const ReactionMsg = (
    onSuccessCallback: (updateMessage: IMessage) => void
) => {
    const { data: session } = useSession()
    return useMutation({
        mutationFn: async ({ reaction, messageId }: { reaction: string, messageId: string }) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.post<{ updateMessage: IMessage }>(
                "/api/v1/user/reaction",
                { reaction, messageId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data
        },
        onSuccess: res => {
            toast("Sent reaction")
            onSuccessCallback(res.updateMessage)
        }
    })
}

export const DeleteMsg = (
    onSuccessCallback: (deleteMessage: IMessage) => void
) => {
    const { data: session } = useSession()
    return useMutation({
        mutationFn: async (messageId: string) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.delete<{ deleteMessage: IMessage }>(
                `/api/v1/user/message/${messageId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data
        },
        onSuccess: res => {
            toast("Delete message")
            onSuccessCallback(res.deleteMessage)
        }
    })
}

export const EditMsg = (
    onSuccessCallback: (updateMessage: IMessage) => void
) => {
    const { data: session } = useSession()
    return useMutation({
        mutationFn: async ({ messageId, text }: { messageId: string, text: string }) => {
            const token = await generateToken(session?.currentUser._id)
            const { data } = await api.put<{ updateMessage: IMessage }>(
                `/api/v1/user/message/${messageId}`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            return data.updateMessage
        },
        onSuccess: res => {
            toast("Edit message successfuly")
            onSuccessCallback(res)
        }
    })
}