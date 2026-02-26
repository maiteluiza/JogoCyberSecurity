import React, { useState } from 'react'
import { useGame } from '../GameContext'

export default function PlayerPanel(){
  const { gameState, castVote, joinRoom, roomId, currentPlayer, showSuccess, showError } = useGame()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  async function doJoin(){
    if(!name) return alert('Digite um nome')
    const target = code || roomId
    if(!target) return alert('Digite código da sala')
    try {
      const pid = await joinRoom(target, name)
      if (pid) {
        showSuccess('Entrou na sala')
      } else {
        showError('Falha ao entrar na sala')
      }
    } catch (e) {
      if (e && e.message === 'ROOM_NOT_FOUND') showError('Sala não encontrada')
      else if (e && e.message === 'ADD_FAILED') showError('Falha ao adicionar jogador na sala')
      else showError('Erro ao entrar na sala')
    }
    setName('')
  }

  function doVote(targetId){
    const voterId = currentPlayer?.id
    if(!voterId) return alert('Você precisa entrar na sala primeiro')
    if(!currentPlayer.alive) return
    castVote(voterId, targetId).then(()=>showSuccess('Voto enviado')).catch(()=>showError('Falha ao enviar voto'))
  }

  return (
    <div className={`panel player-panel`}> 
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className="panel-title">Painel do Jogador</h2>
        <div className="phase-indicator">FASE ATUAL: <strong>{gameState.currentPhase?.toUpperCase() || 'CHAT'}</strong></div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div className="status-card card">
          <div>Rodada: {gameState.currentPhase || 'chat'}</div>
          <div>Jogadores vivos: {gameState.players.filter(p=>p.alive).length}</div>
          <div>Hackers vivos: { (currentPlayer && (currentPlayer.role==='hacker' || currentPlayer.isHost)) ? gameState.players.filter(p=>p.alive && p.role==='hacker').length : '??' }</div>
        </div>
        {gameState.votingActive && (
          <div className="card" style={{textAlign:'center'}}>
            <h1 className="timer big">{gameState.timer}s</h1>
            <div className="muted-label">VOTAÇÃO ATIVA</div>
          </div>
        )}
      </div>
      <div className="form-row">
        <input className="input" placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Código da sala" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="btn btn-primary" onClick={doJoin}>Entrar</button>
      </div>

      <div className={`role-card card ${currentPlayer?.protected ? 'role-protected' : ''}`}>
        <h3>Seu Papel</h3>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="avatar role-avatar">{currentPlayer ? (currentPlayer.name?.[0] || '?') : '?'}</div>
          <div>
            <div className="role-name">{currentPlayer ? (currentPlayer.role || '(ainda não atribuída)') : '(entre na sala)'}</div>
            {currentPlayer?.protected && <div className="protected-badge">🛡️ Você está protegido nesta rodada</div>}
          </div>
        </div>
      </div>

      <div className="players-list">
        <h3>Jogadores</h3>
        {gameState.players.map(p => (
          <div key={p.id} className={`player-card card ${!p.alive ? 'dead' : 'player-hover'}`} onClick={() => { if (!p.alive) return; if (gameState.votingActive && currentPlayer && currentPlayer.alive) doVote(p.id) }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="avatar">{p.name?.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
              <div className="left-info">
                <div className="name">{p.name} {p.isHost && <span className="host-badge">👑</span>}</div>
                <div className={`role small ${((currentPlayer && (currentPlayer.isHost || currentPlayer.id === p.id)) && p.role==='hacker') ? 'role-hacker' : 'role-investigator'}`}>
                  {currentPlayer && (currentPlayer.isHost || currentPlayer.id === p.id) ? (p.role || '-') : '(oculto)'}
                </div>
              </div>
            </div>
            <div className="right-actions">
              <div className="status">{p.alive ? 'VIVO' : 'ELIMINADO'}</div>
              {gameState.votingActive && p.alive && currentPlayer && currentPlayer.alive && (
                <button className="btn btn-primary">Votar</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentPlayer && currentPlayer.vote && (
        <div className="card" style={{marginTop:12}}>
          <strong>✔️ Você votou em {gameState.players.find(x=>x.id===currentPlayer.vote)?.name || currentPlayer.vote}</strong>
        </div>
      )}
      {gameState.history && gameState.history.length > 0 && (
        <div className="card history-list">
          <h4 style={{margin:0}}>Histórico de Rodadas</h4>
          {gameState.history.map((h, i) => <div key={i} className="muted-label">{h}</div>)}
        </div>
      )}
    </div>
  )
}
