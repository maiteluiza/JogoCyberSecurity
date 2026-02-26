import React from 'react'
import { useGame } from '../GameContext'

export default function PlayerPanel(){
  const { gameState, startVoting, castVote } = useGame()

  function doVote(targetId){
    // for MVP we pick the first player as voter (would be current user in full app)
    const voter = gameState.players[0]
    if(!voter || !voter.alive) return
    castVote(voter.id, targetId)
  }

  return (
    <div className="panel player-panel">
      <h2>Painel do Jogador</h2>
      <div className="role-card">
        <h3>Sua Role</h3>
        <div className="role-name">(visível após atribuir roles)</div>
      </div>

      <div className="players-list">
        <h3>Jogadores</h3>
        {gameState.players.map(p => (
          <div key={p.id} className={`player-card ${!p.alive ? 'dead' : ''}`}>
            <div className="name">{p.name}</div>
            <div className="status">{p.alive ? 'VIVO' : 'ELIMINADO'}</div>
            {gameState.votingActive && p.alive && (
              <button onClick={()=>doVote(p.id)}>Votar</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
