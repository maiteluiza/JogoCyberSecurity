import React from 'react'
import { useGame } from '../GameContext'

export default function HostPanel(){
  const { gameState, assignRoles, startVoting, resetGame } = useGame()

  return (
    <div className="panel host-panel">
      <h2>Host Panel</h2>
      <div className="controls">
        <button onClick={()=>assignRoles()}>Distribuir Roles</button>
        <button onClick={()=>startVoting('investigator_vote')}>Votação Investigadores</button>
        <button onClick={()=>startVoting('hacker_vote')}>Votação Hackers</button>
        <button onClick={()=>startVoting('general_vote')}>Votação Geral</button>
        <button onClick={()=>resetGame()}>Resetar Jogo</button>
      </div>

      <div className="players-list">
        <h3>Jogadores</h3>
        {gameState.players.map(p => (
          <div key={p.id} className={`player-card ${!p.alive ? 'dead' : ''}`}>
            <div className="name">{p.name}</div>
            <div className="role">{p.role}</div>
            <div className="status">{p.alive ? 'VIVO' : 'ELIMINADO'}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
