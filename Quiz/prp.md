# 🎮 PRP – Jogo de Investigação (Front-End Only)

## 1. 📌 Visão Geral do Produto

Criar um site front-end de um jogo multiplayer de dedução social, com tema **cyberpunk/hacker**, interface escura e criativa.

O jogo possui:

* 1 Host
* N jogadores
* Sistema de roles secretas
* Chat geral sempre ativo
* Chat privado para hackers
* Sistema de votação com timer de 30 segundos
* Controle manual de rodadas pelo Host

⚠️ O sistema será totalmente front-end (simulado via estado global). Pode usar:

* React + Context API ou Zustand
  ou
* HTML + CSS + JS puro com gerenciamento de estado via objeto global

---

# 2. 🎨 Interface & Identidade Visual

## Tema:

* Dark mode obrigatório
* Estética hacker / terminal futurista
* Neon verde (#00ff88), roxo (#7a00ff), azul elétrico (#00c3ff)
* Fundo escuro (#0f0f14 ou similar)
* Fonte estilo mono (Ex: Orbitron / Fira Code)

## Elementos Visuais:

* Animações suaves
* Glow nos botões
* Timer circular animado
* Cards de jogadores com efeito hover
* Ícones para cada role

---

# 3. 👥 Estrutura de Telas

## 🔴 Tela 1 – Escolha de Acesso

* Botão: "Entrar como Host"
* Botão: "Entrar como Jogador"
* Campo para nome
* Campo para código da sala (simulado)

---

# 4. 🧠 Tela do HOST

O host possui controle total do fluxo.

## Painel do Host:

### 📋 Lista de Jogadores

* Nome
* Role (visível apenas para o host)
* Status: Vivo / Eliminado
* Indicador visual da role

### 🎮 Controles do Jogo

Botões:

* Iniciar votação dos Investigadores
* Iniciar votação dos Hackers
* Iniciar votação Geral (Culpado)
* Encerrar rodada
* Resetar jogo

### ⏱ Sistema de Votação

* Timer de 30 segundos
* Barra circular animada
* Contador regressivo visível para todos

⚠️ A votação só reinicia quando o host clicar novamente.

---

# 5. 👤 Tela do Jogador

## Painel Principal

### 🎭 Sua Role (Card central grande)

* Nome da Role
* Descrição do poder
* Ícone
* Cor específica por role

### 👥 Lista de Jogadores

* Apenas nomes
* Indicador se está eliminado
* Botão para votar (quando votação ativa)

---

# 6. 💬 Sistema de Chat

O chat NUNCA fica desativado.

## 📢 Chat Geral

* Visível para todos
* Hackers também têm acesso

## 🔐 Chat Hackers

* Visível apenas para Hackers e Host
* Botão de alternância de chat

## 💀 Restrição

Se jogador for eliminado:

* Input do chat desativado
* Não pode votar
* Nome fica acinzentado

---

# 7. 🧩 Roles do Jogo

## 🕵️ Investigadores

* Votam em um suspeito
* Se maioria decidir corretamente → consequência definida pelo host

## 💻 Hackers

* Escolhem alguém para hackear
* Se alvo não estiver protegido → eliminado
* Acesso a chat secreto

## 🛡 Antivírus

* Escolhe alguém para proteger
* Se hacker atacar protegido → ataque falha
* Pode proteger a si mesmo? (Definir regra – padrão: NÃO)

---

# 8. 🔁 Fluxo do Jogo

### 1️⃣ Lobby

Host distribui roles (aleatório ou manual)

### 2️⃣ Chat Livre

Discussão aberta

### 3️⃣ Host inicia:

* Votação Investigadores
  ou
* Votação Hackers

Timer inicia automaticamente (30s)

### 4️⃣ Encerramento Automático

Ao zerar timer:

* Sistema contabiliza votos
* Exibe resultado
* Aplica efeitos

### 5️⃣ Retorna ao Chat Livre

Até o host iniciar nova rodada

---

# 9. ⚙️ Regras de Lógica Interna (Front-End)

## Estado Global Exemplo:

```javascript
gameState = {
  players: [
    {
      id,
      name,
      role,
      alive: true,
      protected: false,
      vote: null
    }
  ],
  currentPhase: "chat" | "investigator_vote" | "hacker_vote",
  timer: 30,
  chats: {
    global: [],
    hackers: []
  }
}
```

---

# 10. 🗳 Sistema de Votação

* Só pode votar 1 vez
* Pode alterar voto enquanto timer ativo
* Ao finalizar:

  * Maioria simples vence
  * Empate = ninguém eliminado

---

# 11. 🧪 Regras Especiais

## Se Hacker atacar:

* Verifica se alvo está protegido
* Se protegido → mensagem “Ataque Bloqueado”
* Se não → alvo eliminado

## Eliminado:

* Não vota
* Não escreve
* Fica com overlay “ELIMINADO”

---

# 12. 🔐 Permissões

| Função          | Host | Investigador | Hacker | Antivírus |
| --------------- | ---- | ------------ | ------ | --------- |
| Ver roles       | ✅    | ❌            | ❌      | ❌         |
| Chat geral      | ✅    | ✅            | ✅      | ✅         |
| Chat hacker     | ✅    | ❌            | ✅      | ❌         |
| Iniciar votação | ✅    | ❌            | ❌      | ❌         |
| Votar           | ❌    | ✅            | ✅      | ✅         |

---

# 13. 📱 Responsividade

* Layout adaptável
* Sidebar vira menu colapsável
* Chat ocupa 40% da tela no desktop
* Full width no mobile

---

# 14. 💡 Extras Criativos (Opcional)

* Sons de terminal ao votar
* Animação glitch ao eliminar jogador
* Efeito “hack” quando hacker age
* Tema alternável (Dark Neon / Dark Red)

---

# 15. 🧱 Estrutura Técnica Recomendada

### Opção 1 – React

* Context API para estado global
* useEffect para timer
* Componentização:

  * GameProvider
  * HostPanel
  * PlayerPanel
  * ChatBox
  * VoteModal

### Opção 2 – JS Puro

* Arquivo gameState.js
* Manipulação DOM
* setInterval para timer

---

# 16. 🧩 MVP Obrigatório

* Tela Host funcional
* Tela Jogador funcional
* Sistema de votação com timer
* Chat geral
* Chat hackers
* Eliminação funcional
* Proteção antivírus funcional