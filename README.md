# 🍐 PearHub

**PearHub** is a full‑stack SaaS platform that lets businesses publish content and engage members through personalised feeds, tracked interactions, and detailed analytics.
Built to scale, PearHub blends a clean REST API, a modern Next.js frontend, and a lightweight **AI recommendation micro‑service** – all wired together with Docker‑first DevOps.

---

## 🔗 Live Links

| Area               | URL                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **Backend Docs**   | [https://pearhub.mooo.com/docs](https://pearhub.mooo.com/docs)                                                         |
| **Frontend App**   | [https://pearhub-frontend.vercel.app](https://pearhub-frontend.vercel.app)                                             |
| **DB Schema**      | [https://dbdocs.io/alexindevs/PearHub-Pearmonie-Assessment](https://dbdocs.io/alexindevs/PearHub-Pearmonie-Assessment) |
| **AI Ranker Docs** | *coming soon* – FastAPI Swagger on port **9000** when you `docker compose up`                                          |

---

## 🛠 Tech Stack

| Layer         | Tech                                     | Notes                               |
| ------------- | ---------------------------------------- | ----------------------------------- |
| **Backend**   | **Node.js + Express** · TypeScript       | REST API, JWT auth, Zod validation  |
|               | Prisma ORM + PostgreSQL                  | Typed models & migrations           |
|               | Swagger UI                               | Auto‑generated docs                 |
| **Frontend**  | **Next.js 14** (App Router) · TypeScript | CSR/SSR mix                         |
|               | TailwindCSS · ShadCN/UI                  | Design system                       |
|               | React Context API                        | Auth state                          |
|               | Zustand *(optional)*                     | Global store ready                  |
| **AI Engine** | **Python 3.12 + FastAPI**                | Stateless recommender micro‑service |
|               | OpenAI `text‑embedding‑ada‑002`          | Content & taste vectors             |
|               | NumPy                                    | Cosine similarity maths             |
| **DevOps**    | Docker & docker‑compose                  | One‑command spin‑up                 |
|               | GitHub Actions (via InfraBuddy)          | CI / CD pipeline templates          |

---

## ✨ Feature Highlights

### 🔐 Auth

* JWT‑based sessions
* Role‑based access: **MEMBER** or **BUSINESS**

### 🏢 Business Module

* Create & update business profiles
* Owner dashboard with analytics + content tools

### ✍️ Content Publishing

* Four post types: **TEXT · IMAGE · LINK · LONGFORM**
* Markdown support for longform
* Image uploads via Cloudinary

### 🧠 Feed Intelligence (V1)

PearHub ships with a **hybrid recommendation pipeline**:

1. **Cold‑start Popularity**
   `score = (views × 0.5) + (likes × 1.5) + (comments × 1.0) + (shares × 2.0)`
2. **Personalised Ranking** for active users
   `finalScore = tagAffinity + popularity + freshnessBoost − viewedPenalty`

   * Tag affinity from user interactions
   * Freshness = 7‑day half‑life decay
   * Viewed penalty keeps the feed fresh

### 🧠 AI Ranker Micro‑service (V2 – **implemented for this assessment**)

* **Stateless FastAPI** endpoint `POST /rank` – send up to **100** posts + all user interactions
* On‑the‑fly OpenAI embeddings → 1 536‑dim vectors
* Interaction weights    `VIEW 1 · LIKE 3 · COMMENT 2 · SHARE 5`
* 3‑day decay function: `0.5^(ageDays/3)`
* Cosine similarity sorts content, returns `[ { content_id, score }, … ]`
* Embeddings are memo‑cached in‑process; container restarts simply re‑embed.

> **Road‑map** – drop‑in upgrade to a persistent vector store (pgvector or Chroma) when scale demands.

### 📈 Analytics Dashboard

* Membership growth
* Engagement funnels & top‑performing content
* Interaction averages per post type

---

## 📦 Backend API Overview

| Module       | Base Route      |
| ------------ | --------------- |
| Auth         | `/auth`         |
| Business     | `/business`     |
| Content      | `/content`      |
| Interactions | `/interactions` |
| Memberships  | `/memberships`  |
| Feed         | `/feed`         |
| Analytics    | `/analytics`    |

Full Swagger JSON at `/docs`.

---

Absolutely — here's your ✨ **fully updated setup instructions**, reflecting how the monorepo is structured now, including the backend, frontend, and AI ranker services:

---

## 🚀 Setup Instructions

> **Clone once, run anywhere.** Everything is containerized. Local development with a Python virtual env is also supported for the AI engine.

---

### 1 · Clone the monorepo

```bash
git clone https://github.com/alexindevs/pearhub.git
cd pearhub
```

---

### 2 · Install Node projects

```bash
cd apps/backend && npm install
cd ../frontend && npm install
```

---

### 3 · Spin up Postgres + Backend API

From the repo root:

```bash
docker compose -f docker/backend-compose.yml up -d
```

Create `.env` inside `apps/backend/`:

```env
DATABASE_URL=postgresql://username:password@host:5432/db
RANKER_URL=http://ranker:8000
JWT_SECRET=notasecret
POSTGRES_USER="username"
POSTGRES_PASSWORD="password"
POSTGRES_DB=db
```

Then run:

```bash
cd apps/backend
npx prisma generate    # prisma generate
npx prisma migrate dev    # prisma migrate dev
npm run dev            # starts backend API on localhost:4000
```

---

### 4 · Start the frontend

```bash
cd apps/frontend
npm run dev            # runs on localhost:3000
```

---

### 5 · Start the AI Ranker (pick one)

#### a) 🐳 **Docker (Recommended)**

```bash
cd apps/recommender-engine
export OPENAI_API_KEY=sk-•••
docker compose --env-file .env up --build -d   # exposes localhost:9000 → container:8000
```

> Uses `compose.yml` internally and auto-maps ports

#### b) 🐍 **Local Python virtual env**

```bash
cd apps/recommender-engine
python3 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
export OPENAI_API_KEY=sk-•••
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### ℹ️ Ranker URL Config

NestJS backend reads the ranker URL from `RANKER_URL` in `.env`.

* Inside Docker: `http://ranker:8000`
* Local dev: `http://localhost:9000`

## ⚡️ Architectural Schematic

<!-- ```mermaid
graph TD
  subgraph Backend
    A[NestJS API]
    B[PostgreSQL]
  end
  subgraph AI
    C[FastAPI Ranker]
  end
  A -- REST /rank --> C
  A -- Prisma --> B
  C -. returns IDs .-> A

``` -->

---

## 👩🏾‍💻 Author

Built by [**@alexindevs**](https://github.com/alexindevs) for the [**Pearmonie Technical Assessment**](https://pearmonie.com), but architected to be a production‑ready creator platform. 🍐✨

---

## 📝 License

MIT – fork it, remix it, ship it.
