import React, { useState } from 'react'
import { useGame } from './GameContext'
import HostPanel from './components/HostPanel'
import PlayerPanel from './components/PlayerPanel'
import Chat from './components/Chat'

export default function App(){
  const [view, setView] = useState('access')
  const [name, setName] = useState('')
  const [asHost, setAsHost] = useState(false)
  const { addPlayer } = useGame()

  function enter(){
    if(!name) return alert('Digite um nome')
    addPlayer(name, asHost)
    setView(asHost ? 'host' : 'player')
  }

  if(view === 'access'){
    return (
      <div className="access-screen">
        <h1>CYBER QUIZ</h1>
        <input placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} />
        <div className="access-buttons">
          <label><input type="checkbox" checked={asHost} onChange={e=>setAsHost(e.target.checked)} /> Entrar como Host</label>
          <button onClick={enter}>Entrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root">
      <div className="left">
        {view === 'host' ? <HostPanel/> : <PlayerPanel/>}
      </div>
      <div className="right">
        <Chat/>
      </div>
    </div>
  )
}
