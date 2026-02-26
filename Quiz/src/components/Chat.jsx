import React, { useState } from 'react'
import { useGame } from '../GameContext'

export default function Chat(){
  const { gameState, sendChat } = useGame()
  const [text, setText] = useState('')

  function send(){
    if(!text) return
    sendChat(text, 'You')
    setText('')
  }

  return (
    <div className="chat">
      <h3>Chat Geral</h3>
      <div className="messages">
        {gameState.chats.global.map(m => (
          <div key={m.id} className="message"><strong>{m.from}:</strong> {m.message}</div>
        ))}
      </div>
      <div className="composer">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Enviar mensagem" />
        <button onClick={send}>Enviar</button>
      </div>
    </div>
  )
}
