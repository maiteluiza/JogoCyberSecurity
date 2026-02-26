import { useEffect, useState, useRef } from 'react'
import { subscribeToRoom, getRoom } from '../firebase'

export default function useRoom(roomId) {
  const [room, setRoom] = useState(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      setRoom(null)
      return
    }
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = subscribeToRoom(roomId, r => setRoom(r))
    // fire-and-forget initial fetch to ensure state available quickly
    getRoom(roomId).then(r => { if (r) setRoom(r) }).catch(() => {})
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [roomId])

  return room
}
