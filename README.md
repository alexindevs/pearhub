# 🍐 PearHub

**PearHub** is a fullstack SaaS platform that enables businesses to publish content and engage members through personalized feeds, tracked interactions, and detailed analytics. Built to scale, PearHub blends clean API architecture with real-time content intelligence.

---

## 🔗 Live Links

* 🔧 **Backend Docs:** [https://pearhub.mooo.com/docs](https://pearhub.mooo.com/docs)
* 🖼 **Frontend App:** [https://pearhub-frontend.vercel.app](https://pearhub-frontend.vercel.app)
* 🧠 **DB Schema:** [https://dbdocs.io/alexindevs/PearHub-Pearmonie-Assessment](https://dbdocs.io/alexindevs/PearHub-Pearmonie-Assessment)

---

## 🛠 Tech Stack

### Backend

* **Node.js** + **Express**
* **Prisma ORM** + **PostgreSQL**
* **Zod** for schema validation
* **JWT Auth** with Role-based Access
* **Swagger UI** for documentation
* **Docker-ready** via InfraBuddy

### Frontend

* **Next.js 14 (App Router)**
* **TailwindCSS**
* **ShadCN/UI** component system
* **React Context API** for auth state
* **Zustand** (optional integration ready)
* **Sonner** for notifications

---

## ✨ Features

### 🔐 Auth

* Role-based accounts: MEMBER or BUSINESS
* Signup, Login, Persistent Sessions

### 🏢 Business Module

* Business profile creation and updates
* Owner dashboard with analytics and content tools

### ✍️ Content Publishing

* Supports 4 types: TEXT, IMAGE, LINK, LONGFORM
* Markdown formatting for longform content
* Image uploads via Cloudinary

### 🧠 Feed Engine

* Personalized ranking per user, per business
* View, Like, Comment, Share, Click interactions
* Interaction-based relevance scoring

### 📈 Analytics Module

* Membership growth over time
* Top-performing content
* Engagement trend breakdowns
* Average interactions per content type
* Content type distribution
* Total and active members

### 🔮 Roadmap

* AI embeddings and vector search
* Social sharing previews with meta tags
* Pagination and search for business content

---

## 📦 Backend API Overview

| Module       | Base Route      |
| ------------ | --------------- |
| Auth         | `/auth`         |
| Business     | `/business`     |
| Content      | `/content`      |
| Interactions | `/interactions` |
| Memberships  | `/memberships`  |
| Feed         | `/feed`         |
| Analytics    | `/analytics`    |

---

## ⚡️ Feed Intelligence

The ranking system uses:

### 1. Popularity Scoring (cold start)

```ts
score = views * 0.5 + likes * 1.5 + comments * 1.0 + shares * 2.0
```

### 2. Personalized Ranking (active users)

```ts
finalScore = tagAffinity + popularity + freshnessBoost - viewedPenalty
```

* **Tag Affinity:** Based on tags of liked/commented content
* **Freshness:** Time-decay scoring
* **Penalty:** For previously viewed content

### 🚀 Future: Embeddings

* Content will be embedded using `text-embedding-ada`
* Each user will have a taste vector
* Content will be ranked using cosine similarity

---

## 📮 Setup Instructions

### 1. Clone the Monorepo

```bash
git clone https://github.com/alexindevs/pearhub-monorepo.git
cd pearhub-monorepo
```

### 2. Install Both Projects

```bash
cd pearhub-backend && npm install
cd ../pearhub-frontend && npm install
```

### 3. Backend Setup

* Create `.env`

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/pearhub
JWT_SECRET=your_secret
```

* Migrate and start dev

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 4. Frontend Setup

* Set up `.env.local` if needed (optional)
* Start frontend

```bash
npm run dev
```

---

## 👩🏾‍💻 Author

Built by [@alexindevs](https://github.com/alexindevs) for the Pearmonie technical assessment.

---

## 📝 License

MIT: Fork it, remix it, ship it 🍐
