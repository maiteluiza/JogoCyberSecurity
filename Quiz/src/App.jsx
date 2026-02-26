import React, { useState } from 'react'
import { useGame } from './GameContext'
import HostPanel from './components/HostPanel'
import PlayerPanel from './components/PlayerPanel'
import Chat from './components/Chat'

export default function App(){
  const [view, setView] = useState('access')
  const [name, setName] = useState('')
  const [asHost, setAsHost] = useState(false)
  const { addPlayer, showSuccess, showError } = useGame()

  function enter(){
    if(!name) return alert('Digite um nome')
    try {
      const id = addPlayer(name, asHost)
      // addPlayer may be async when using firebase; handle promise
      if (id && typeof id.then === 'function') {
        id.then(() => showSuccess('Entrou'))
      } else {
        showSuccess('Entrou')
      }
    } catch (e) {
      showError('Falha ao entrar')
    }
    setView(asHost ? 'host' : 'player')
  }

  if(view === 'access'){
    return (
      <div className="access-screen center-screen">
        <h1 className="title glow">HACKER MAFIA</h1>
        <input className="input input-lg" placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} />
        <div className="access-buttons">
          <label className="muted-label"><input type="checkbox" checked={asHost} onChange={e=>setAsHost(e.target.checked)} /> Entrar como Host</label>
          <button className="btn btn-primary" onClick={enter}>Entrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root app-bg">
      <div className="left main-column">
        {view === 'host' ? <HostPanel/> : <PlayerPanel/>}
      </div>
      <div className="right sidebar">
        <Chat/>
      </div>
    </div>
  )
}
