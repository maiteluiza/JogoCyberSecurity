# 🎯 OBJETIVOS

Adicionar:

1. 👑 **Host vê em quem cada jogador votou**
2. 🧠 **Regra automática de quantidade de hackers**
3. ⚖️ **Eliminação automática por maioria**
4. 🏆 **Sistema de vitória/derrota**
5. 🚨 **Pop-up global sincronizado de fim de jogo**

---

# 🧱 ESTRUTURA ATUAL (mantida)

```plaintext
rooms/{roomId}
  ├── players/{playerId}
  ├── chats/{messageId}
```

---

# 🆕 ALTERAÇÕES NO MODELO DE DADOS

## 📁 rooms/{roomId}

Adicionar:

```json
{
  "gameOver": false,
  "winner": null
}
```

---

## 📁 players/{playerId}

Campo `vote` já existe:

```json
{
  "vote": "playerTargetId"
}
```

⚠️ Ele NÃO deve ser removido após votação, apenas resetado para null na próxima rodada.

---

# 👑 FEATURE 1 — HOST VÊ OS VOTOS

## 🎯 Regra

* Apenas o host pode visualizar:

  * Lista de jogadores
  * Em quem cada um votou
* Jogadores comuns NÃO podem ver votos

---

## 💻 Implementação Frontend

### Buscar jogadores normalmente:

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

### No componente do Host:

```js
players.map(player => (
  <div key={player.id}>
    {player.name} → Votou em: {player.vote || "Ninguém"}
  </div>
))
```

---

### No componente do jogador:

NÃO renderizar `vote`.

---

# 🧠 FEATURE 2 — REGRA AUTOMÁTICA DE HACKERS

## 📜 Regra Oficial

| Jogadores | Hackers   |
| --------- | --------- |
| 1–5       | 1 hacker  |
| 6+        | 2 hackers |

---

## 🎯 Implementação

Quando o host clicar em **"Distribuir Roles"**:

```js
const totalPlayers = players.length

let hackerCount = 1
if (totalPlayers > 5) hackerCount = 2
```

---

## Sorteio

```js
const shuffled = shuffleArray(players)

const hackers = shuffled.slice(0, hackerCount)
```

Definir roles:

```js
hackers.forEach(player => {
  updateDoc(doc(db, "rooms", roomId, "players", player.id), {
    role: "hacker"
  })
})
```

Restantes:

```js
role: "investigator" ou "antivirus"
```

---

# ⚖️ FEATURE 3 — ELIMINAÇÃO POR MAIORIA

## 🎯 Regra

* Quem receber mais votos é eliminado
* Empate → ninguém eliminado

---

## 💻 Lógica no Host (ao finalizar rodada)

```js
const voteCount = {}

players.forEach(player => {
  if (!player.vote) return
  voteCount[player.vote] = (voteCount[player.vote] || 0) + 1
})

let maxVotes = 0
let eliminatedId = null

for (const id in voteCount) {
  if (voteCount[id] > maxVotes) {
    maxVotes = voteCount[id]
    eliminatedId = id
  }
}
```

---

## Aplicar eliminação

```js
if (eliminatedId) {
  updateDoc(doc(db, "rooms", roomId, "players", eliminatedId), {
    alive: false
  })
}
```

---

# 🏆 FEATURE 4 — CONDIÇÃO DE VITÓRIA

## 🎯 Regras

### Investigadores vencem se:

Todos hackers forem eliminados.

### Hackers vencem se:

Número de hackers vivos >= número de jogadores não hackers vivos.

---

## 💻 Verificação automática após cada eliminação

```js
const alivePlayers = players.filter(p => p.alive)

const aliveHackers = alivePlayers.filter(p => p.role === "hacker")
const aliveNonHackers = alivePlayers.filter(p => p.role !== "hacker")
```

---

### Vitória Investigadores

```js
if (aliveHackers.length === 0) {
  updateDoc(roomRef, {
    gameOver: true,
    winner: "investigators"
  })
}
```

---

### Vitória Hackers

```js
if (aliveHackers.length >= aliveNonHackers.length) {
  updateDoc(roomRef, {
    gameOver: true,
    winner: "hackers"
  })
}
```

---

# 🚨 FEATURE 5 — POP-UP GLOBAL DE FIM DE JOGO

## 🎯 Listener

```js
onSnapshot(roomRef, (doc) => {
  const data = doc.data()

  if (data.gameOver) {
    setWinner(data.winner)
    setShowGameOverModal(true)
  }
})
```

---

## 🎨 Modal

Se winner === "hackers":

* Hackers veem: "VOCÊS VENCERAM"
* Outros veem: "VOCÊS PERDERAM"

Se winner === "investigators":

* Investigadores veem: "VOCÊS VENCERAM"
* Hackers veem: "VOCÊS PERDERAM"

---

# 🔄 RESETAR JOGO

Host pode clicar em:

"Reiniciar Jogo"

```js
updateDoc(roomRef, {
  gameOver: false,
  winner: null,
  phase: "chat",
  roundActive: false,
  endTime: null
})
```

Resetar todos players:

```js
alive: true
vote: null
role: null
protected: false
```

---

# 🎯 CRITÉRIOS DE ACEITAÇÃO

* [ ] Host vê todos os votos
* [ ] Jogadores NÃO veem votos
* [ ] Sempre há 1 ou 2 hackers corretamente
* [ ] Maioria elimina corretamente
* [ ] Jogo termina automaticamente
* [ ] Modal aparece para todos
* [ ] Resultado diferente para cada role

---

# 🔥 RESULTADO FINAL

Agora seu jogo terá:

✅ Balanceamento automático
✅ Resultado transparente para host
✅ Sistema completo de vitória
✅ Finalização automática
✅ Estrutura sincronizada real