import React, { useState } from 'react'
import { useGame } from '../GameContext'

export default function HostPanel(){
  const { gameState, assignRoles, startVoting, resetGame, createRoom, roomId, currentPlayer, roomMeta, showSuccess, showError } = useGame()
  const [code, setCode] = useState('')

  async function makeRoom(){
    const id = code || Math.random().toString(36).slice(2, 8).toUpperCase()
    try {
      const created = await createRoom(id)
      if (!created) throw new Error('create-failed')
      const createdId = created?.id || created
      setCode(createdId)
      showSuccess(`Sala criada: ${createdId}`)
    } catch (e) {
      showError('Falha ao criar sala — verifique configuração do Firebase ou o console para erros')
    }
  }

  const isHost = currentPlayer && currentPlayer.isHost

  return (
    <div className={`panel host-panel ${isHost ? 'host-highlight' : ''}`}>
      <h2 className="panel-title">Host Panel {isHost && <span className="host-badge">👑</span>}</h2>
      <div className="controls">
        <div className="form-row">
          <input className="input" placeholder="Room code (optional)" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn btn-primary" onClick={makeRoom}>Criar Sala</button>
          <span className="muted-label">Sala: {roomId || '-'}</span>
        </div>
        <div className="controls-grid">
          <button className="btn btn-primary" onClick={() => { if(!isHost) return showError('Somente o host pode distribuir roles'); assignRoles(); showSuccess('Roles distribuídos') }} disabled={!isHost}>Distribuir Roles</button>
          <button className="btn btn-primary" onClick={() => { if(!isHost) return showError('Somente o host pode iniciar votação'); startVoting('investigator_vote'); showSuccess('Votação de investigadores iniciada') }} disabled={!isHost}>Votação Investigadores</button>
          <button className="btn btn-primary" onClick={() => { if(!isHost) return showError('Somente o host pode iniciar votação'); startVoting('hacker_vote'); showSuccess('Votação de hackers iniciada') }} disabled={!isHost}>Votação Hackers</button>
          <button className="btn btn-primary" onClick={() => { if(!isHost) return showError('Somente o host pode iniciar votação'); startVoting('general_vote'); showSuccess('Votação geral iniciada') }} disabled={!isHost}>Votação Geral</button>
          <button className="btn btn-danger" onClick={() => { if(!isHost) return showError('Somente o host pode resetar'); resetGame(); showSuccess('Jogo resetado') }} disabled={!isHost}>Resetar Jogo</button>
        </div>
        <div className="muted-label" style={{marginTop:8}}>Fase: {roomMeta?.phase || 'chat'} - Timer: {roomMeta?.endTime ? Math.max(0, Math.ceil((roomMeta.endTime - Date.now())/1000)) : '-'}</div>
      </div>

      <div className="players-list">
        <h3>Jogadores</h3>
        {gameState.players.map(p => (
          <div key={p.id} className={`player-card card ${!p.alive ? 'dead' : ''}`}>
            <div className="left-info">
              <div className="name">{p.name} {p.isHost && <span className="host-badge">👑</span>}</div>
              <div className={`role small ${(isHost && p.role==='hacker') ? 'role-hacker' : (isHost ? 'role-investigator' : '')}`}>
                {isHost ? (p.role || '-') : '(oculto)'}
              </div>
            </div>
            <div className="right-actions">
              <div className="status">{p.alive ? 'VIVO' : 'ELIMINADO'}</div>
              <div className="vote">Votou em: {p.vote ? (gameState.players.find(x=>x.id===p.vote)?.name || p.vote) : 'Ninguém'}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
