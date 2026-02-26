import React, { createContext, useContext, useState, useEffect } from 'react'

const GameContext = createContext(null)

const initialState = {
  players: [],
  currentPhase: 'chat',
  timer: 30,
  votingActive: false,
  chats: {
    global: [],
    hackers: []
  }
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(initialState)
  const [timerId, setTimerId] = useState(null)

  useEffect(() => {
    if (gameState.votingActive && gameState.timer > 0) {
      const id = setTimeout(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer - 1 }))
      }, 1000)
      setTimerId(id)
    }
    if (!gameState.votingActive) {
      clearTimeout(timerId)
    }
    if (gameState.votingActive && gameState.timer === 0) {
      finishVoting()
    }
    return () => clearTimeout(timerId)
  }, [gameState.votingActive, gameState.timer])

  function addPlayer(name, asHost = false, roomCode = '') {
    setGameState(prev => ({
      ...prev,
      players: [
        ...prev.players,
        { id: Date.now() + Math.random(), name, role: asHost ? 'host' : null, alive: true, protected: false, vote: null }
      ]
    }))
  }

  function assignRoles(random = true) {
    // simple role assignment for MVP: 1 host already exists, then distribute roles: investigator, hacker, antivirus
    setGameState(prev => {
      const players = prev.players.map(p => ({ ...p, role: p.role === 'host' ? 'host' : 'player' }))
      const roles = ['investigator', 'hacker', 'antivirus']
      let i = 0
      for (let j = 0; j < players.length; j++) {
        if (players[j].role !== 'host') {
          players[j].role = roles[i % roles.length]
          i++
        }
      }
      return { ...prev, players }
    })
  }

  function startVoting(phase) {
    setGameState(prev => ({ ...prev, currentPhase: phase, votingActive: true, timer: 30 }))
  }

  function castVote(playerId, targetId) {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, vote: targetId } : p)
    }))
  }

  function finishVoting() {
    // tally votes
    setGameState(prev => {
      const tally = {}
      prev.players.forEach(p => {
        if (p.vote && p.alive) tally[p.vote] = (tally[p.vote] || 0) + 1
      })
      let maxVotes = 0
      let winner = null
      Object.keys(tally).forEach(k => {
        if (tally[k] > maxVotes) { maxVotes = tally[k]; winner = k }
      })
      // majority simple: if winner exists and >0, eliminate
      const players = prev.players.map(p => p.id.toString() === winner ? { ...p, alive: false } : p)
      // reset votes
      const reset = players.map(p => ({ ...p, vote: null }))
      return { ...prev, players: reset, currentPhase: 'chat', votingActive: false, timer: 30 }
    })
  }

  function sendChat(message, from, channel = 'global') {
    setGameState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [channel]: [...prev.chats[channel], { id: Date.now(), from, message }]
      }
    }))
  }

  function toggleProtect(playerId) {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === playerId ? { ...p, protected: !p.protected } : p)
    }))
  }

  function resetGame() {
    setGameState(initialState)
  }

  return (
    <GameContext.Provider value={{ gameState, addPlayer, assignRoles, startVoting, castVote, sendChat, toggleProtect, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}
