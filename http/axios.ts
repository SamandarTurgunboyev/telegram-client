import axios from 'axios'

export const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
})