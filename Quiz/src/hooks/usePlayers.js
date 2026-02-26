import { useEffect, useState, useRef } from 'react'
import { subscribeToPlayers } from '../firebase'

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([])
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!roomId) {
      setPlayers([])
      return
    }
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = subscribeToPlayers(roomId, list => setPlayers(list))
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [roomId])

  return players
}
