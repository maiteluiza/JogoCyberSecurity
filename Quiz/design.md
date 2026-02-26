# 🎨 PRP 6.0 — UI Cyberpunk Dark Mode (Visual Profissional + UX Melhorada)

---

# 🎯 OBJETIVO

Transformar o jogo em algo:

* 🌑 Fundo escuro
* 🌈 Colorido e vibrante
* 🔘 Botões grandes e com hover animado
* 👤 Lista de jogadores estilizada
* 💬 Chat moderno
* 👑 Host com destaque visual
* ⚡ Visual estilo hacker/cyberpunk

---

# 🧠 STACK RECOMENDADA

Se estiver usando Vite + React:

👉 Instalar TailwindCSS (recomendado)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

No `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
theme: {
  extend: {},
},
plugins: [],
```

No `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

# 🌑 1. FUNDO GLOBAL DARK MODE

No `App.jsx`:

```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
  {children}
</div>
```

Ou fundo sólido cyber:

```jsx
bg-[#0f172a]
```

---

# 🎨 PALETA DE CORES

| Função         | Cor                                  |
| -------------- | ------------------------------------ |
| Hacker         | text-red-500                         |
| Investigador   | text-cyan-400                        |
| Host           | text-yellow-400                      |
| Botão Primário | bg-purple-600                        |
| Botão Perigo   | bg-red-600                           |
| Hover          | hover:scale-105 hover:brightness-110 |

---

# 🔘 2. BOTÕES GRANDES COM HOVER ANIMADO

Componente Button:

```jsx
<button
  className="
    px-6 py-3
    bg-purple-600
    rounded-2xl
    text-lg
    font-bold
    shadow-lg
    transition-all
    duration-200
    hover:scale-105
    hover:bg-purple-500
    active:scale-95
  "
>
  Iniciar Rodada
</button>
```

Botão perigoso:

```jsx
bg-red-600 hover:bg-red-500
```

---

# 👤 3. LISTA DE JOGADORES DECORADA

Antes: lista simples
Agora: cards estilizados

```jsx
<div className="grid gap-3">
  {players.map(player => (
    <div
      key={player.id}
      className={`
        p-4 rounded-2xl
        bg-gray-800
        shadow-md
        border
        transition-all
        duration-200
        hover:scale-[1.02]
        ${!player.alive ? "opacity-40 line-through" : ""}
      `}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">
          {player.name}
        </span>

        {player.isHost && (
          <span className="text-yellow-400 font-bold">
            👑 HOST
          </span>
        )}
      </div>

      {player.role && (
        <div className="mt-2 text-sm">
          Role:
          <span className={
            player.role === "hacker"
              ? "text-red-500"
              : "text-cyan-400"
          }>
            {" "}{player.role}
          </span>
        </div>
      )}
    </div>
  ))}
</div>
```

---

# 💬 4. CHAT ESTILIZADO

```jsx
<div className="bg-gray-900 rounded-2xl p-4 h-80 overflow-y-auto shadow-inner">
  {messages.map(msg => (
    <div
      key={msg.id}
      className="mb-2 p-2 rounded-xl bg-gray-800"
    >
      <span className="font-bold text-purple-400">
        {msg.playerName}:
      </span>
      <span className="ml-2">
        {msg.text}
      </span>
    </div>
  ))}
</div>
```

Input:

```jsx
<input
  className="
    w-full
    p-3
    rounded-xl
    bg-gray-800
    border border-gray-700
    focus:outline-none
    focus:ring-2
    focus:ring-purple-500
  "
/>
```

---

# 🚨 5. MODAL DE FIM DE JOGO ESTILIZADO

```jsx
{showGameOver && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
    <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl text-center">
      <h1 className="text-3xl font-bold mb-4">
        {winner === "hackers"
          ? "💀 Hackers Venceram"
          : "🛡️ Investigadores Venceram"}
      </h1>

      <button className="mt-4 px-6 py-3 bg-purple-600 rounded-2xl hover:scale-105 transition">
        Reiniciar
      </button>
    </div>
  </div>
)}
```

---

# ⚡ 6. ANIMAÇÕES SUAVES GLOBAIS

Adicionar no `index.css`:

```css
body {
  font-family: 'Inter', sans-serif;
}

* {
  transition: all 0.2s ease;
}
```

Opcional (efeito glow cyberpunk):

```css
.glow {
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.8);
}
```

---

# 🧱 7. LAYOUT MAIS ORGANIZADO

Estrutura principal:

```jsx
<div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-6">
  <PlayersList />
  <Chat />
</div>
```

---

# 👑 8. DESTAQUE VISUAL PARA O HOST

Se for host:

```jsx
<div className="border-2 border-yellow-400 shadow-yellow-400/30 shadow-lg">
```

---

# 🔥 9. TELA DE ENTRADA MAIS IMPACTANTE

```jsx
<div className="flex flex-col items-center justify-center min-h-screen">
  <h1 className="text-5xl font-extrabold mb-6 text-purple-500 glow">
    HACKER MAFIA
  </h1>

  <input className="p-4 rounded-xl bg-gray-800 text-white mb-4 w-80" />
  
  <button className="px-8 py-4 bg-purple-600 rounded-2xl text-xl font-bold hover:scale-105 transition">
    Entrar na Sala
  </button>
</div>
```

---

# 🎯 CRITÉRIOS DE ACEITAÇÃO

* [ ] Fundo escuro gradiente
* [ ] Botões grandes e animados
* [ ] Cards para jogadores
* [ ] Cores diferentes por role
* [ ] Chat moderno
* [ ] Modal estilizado
* [ ] Responsivo
* [ ] Visual profissional

---

# 🚀 RESULTADO

Seu jogo vai parecer:

* 🎮 Plataforma real multiplayer
* 🧠 Estilo Mafia + Among Us
* 💻 Interface hacker moderna
* ⚡ Muito mais imersivo