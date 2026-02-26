# 🎮 PROBLEMA

Atualmente o jogador:

* Espera a votação
* Usa o chat

Resultado:
🫠 Tela parada
😴 Baixa tensão
🧊 Experiência fria

---

# 🚀 SOLUÇÃO: Transformar a tela em um CENTRO DE TENSÃO

A tela do jogador deve ter:

1. 🔥 Status do jogo em tempo real
2. 🧠 Painel da role com habilidade visual
3. ⏳ Contador grande quando votação começar
4. 📊 Histórico de rodadas
5. 👀 Indicadores visuais de quem está vivo
6. 🎭 Feedback visual de perigo
7. 🎯 Confirmação de voto
8. 🧩 Elementos psicológicos (medo e dúvida)

---

# 🧠 1. PAINEL DE ROLE ESTILIZADO

Ao invés de só mostrar texto:

Criar um CARD de role com identidade visual forte.

Adicionar:

* Ícone
* Cor exclusiva
* Efeito glow

Isso cria identidade.

---

# ⏳ 2. CONTADOR GIGANTE NA TELA

Quando a votação estiver ativa:

Mostrar um contador grande no topo:

```jsx
<h1 className="text-5xl font-bold text-purple-400 animate-pulse">
  27s
</h1>
```

Isso cria pressão psicológica.

---

# 🔥 3. STATUS DO JOGO

Adicionar um painel tipo:

```
Rodada: Votação dos Investigadores
Jogadores vivos: 6
Hackers vivos: ?
```

Hackers vivos pode ser oculto para não hackers.

Isso mantém o jogador informado.

---

# 👥 4. LISTA DE JOGADORES INTERATIVA

Ao invés de lista simples:

* Mostrar avatar fake
* Mostrar status vivo/hackeado
* Animação ao morrer (ser hackeado)
* Hover destacando possível voto

Exemplo:

```jsx
<div className="p-3 rounded-2xl bg-gray-800 hover:bg-purple-600 cursor-pointer">
  <span className="font-semibold">Carlos</span>
  <span className="ml-2 text-green-400">Vivo</span>
</div>
```

Se morto:

* Opacidade 40%
* Ícone 💀
* Desabilitar clique (voto)

---

# 🗳️ 5. CONFIRMAÇÃO VISUAL DE VOTO

Quando votar:

Mostrar:

✔️ Você votou em João
ou
💀 Você escolheu hackear Maria

E bloquear troca (ou permitir com aviso).

---

# 📜 6. HISTÓRICO DE RODADAS

Criar um pequeno painel:

```
Rodada 1: Ana eliminada
Rodada 2: Ninguém eliminado
Rodada 3: Pedro eliminado
```

Isso dá sensação de progresso.

Salvar isso em:

```plaintext
rooms/{roomId}/history/{roundId}
```

---

# 🛡️ 8. INDICADOR DE PROTEÇÃO (ANTIVÍRUS)

Se for protegido:

Mostrar discretamente:

```
🛡️ Você está protegido nesta rodada.
```

Isso cria emoção.

# 🧩 10. BARRA DE PROGRESSO DO JOGO

Mostrar:

```
Hackers: 1
Investigadores: 4
```

Mas ocultar role de hacker para quem não é hacker.

# 🧠 12. MENSAGENS SISTÊMICAS AUTOMÁTICAS

Adicionar no chat mensagens automáticas:

* "Rodada iniciada."
* "Tempo esgotado."
* "João foi eliminado."
* "Hackers venceram."

Isso deixa o jogo vivo.

---

# 🎯 13. INDICADOR DE FASE ATUAL

Topo da tela:

```
FASE ATUAL: CHAT
FASE ATUAL: VOTAÇÃO
```

Com cores diferentes.

---

# 🔥 14. MICRO ANIMAÇÕES

* Fade in quando rodada começa
* Shake quando eliminado

# 🎮 COMO A TELA DO JOGADOR DEVE FICAR

Layout ideal:

```
[ STATUS DO JOGO ]
[ CONTADOR ]
[ CARD DA ROLE ]
[ LISTA DE JOGADORES ]
[ CONFIRMAÇÃO DE VOTO ]
[ CHAT FIXO AO LADO ]
```

Nada deve parecer vazio.