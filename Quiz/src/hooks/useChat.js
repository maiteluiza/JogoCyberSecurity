import { useEffect, useState, useRef } from 'react'
import { subscribeToChats, sendChat as fbSendChat } from '../firebase'

export default function useChat(roomId) {
  const [messages, setMessages] = useState([])
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      setMessages([])
      return
    }
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = subscribeToChats(roomId, list => setMessages(list))
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [roomId])

  const send = (text, senderId, senderName, type = 'global') => {
    return fbSendChat(roomId, { text, senderId, senderName, type })
  }

  return { messages, send }
}
