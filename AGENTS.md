# AGENTS.md — Form Check Roast

## 1. Operating Environment Rules
- **Host (macOS)**: Low privilege. Do NOT run heavy dev servers or build tasks locally.
- **Dedicated Sandbox (Parallels Linux VM)**: All terminal commands, `npm install`, build steps, and dev servers run inside the VM:
  ```bash
  ssh sandbox-vm "<command>"
  # Workspace path inside VM:
  /home/andy/projects/form-check-roast
  ```

## 2. Project Architecture
- **Frontend**: React + Vite + Tailwind CSS (`client/`)
  - Animated cartoon coaches (Human, Duck, Cow, Frog, Bear) demonstrating proper push-up form.
  - Video player with preset & custom YouTube pushup clips.
  - Savage/Medium/Mild roast badges & actionable correction cues.
- **Backend**: Node.js + Express (`server/`)
  - Endpoint: `POST /api/roast`
  - Calls Google Gemini (`gemini-3.6-flash`) via REST API with `GEMINI_API_KEY`.
  - Fallback responses included so UI never breaks even if offline.
- **Repository**: [https://github.com/cartoonwonders01-beep/form-check-roast](https://github.com/cartoonwonders01-beep/form-check-roast)
