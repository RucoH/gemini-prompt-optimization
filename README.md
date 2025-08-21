# 🤖 **Gemini Prompt Optimization**

This repo shows how to **reliably return at most three complete sentences** from the Gemini API using **JSON structured output**. It includes a minimal **Express** backend and a lightweight **HTML** frontend to test and demonstrate the approach.

---

## 📌 **Features**

- ✅ **Three complete sentences guaranteed** via JSON **responseSchema**
- 🧩 **Structured output**: `responseMimeType: "application/json"` + `{ sentences: string[1..3] }`
- 🔌 **REST endpoint**: `POST /api/summary` — accepts text and returns a single paragraph (joined from up to 3 sentences)
- 🖥️ **Simple UI** (`public/index.html`) to type text and get the summary
- 🛡️ **Fallback**: if JSON is malformed, server extracts the **first 3 finished sentences** from raw text
- ⚙️ **Quality knobs**: `maxOutputTokens=200`, `temperature=0.2`, concise system instruction

---

## 🚀 **Getting Started**

Clone and install:
```bash
git clone https://github.com/RucoH/gemini-prompt-optimization
cd gemini-prompt-optimization
npm i
```

Create a `.env` file:
```bash
# .env
GEMINI_API_KEY=YOUR_KEY_HERE
PORT=3000
```

Start the server:
```bash
npm run start
```

Open the UI:
- Visit **http://localhost:3000/** (serves `public/index.html`)
- You can change API base from the footer “(change)” link if needed

**API example (bash/zsh/Git Bash/WSL):**
```bash
curl -s -X POST "http://localhost:3000/api/summary"   -H "Content-Type: application/json"   -d "{"text":"Summarize the recent history of Türkiye in three sentences."}"
```

**API example (Windows PowerShell):**
```powershell
curl.exe -s -X POST "http://localhost:3000/api/summary" `
  -H "Content-Type: application/json" `
  -d '{"text":"Summarize the recent history of Türkiye in three sentences."}'
```

Expected response:
```json
{"summary":"Sentence 1. Sentence 2. Sentence 3."}
```

---

## 🎯 **Purpose**

The goal is to produce **stable, short, and complete** answers for the team.

- Constrain the **number of sentences with a schema**: `{ sentences: string[1..3] }`
- Force **JSON mode** with `responseMimeType: "application/json"`
- Set a **token limit** (200) to reduce truncation risk (not to control length)
- Backend **joins** the array into a single paragraph (`join(" ")`)

---

## 🧱 **Project Structure**
```
gemini-prompt-optimization/
├─ public/
│  └─ index.html        # Minimal test UI
├─ server.js            # Express API + Gemini integration
├─ package.json
└─ .env                 # GEMINI_API_KEY (do NOT commit)
```

---

## 🔌 **Endpoint**

**POST** `/api/summary`  
**Body**:
```json
{ "text": "Your text to summarize" }
```
**Response**:
```json
{ "summary": "Up to three complete sentences as one paragraph." }
```

---

## 🛠️ **Built With**

- **Node.js 18+**
- **Express**, **CORS**
- **@google/generative-ai** (Gemini SDK)
- **HTML/CSS/JavaScript** (minimal UI)

> Note: Depending on access, you can use `gemini-1.5-flash` or a 2.x model. The schema is enforced via `generationConfig.responseSchema` while output is requested in JSON with `responseMimeType: "application/json"`.

---

## 📄 **License**

Distributed under the **[MIT License](LICENSE)**.

---

## 👤 **Author**

- GitHub: **[@RucoH](https://github.com/RucoH)**