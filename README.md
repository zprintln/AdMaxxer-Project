

# AdMaxxer 🚀

AdMaxxer is a fullstack web application designed to help content creators, manage, and optimize advertising campaigns efficiently.

https://ad-maxxer.lovable.app/

Built with a modern tech stack for scalability and rapid development.

---

## 🛠 Tech Stack

* **Frontend:** React, Vercel
* **Backend:** Node.js + Express
* **Database:** PostgreSQL
* **Containerization:** Docker & Docker Compose
* **Technologies:** Vercel MiniMax, Bem, Replit, Runloop

---

## 📦 Features (Planned / MVP)

* User authentication
* Campaign creation & management
* Budget tracking
* Performance analytics dashboard
* REST API backend
* Scalable Dockerized environment

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd admaxxer
```

### 2️⃣ Setup environment variables

Create a `.env` file (use `.env.example` if provided):

```
POSTGRES_USER=youruser
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=admaxxer
DATABASE_URL=postgresql://youruser:yourpassword@db:5432/admaxxer
```

### 3️⃣ Start the application

```bash
docker-compose up --build
```

### 4️⃣ Access the app

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000](http://localhost:8000)

---

## 🧱 Project Structure

```
admaxxer/
│
├── frontend/        # React app
├── backend/         # Express API
├── docker-compose.yml
└── README.md
```

---

## 🛑 Stopping the App

```bash
docker-compose down
```

---

## 🧪 Development Notes

* Make sure Docker Desktop is running.
* Node modules and environment files are ignored via `.gitignore`.
* All services run inside Docker containers.

---

## 📈 Roadmap

* [ ] Campaign performance metrics
* [ ] Real-time analytics
* [ ] Role-based access control
* [ ] Payment integration
* [ ] Deployment pipeline

---

## 📄 License

MIT License

