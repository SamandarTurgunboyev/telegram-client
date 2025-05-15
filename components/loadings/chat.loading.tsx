import React from 'react'
import MessageLoading from './message.loading'

const ChatLoading = () => {
    return (
        <>
            <MessageLoading isReceived={true} />
            <MessageLoading isReceived={true} />
            <MessageLoading isReceived={true} />
            <MessageLoading isReceived={false} />
            <MessageLoading isReceived={false} />
            <MessageLoading isReceived={true} />
            <MessageLoading isReceived={false} />
            <MessageLoading isReceived={false} />
            <MessageLoading isReceived={true} />
            <MessageLoading isReceived={false} />
        </>
    )
}

export default ChatLoading
