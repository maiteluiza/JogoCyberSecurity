# 🚀 PRP 4.0 — Multiplayer Sincronizado com Firebase (Arquitetura Corrigida)

## 🎯 Objetivo

Refatorar o projeto Vite + Firebase Web para:

1. Usar **roomId real**
2. Conectar todos os jogadores à MESMA sala
3. Eliminar estado local isolado
4. Centralizar estado no Firestore
5. Resolver problema de “cada um estar numa sala diferente”

---

# 🧱 ARQUITETURA OFICIAL

## 🔥 Banco de Dados (Firestore)

```
rooms (collection)
 └── {roomId} (document)
       createdAt
       endTime
       hostId
       phase
       roundActive
       ├── players (subcollection)
       │     └── {playerId}
       └── chats (subcollection)
             └── {messageId}
```

---

# 📦 Modelo de Dados Oficial

## 📁 rooms/{roomId}

```json
{
  "createdAt": serverTimestamp,
  "endTime": null,
  "hostId": "player123",
  "phase": "chat",
  "roundActive": false
}
```

---

## 📁 rooms/{roomId}/players/{playerId}

```json
{
  "name": "João",
  "role": null,
  "alive": true,
  "protected": false,
  "vote": null,
  "isHost": false
}
```

---

## 📁 rooms/{roomId}/chats/{messageId}

```json
{
  "text": "Mensagem",
  "senderId": "player123",
  "senderName": "João",
  "type": "global",
  "timestamp": serverTimestamp()
}
```

---

# 🛠 CORREÇÃO DO PROBLEMA ANTERIOR

## ❌ Problema antigo

* Estado armazenado em React
* Cada navegador com sua própria cópia
* Chat não sincronizado
* Votação não sincronizada

## ✅ Correção definitiva

* Estado 100% baseado no Firestore
* Uso obrigatório de `onSnapshot`
* Nenhum estado crítico armazenado apenas no frontend

---

# 🔄 SINCRONIZAÇÃO OBRIGATÓRIA

## 1️⃣ Listener da sala

```js
onSnapshot(doc(db, "rooms", roomId), (doc) => {
  setPhase(doc.data().phase)
  setEndTime(doc.data().endTime)
  setRoundActive(doc.data().roundActive)
})
```

---

## 2️⃣ Listener de jogadores

```js
onSnapshot(collection(db, "rooms", roomId, "players"), (snapshot) => {
  const players = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setPlayers(players)
})
```

---

## 3️⃣ Listener de chat

```js
const q = query(
  collection(db, "rooms", roomId, "chats"),
  orderBy("timestamp")
)

onSnapshot(q, (snapshot) => {
  const messages = snapshot.docs.map(doc => doc.data())
  setMessages(messages)
})
```

---

# ⏱ SISTEMA DE TIMER CORRIGIDO

## ❌ Proibido:

```js
setInterval(() => {...})
```

sem referência global.

## ✅ Correto:

Quando host inicia votação:

```js
updateDoc(roomRef, {
  phase: "investigator_vote",
  endTime: Date.now() + 30000,
  roundActive: true
})
```

Todos clientes calculam:

```js
const remaining = endTime - Date.now()
```

---

# 🗳 SISTEMA DE VOTO CORRIGIDO

Cada jogador só pode atualizar o próprio documento:

```js
updateDoc(
  doc(db, "rooms", roomId, "players", playerId),
  { vote: targetId }
)
```

O host escuta os players e calcula resultado ao final.

---

# 💬 SISTEMA DE CHAT

## Enviar mensagem

```js
addDoc(collection(db, "rooms", roomId, "chats"), {
  text,
  senderId,
  senderName,
  type: "global",
  timestamp: serverTimestamp()
})
```

---

# 🔐 CONTROLE DE VISIBILIDADE

## Chat visível se:

```js
if (msg.type === "global") mostrar
if (msg.type === "hacker" && (role === "hacker" || isHost)) mostrar
```

---

# 👑 FLUXO DO JOGO ATUALIZADO

## Criar Sala

* setDoc em rooms/{roomId}
* Criar player host em subcollection players
* hostId preenchido corretamente

## Entrar na Sala

* Verificar se documento existe
* Criar novo player na subcollection

## Iniciar Rodada

* Apenas host pode atualizar phase

## Encerrar Rodada

* Quando tempo zerar → host calcula votos

---

# 📁 ESTRUTURA DO FRONTEND RECOMENDADA

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
 │     Lobby.jsx
 │     HostPanel.jsx
 │     PlayerPanel.jsx
 │     ChatBox.jsx
 │     VotePanel.jsx
```

---

# 🚨 REGRAS FIRESTORE (DESENVOLVIMENTO)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /rooms/{roomId} {
      allow read, write: if true;

      match /players/{playerId} {
        allow read, write: if true;
      }

      match /chats/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

(Depois devemos endurecer isso.)

---

# 🎯 CRITÉRIOS DE ACEITAÇÃO

O projeto estará correto quando:

* [ ] Dois navegadores veem as mesmas mensagens instantaneamente
* [ ] Dois navegadores veem os mesmos jogadores
* [ ] Votos aparecem em tempo real
* [ ] Timer é igual para todos
* [ ] Hackers têm chat separado
* [ ] Jogador eliminado perde permissão

---

# 🔥 Resultado Esperado

Agora:

✅ Não existe mais “sala isolada por navegador”
✅ Todos realmente estão conectados ao mesmo roomId
✅ O banco é a única fonte da verdade