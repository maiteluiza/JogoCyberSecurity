# 🚀 PRP 3.0 – Sincronização Real Baseada na Estrutura Atual do Firestore

## 🎯 Objetivo

Refatorar o código do frontend (Vite + Firebase Web App) para:

* Usar `rooms/{roomId}`
* Usar subcollections `players`
* Usar subcollection `chats`
* Sincronizar estado via `onSnapshot`
* Separar chat global e hacker corretamente
* Garantir isolamento de sala real

---

# 🧠 Estrutura Oficial do Banco (Baseada na sua imagem)

## 📁 rooms/{roomId}

Campos obrigatórios:

```json
{
  "hostId": "uid-do-host",
  "phase": "chat | investigator_vote | hacker_vote",
  "roundActive": false,
  "endTime": null,
  "createdAt": 123456789
}
```

---

## 📁 rooms/{roomId}/players/{playerId}

```json
{
  "name": "João",
  "role": "investigator | hacker | antivirus",
  "alive": true,
  "protected": false,
  "vote": null,
  "isHost": false
}
```

---

## 📁 rooms/{roomId}/chats/{messageId}

⚠️ NÃO criar documento único com array.
Cada mensagem deve ser um documento separado.

```json
{
  "text": "Eu acho que é a Maria",
  "senderId": "uid",
  "senderName": "João",
  "type": "global | hacker",
  "timestamp": 123456789
}
```

Isso permite sincronização automática correta.

---

# 🔄 Ajustes Obrigatórios no Código

---

# 1️⃣ Conectar na sala correta

```js
import { doc, collection } from "firebase/firestore"
import { db } from "./firebase"

const roomRef = doc(db, "rooms", roomId)
const playersRef = collection(db, "rooms", roomId, "players")
const chatsRef = collection(db, "rooms", roomId, "chats")
```

---

# 2️⃣ Escutar atualizações da sala

```js
import { onSnapshot } from "firebase/firestore"

onSnapshot(roomRef, (snapshot) => {
  const data = snapshot.data()
  setPhase(data.phase)
  setEndTime(data.endTime)
})
```

---

# 3️⃣ Escutar jogadores em tempo real

```js
onSnapshot(playersRef, (snapshot) => {
  const players = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setPlayers(players)
})
```

---

# 4️⃣ Escutar mensagens

```js
import { query, orderBy } from "firebase/firestore"

const q = query(chatsRef, orderBy("timestamp"))

onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => doc.data())
  setMessages(messages)
})
```

---

# 💬 Filtrar Chat no Frontend

No frontend:

```js
const visibleMessages = messages.filter(msg => {
  if (msg.type === "global") return true
  if (msg.type === "hacker" && (isHacker || isHost)) return true
  return false
})
```

---

# ⏱ Sistema de Timer Sincronizado

⚠️ NÃO usar setInterval global.

Quando host inicia votação:

```js
await updateDoc(roomRef, {
  phase: "investigator_vote",
  endTime: Date.now() + 30000,
  roundActive: true
})
```

No cliente:

```js
useEffect(() => {
  if (!endTime) return

  const interval = setInterval(() => {
    const remaining = endTime - Date.now()
    setTimer(Math.max(0, Math.floor(remaining / 1000)))
  }, 1000)

  return () => clearInterval(interval)
}, [endTime])
```

Todos ficam sincronizados.

---

# 🗳 Sistema de Voto Correto

Cada jogador atualiza apenas o próprio documento:

```js
const playerRef = doc(db, "rooms", roomId, "players", playerId)

await updateDoc(playerRef, {
  vote: targetId
})
```

Host escuta jogadores e calcula maioria quando `Date.now() >= endTime`.

---

# 🔐 Eliminação

Quando alguém for eliminado:

```js
await updateDoc(doc(db, "rooms", roomId, "players", targetId), {
  alive: false
})
```

No frontend:

```js
if (!player.alive) {
  desabilitarChat()
  desabilitarVoto()
}
```

---

# 🧱 Fluxo Atualizado

### 1️⃣ Host cria sala

* addDoc em `rooms`
* salva hostId

### 2️⃣ Jogador entra

* addDoc em `rooms/{roomId}/players`

### 3️⃣ Host distribui roles

* updateDoc individual em cada player

### 4️⃣ Host inicia rodada

* updateDoc em rooms

### 5️⃣ Todos escutam automaticamente

---

# 🚨 Erros Comuns Que Você Deve Evitar

❌ Guardar mensagens como array
❌ Rodar timer só localmente
❌ Não usar orderBy no chat
❌ Não separar mensagens por type
❌ Atualizar documento inteiro de players

---

# 📦 MVP Técnico Obrigatório

* [ ] Criar sala real
* [ ] Entrar na sala real
* [ ] Players sincronizados
* [ ] Chat global sincronizado
* [ ] Chat hacker sincronizado
* [ ] Votação sincronizada
* [ ] Timer sincronizado
* [ ] Eliminação sincronizada

---

# 🏗 Estrutura React Recomendada

```
src/
 ├── firebase.js
 ├── context/
 │     GameContext.jsx
 ├── hooks/
 │     useRoom.js
 │     usePlayers.js
 │     useChat.js
 ├── components/
 │     HostPanel.jsx
 │     PlayerPanel.jsx
 │     ChatBox.jsx
 │     VotePanel.jsx
```

---

# 🎯 Resultado Esperado

Após aplicar esse PRP:

✅ Jogadores entram na mesma sala
✅ Chat funciona em tempo real
✅ Hackers têm chat privado
✅ Host controla fase
✅ Timer sincronizado