import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  initFirebase,
  createRoom,
  addPlayerToRoom,
  getRoom,
  updateRoomField,
  updatePlayer,
  isInitialized
} from './firebase'
import useRoom from './hooks/useRoom'
import usePlayers from './hooks/usePlayers'
import useChat from './hooks/useChat'
import { getPlayers } from './firebase'

const GameContext = createContext(null)

const initialState = {
  players: [],
  currentPhase: 'chat',
  timer: 30,
  votingActive: false,
  chats: {
    global: [],
    hackers: []
  },
  history: []
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(initialState)
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [gameWinner, setGameWinner] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [userId, setUserId] = useState(null)
  const roomMeta = useRoom(roomId)
  const [toast, setToast] = useState(null)
  const playersRef = useRef([])
  const chatRef = useRef([])

  const players = usePlayers(roomId)
  const { messages, send } = useChat(roomId)

  useEffect(() => {
    // show global modal when room signals game over
    if (roomMeta && roomMeta.gameOver) {
      setGameWinner(roomMeta.winner)
      setShowGameOverModal(true)
    } else if (roomMeta && !roomMeta.gameOver) {
      setShowGameOverModal(false)
      setGameWinner(null)
    }

    // local timer kept in sync with roomMeta.endTime
    if (!roomMeta || !roomMeta.endTime || !roomMeta.roundActive) {
      setGameState(prev => ({ ...prev, votingActive: false, timer: 30 }))
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((roomMeta.endTime - Date.now()) / 1000))
      setGameState(prev => ({ ...prev, votingActive: roomMeta.roundActive, currentPhase: roomMeta.phase || 'chat', timer: remaining }))
      if (remaining === 0 && roomMeta.roundActive) {
        finishVoting()
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [roomMeta])

  useEffect(() => {
    // sync players from hook into gameState
    if (players && players.length >= 0) {
      setGameState(prev => ({ ...prev, players }))
    }
  }, [players])

  useEffect(() => {
    // sync chats from hook into gameState
    if (messages) {
      setGameState(prev => ({ ...prev, chats: { ...prev.chats, global: messages } }))
    }
  }, [messages])

  useEffect(() => {
    // initialize firebase if env provided (Vite: import.meta.env)
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    if (apiKey) {
      initFirebase({
        apiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      })
    }
  }, [])

  async function addPlayer(name, asHost = false, roomCode = '') {
    const newPlayer = { name, role: asHost ? 'host' : null, alive: true, protected: false, vote: null, isHost: asHost }
    if (roomId) {
      const docRef = await addPlayerToRoom(roomId, newPlayer)
      setUserId(docRef.id)
      return docRef.id
    }
    const id = Date.now() + Math.random()
    setGameState(prev => ({
      ...prev,
      players: [
        ...prev.players,
        { id, ...newPlayer }
      ]
    }))
    return id
  }

  function assignRoles(random = true) {
    // assign roles by updating each player doc when in a room
    if (!roomId) {
      setGameState(prev => {
        const players = prev.players.map(p => ({ ...p, role: p.role === 'host' ? 'host' : 'player' }))
        return { ...prev, players }
      })
      return
    }
    // when in a room, distribute roles server-side by updating player docs
    const nonHost = gameState.players.filter(p => !p.isHost)
    const totalPlayers = nonHost.length
    let hackerCount = 1
    if (totalPlayers > 5) hackerCount = 2

    // shuffle shallow copy
    const shuffled = [...nonHost].sort(() => Math.random() - 0.5)
    const hackers = shuffled.slice(0, hackerCount)
    const updates = []
    nonHost.forEach(p => {
      const role = hackers.find(h => h.id === p.id) ? 'hacker' : 'investigator'
      updates.push(updatePlayer(roomId, p.id, { role, alive: true, vote: null }))
    })
    // reset room game flags
    updates.push(updateRoomField(roomId, { gameOver: false, winner: null, phase: 'chat', roundActive: false, endTime: null }))
    Promise.all(updates).catch(err => console.error('assignRoles update failed', err))
  }

  function startVoting(phase) {
    const duration = 30 * 1000
    if (roomId) {
      const end = Date.now() + duration
      updateRoomField(roomId, { phase, endTime: end, roundActive: true })
      // announce to chat that round started
      sendChat(`Rodada iniciada: ${phase}`, 'system', 'Sistema')
      return
    }
    setGameState(prev => ({ ...prev, currentPhase: phase, votingActive: true, timer: 30 }))
    sendChat(`Rodada iniciada: ${phase}`, 'system', 'Sistema')
  }

  async function castVote(playerId, targetId) {
    if (!roomId) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === playerId ? { ...p, vote: targetId } : p)
      }))
      return
    }
    // persist vote on player's own doc
    await updatePlayer(roomId, playerId, { vote: targetId })
  }

  async function finishVoting() {
    // finalize voting when endTime reached; only host should write final result
    if (!roomId) {
      // fallback local logic
      setGameState(prev => {
        const tally = {}
        prev.players.forEach(p => {
          if (p.vote && p.alive) tally[p.vote] = (tally[p.vote] || 0) + 1
        })
        let maxVotes = 0
        let winner = null
        Object.keys(tally).forEach(k => { if (tally[k] > maxVotes) { maxVotes = tally[k]; winner = k } })
        const players = prev.players.map(p => (p.id && winner && p.id.toString() === winner.toString()) ? { ...p, alive: false } : p)
        const reset = players.map(p => ({ ...p, vote: null }))
        const playersAfter = reset
        // compute victory locally
        const alivePlayers = playersAfter.filter(p => p.alive)
        const aliveHackers = alivePlayers.filter(p => p.role === 'hacker')
        const aliveNonHackers = alivePlayers.filter(p => p.role !== 'hacker')
        if (aliveHackers.length === 0) {
          setGameWinner('investigators')
          setShowGameOverModal(true)
        } else if (aliveHackers.length >= aliveNonHackers.length) {
          setGameWinner('hackers')
          setShowGameOverModal(true)
        }
        // announce results and save history locally
        if (winner) {
          sendChat(`Rodada finalizada. Eliminado: ${players.find(p=>p.id && p.id.toString()===winner.toString())?.name || 'Desconhecido'}`, 'system', 'Sistema')
          const roundEntry = `Rodada: Eliminado: ${players.find(p=>p.id && p.id.toString()===winner.toString())?.name || 'Ninguém'}`
          setGameState(prev2 => ({ ...prev2, history: [...(prev2.history||[]), roundEntry] }))
        } else {
          sendChat('Rodada finalizada. Ninguém eliminado.', 'system', 'Sistema')
          setGameState(prev2 => ({ ...prev2, history: [...(prev2.history||[]), 'Rodada: Ninguém eliminado'] }))
        }
        return { ...prev, players: reset, currentPhase: 'chat', votingActive: false, timer: 30 }
      })
      return
    }

    // only host performs tally and updates players
    const me = gameState.players.find(p => p.id === userId)
    if (!me || !me.isHost) return

    // fetch latest players snapshot from Firestore to ensure consistent tally
    let latestPlayers = gameState.players
    try {
      const fetched = await getPlayers(roomId)
      if (fetched && fetched.length) latestPlayers = fetched
    } catch (e) {
      console.warn('Could not fetch latest players, falling back to local state', e)
    }

    // tally based on latestPlayers
    const tally = {}
    latestPlayers.forEach(p => {
      if (p.vote && p.alive) tally[p.vote] = (tally[p.vote] || 0) + 1
    })

    let maxVotes = 0
    Object.keys(tally).forEach(k => { if (tally[k] > maxVotes) { maxVotes = tally[k] } })
    // find all with maxVotes (tie detection)
    const top = Object.keys(tally).filter(k => tally[k] === maxVotes)
    const eliminatedId = (top.length === 1 && maxVotes > 0) ? top[0] : null

    // apply elimination and reset votes using latestPlayers to ensure doc ids match
    const updates = []
    latestPlayers.forEach(p => {
      if (eliminatedId && p.id && p.id.toString() === eliminatedId.toString()) {
        updates.push(updatePlayer(roomId, p.id, { alive: false }))
      }
      // reset vote for all players
      updates.push(updatePlayer(roomId, p.id, { vote: null }))
    })

    // apply updates and clear room round
    await Promise.all(updates).catch(err => console.error('finishVoting updates failed', err))
    await updateRoomField(roomId, { phase: 'chat', roundActive: false, endTime: null })

    // compute victory conditions using latestPlayers after applying elimination
    const playersAfter = latestPlayers.map(p => ({ ...p, alive: (eliminatedId && p.id && p.id.toString() === eliminatedId.toString()) ? false : p.alive }))
    const alivePlayers = playersAfter.filter(p => p.alive)
    const aliveHackers = alivePlayers.filter(p => p.role === 'hacker')
    const aliveNonHackers = alivePlayers.filter(p => p.role !== 'hacker')

    if (aliveHackers.length === 0) {
      await updateRoomField(roomId, { gameOver: true, winner: 'investigators' })
      sendChat('Investigadores venceram.', 'system', 'Sistema')
    } else if (aliveHackers.length >= aliveNonHackers.length) {
      await updateRoomField(roomId, { gameOver: true, winner: 'hackers' })
      sendChat('Hackers venceram.', 'system', 'Sistema')
    }
    // announce elimination result to chat and save to local state history
    if (eliminatedId) {
      const eliminated = latestPlayers.find(p=>p.id && p.id.toString()===eliminatedId.toString())
      sendChat(`Rodada finalizada. Eliminado: ${eliminated?.name || 'Desconhecido'}`, 'system', 'Sistema')
      setGameState(prev2 => ({ ...prev2, history: [...(prev2.history||[]), `Rodada: ${eliminated?.name || 'Ninguém'}`] }))
    } else {
      sendChat('Rodada finalizada. Ninguém eliminado.', 'system', 'Sistema')
      setGameState(prev2 => ({ ...prev2, history: [...(prev2.history||[]), 'Rodada: Ninguém eliminado'] }))
    }
  }

  function sendChat(message, fromId, fromName, type = 'global') {
    if (roomId) {
      return send(message, fromId, fromName, type)
    }
    setGameState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        global: [...prev.chats.global, { id: Date.now(), senderName: fromName || 'Anon', text: message, type }]
      }
    }))
    return Promise.resolve()
  }

  function showNotification(type, text, timeout = 3000) {
    setToast({ type, text })
    setTimeout(() => setToast(null), timeout)
  }

  function showSuccess(text, timeout) { showNotification('success', text, timeout) }
  function showError(text, timeout) { showNotification('error', text, timeout) }

  // room helpers
  async function createRoomLocal(code) {
    const id = code || Math.random().toString(36).slice(2, 8).toUpperCase()
    // If Firebase not configured, create a local ephemeral room
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      const localHostId = Date.now() + Math.random()
      setRoomId(id)
      setUserId(localHostId)
      setGameState(prev => ({
        ...prev,
        players: [{ id: localHostId, name: 'Host', role: 'host', alive: true, protected: false, vote: null, isHost: true }, ...prev.players]
      }))
      return id
    }
    // ensure firebase actually initialized; try to init synchronously if possible
    if (!isInitialized()) {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (apiKey) {
        initFirebase({
          apiKey,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        })
      }
      if (!isInitialized()) {
        throw new Error('Firebase SDK não inicializado. Verifique as variáveis VITE_FIREBASE_* e reinicie o dev server.')
      }
    }

    // create empty room in Firestore — hooks will subscribe automatically when roomId set
    const created = await createRoom(id, {})
    if (!created) throw new Error('Falha ao criar sala no Firestore (verifique console para detalhes)')
    setRoomId(id)
    // add host as player and set hostId
    const hostDoc = await addPlayerToRoom(id, { name: 'Host', role: 'host', alive: true, protected: false, vote: null, isHost: true })
    setUserId(hostDoc.id)
    await updateRoomField(id, { hostId: hostDoc.id, gameOver: false, winner: null })
    return id
  }

  async function joinRoomLocal(code, name) {
    // ensure firebase initialized if app is configured
    if (!isInitialized()) {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (apiKey) {
        initFirebase({
          apiKey,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        })
      }
      if (!isInitialized()) {
        throw new Error('Firebase SDK não inicializado. Verifique as variáveis VITE_FIREBASE_* e reinicie o dev server.')
      }
    }

    // if firebase not configured, join a local ephemeral room (single-tab)
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      const localId = Date.now() + Math.random()
      setRoomId(code)
      setUserId(localId)
      setGameState(prev => ({ ...prev, players: [...prev.players, { id: localId, name, role: null, alive: true, protected: false, vote: null, isHost: false }] }))
      return localId
    }

    const r = await getRoom(code)
    if (!r) {
      console.error('joinRoomLocal: room not found', code)
      throw new Error('ROOM_NOT_FOUND')
    }
    setRoomId(code)
    // add player (catch errors to avoid unhandled rejections)
    try {
      const p = await addPlayerToRoom(code, { name, role: null, alive: true, protected: false, vote: null, isHost: false })
      if (!p) {
        console.error('joinRoomLocal: addPlayerToRoom returned null', code)
        throw new Error('ADD_FAILED')
      }
      setUserId(p.id)
      return p.id
    } catch (err) {
      console.error('joinRoomLocal: failed to add player', err)
      throw err
    }
  }


  function toggleProtect(playerId) {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, protected: !p.protected } : p)
    }))
  }

  function resetGame() {
    if (!roomId) {
      setGameState(initialState)
      return
    }
    // reset room fields and all players in firebase
    updateRoomField(roomId, { gameOver: false, winner: null, phase: 'chat', roundActive: false, endTime: null }).catch(err => console.error(err))
    gameState.players.forEach(p => {
      updatePlayer(roomId, p.id, { alive: true, vote: null, role: null, protected: false }).catch(err => console.error(err))
    })
  }

  const currentPlayer = gameState.players.find(p => p.id === userId) || null
  const isGameOver = roomMeta?.gameOver || false
  return (
    <GameContext.Provider value={{ gameState, roomMeta, roomId, userId, currentPlayer, addPlayer, assignRoles, startVoting, castVote, sendChat, toggleProtect, resetGame, createRoom: createRoomLocal, joinRoom: joinRoomLocal, showSuccess, showError }}>
      {children}
      {showGameOverModal && (
        <div className="game-over-modal">
          <div className="modal-card">
            <h2>{gameWinner === 'hackers' ? 'Hackers Venceram' : 'Investigadores Venceram'}</h2>
            <p className="modal-sub">
              {(currentPlayer && ((gameWinner === 'hackers' && currentPlayer.role === 'hacker') || (gameWinner === 'investigators' && currentPlayer.role !== 'hacker'))) ? 'VOCÊS VENCERAM' : 'VOCÊS PERDERAM'}
            </p>
            <div className="modal-actions">
              {currentPlayer && currentPlayer.isHost && <button onClick={() => { resetGame(); setShowGameOverModal(false); }}>Reiniciar Jogo</button>}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
