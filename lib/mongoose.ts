import mongoose, { ConnectOptions } from "mongoose"

let isConnected: boolean = false

export const connectToDatabase = async () => {
    mongoose.set('strictQuery', true)

    if (!process.env.NEXT_PUBLIC_MONGOOSE_URL) {
        return console.error("MONGO_URL is not defined");
    }

    if (isConnected) {
        return
    }

    try {
        const option: ConnectOptions = { autoCreate: true }
        await mongoose.connect(process.env.NEXT_PUBLIC_MONGOOSE_URL, option)
        isConnected = true
    } catch (error) {
        console.log(error);
    }
}