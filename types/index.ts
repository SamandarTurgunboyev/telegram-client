export interface IUser {
    email: string,
    _id: string,
    avatar?: string
    lastName?: string,
    firstName?: string,
    bio?: string,
    isVerifed: boolean,
    muted: boolean,
    notificationSound: String,
    sendingSound: String,
    contacts: IUser[],
    lastMessage: IMessage | null
}

export interface IError extends Error {
    response: { data: { messsage: string } }
}

export interface IMessage {
    _id: string,
    text: string,
    image: string,
    reaction: string,
    sender: IUser,
    receiver: IUser,
    createdAt: string,
    updatedAt: string,
    satus: string
}