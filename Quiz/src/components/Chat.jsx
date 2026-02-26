import React, { useState } from 'react'
import { useGame } from '../GameContext'

export default function Chat(){
  const { gameState, sendChat, currentPlayer, showSuccess, showError } = useGame()
  const [text, setText] = useState('')
  const [type, setType] = useState('global')

  async function send(){
    if(!text) return
    if (currentPlayer && !currentPlayer.alive) return
    try {
      await sendChat(text, currentPlayer?.id || 'anon', currentPlayer?.name || 'Anon', type)
      showSuccess('Mensagem enviada')
      setText('')
    } catch (e) {
      showError('Falha ao enviar mensagem')
    }
  }

  // filter visible messages according to type and permissions
  const messages = (gameState.chats.global || []).filter(m => {
    if (m.type === 'global' || !m.type) return true
    if (m.type === 'hacker') return currentPlayer && (currentPlayer.role === 'hacker' || currentPlayer.isHost)
    return false
  })

  return (
    <div className="chat panel">
      <h3 className="panel-title">Chat</h3>
      <div className="messages">
        {messages.map(m => (
          <div key={m.id || m.timestamp} className={`message msg-card ${m.senderName==='Sistema' || m.sender==='system' ? 'system-msg' : ''}`}>
            <strong className="msg-sender">{m.senderName || m.sender || 'Anon'}:</strong>
            <span className="msg-text"> {m.text || m.message}</span>
          </div>
        ))}
      </div>
      <div className="composer">
        <select className="select" value={type} onChange={e=>setType(e.target.value)}>
          <option value="global">Global</option>
          <option value="hacker" disabled={!(currentPlayer && (currentPlayer.role==='hacker' || currentPlayer.isHost))}>Hackers</option>
        </select>
        <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Enviar mensagem" />
        <button className="btn btn-primary" onClick={send} disabled={currentPlayer && !currentPlayer.alive}>Enviar</button>
      </div>
    </div>
  )
}
