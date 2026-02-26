# 🚀 PRP 2.0 – Sistema Multiplayer Sincronizado em Tempo Real

## 🎯 Objetivo

Transformar o jogo front-end atual em um sistema **multiplayer sincronizado**, onde:

* Todos jogadores veem os mesmos eventos em tempo real
* Votos aparecem para todos
* Chat funciona de verdade
* Salas são separadas por código
* Host controla apenas sua sala

---

# 🏗 Arquitetura Nova

## 🔥 Solução Recomendada (Mais Simples)

Frontend:

* Vite + React

Backend:

* **Firebase** (Firestore + Realtime Database)

OU

## 🔥 Solução Profissional

Frontend:

* Vite + React

Backend:

* Node.js + Express
* **Socket.IO**
* Hospedado no **Render** ou **Railway**

---

# 📌 Versão Escolhida para Este PRP:

# 👉 Firebase (Mais rápido de implementar)

---

# 🧠 Nova Estrutura do Sistema

## Estrutura das Salas no Firestore:

```
rooms/
   ROOM123/
      players/
      gameState/
      chats/
```

---

# 🧩 Estrutura de Dados

## 📁 rooms/{roomId}

```json
{
  "hostId": "abc123",
  "phase": "chat | investigator_vote | hacker_vote",
  "timer": 30,
  "roundActive": false
}
```

---

## 📁 rooms/{roomId}/players/{playerId}

```json
{
  "name": "João",
  "role": "hacker",
  "alive": true,
  "protected": false,
  "vote": null
}
```

---

## 📁 rooms/{roomId}/chats/global

```json
{
  "messages": [
    {
      "sender": "João",
      "text": "Eu acho que é a Maria",
      "timestamp": 123456789
    }
  ]
}
```

---

## 📁 rooms/{roomId}/chats/hackers

Mesmo formato, porém visível apenas para hackers e host.

---

# 🔄 Sincronização em Tempo Real

## Usar:

```js
onSnapshot()
```

Toda vez que:

* Um voto muda
* Um jogador é eliminado
* O timer atualiza
* Uma mensagem é enviada

Todos recebem atualização automática.

---

# ⏱ Sistema de Timer Real

⚠️ O timer NÃO pode rodar localmente no navegador.

Deve funcionar assim:

1. Host inicia votação

2. Backend salva:

   * phase = investigator_vote
   * endTime = timestamp atual + 30s

3. Cada cliente calcula:

```
tempo restante = endTime - Date.now()
```

Assim todos ficam sincronizados.

---

# 🔐 Permissões

## Regras:

* Apenas host pode mudar phase
* Apenas hackers podem escrever no chat hacker
* Jogador eliminado:

  * Não pode votar
  * Não pode escrever

---

# 🧱 Fluxo Atualizado

### 1️⃣ Criar Sala

Host cria sala
→ Gera código aleatório (ex: X7KP92)
→ Salva no Firebase

### 2️⃣ Jogadores Entram

Digitam código
→ Sistema conecta na coleção correta

### 3️⃣ Distribuição de Roles

Host clica:
"Distribuir Roles"
→ Sistema sorteia e salva no banco

### 4️⃣ Votação

Host inicia
→ phase muda
→ Timer começa globalmente

### 5️⃣ Fim automático

Quando Date.now() >= endTime
→ Backend encerra votação
→ Aplica resultado

---

# 🛑 Problemas Resolvidos

| Problema Atual                | Correção                     |
| ----------------------------- | ---------------------------- |
| Usuários em salas diferentes  | Cada sala agora tem ID real  |
| Chat não sincroniza           | Firebase real-time           |
| Timer dessincronizado         | Baseado em timestamp global  |
| Estado separado por navegador | Estado centralizado no banco |

---

# 🌍 Deploy Novo

Frontend:

* Continua no GitHub Pages

Backend:

* Firebase (não precisa servidor separado)

---

# 📦 MVP Sincronizado Obrigatório

* [ ] Criar sala
* [ ] Entrar por código
* [ ] Chat global sincronizado
* [ ] Chat hackers sincronizado
* [ ] Votação sincronizada
* [ ] Timer global sincronizado
* [ ] Eliminação sincronizada