# 🔥 Form Check Roast

> *"Your push-up has the structural integrity of wet spaghetti."*

A hackathon fitness app that watches your calisthenics form and responds with a savage AI roast + one real correction cue — demonstrated by your choice of cartoon animal coach.

---

## ✨ Features

- 📹 **Video Demo** — Embedded real-world push-up fail video for the demo
- 🤖 **AI Roast Engine** — Gemini 1.5 Flash generates a brutal one-liner + correction
- 🦆 **5 Animal Coaches** — Human, Duck, Cow, Frog, or Bear demonstrates correct form
- 🎬 **Animated SVG Characters** — Each animal has a unique personality and pushup style
- 🔥 **Severity Meter** — Mild / Roasted / Absolutely Cooked
- 💀 **Never crashes** — Falls back to handcrafted roasts if the API is unavailable

---

## 🏃 Quickstart

### Prerequisites
- Node.js 18+
- A Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey) (free)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd form-check-roast

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and paste your Gemini API key
```

### 3. Run locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🏗️ Architecture

```
form-check-roast/
├── client/          # React + Vite + Tailwind frontend
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── VideoPlayer.jsx     # Embedded YouTube video
│           ├── RoastCard.jsx       # Roast + correction display
│           ├── CharacterSelector.jsx  # Pick your animal coach
│           ├── CharacterDemo.jsx   # Animated SVG characters
│           └── LoadingRoast.jsx    # Funny loading state
└── server/          # Express + Gemini API backend
    └── src/
        ├── index.js
        └── routes/roast.js        # POST /api/roast
```

---

## 🤝 Team Contribution Guide

1. Fork or create a branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Open a PR against `main`

### Ideas for extensions
- [ ] Allow user to upload their own video
- [ ] Add more exercises (squat, pull-up, burpee)
- [ ] Add more animal coaches (cat, penguin, sloth)
- [ ] Leaderboard of worst forms
- [ ] Share roast as image card
- [ ] Voice narration for the roast (TTS)

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `PORT` | Server port (default: 3001) |

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini 1.5 Flash
- **Animations**: CSS keyframes + inline SVG

---

*Built with 🔥 at the hackathon. No egos spared.*
