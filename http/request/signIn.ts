import { useMutation } from "@tanstack/react-query"
import { api } from "../axios"
import { toast } from "sonner"
import { IUser } from "@/types"

export const SignInApi = (
    onSuccessCallback: (email: string) => void
) => {
    return useMutation({
        mutationFn: async (email: string) => {
            const { data } = await api.post<{ email: string }>("/api/v1/auth/login/", { email })
            return data
        },
        onSuccess: res => {
            toast('Email sent')
            onSuccessCallback(res.email)
        },
    })
}

interface VerifyPayload {
    email: string,
    otp: string
}

export const VerifyApi = (
    onSuccesCalback: (user: IUser) => void
) => {
    return useMutation({
        mutationFn: async (payload: VerifyPayload) => {
            const {email, otp} = payload
            const { data } = await api.post<{ user: IUser }>("/api/v1/auth/verify/", { email, otp })
            return data
        },
        onSuccess: ({ user }) => {
            toast("Successfult verifired")
            onSuccesCalback(user)
        }
    })
}