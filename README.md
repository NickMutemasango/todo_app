# 📝 TodoApp — Full-Stack Authentication & Task Manager

A full-stack To-Do application with a complete JWT authentication system, protected routes, and a clean modern UI with dark mode support.

---

## 🚀 Live Demo

> Deploy the backend on [Railway](https://railway.app) and the frontend on [Vercel](https://vercel.com) following the setup guide below.

---

## ✨ Features

- 🔐 **Authentication** — Register, login, and logout with JWT tokens
- 🛡️ **Protected Routes** — Dashboard only accessible to authenticated users
- ✅ **Todo CRUD** — Create, complete, and delete your personal todos
- 🌗 **Dark Mode** — Toggle between light and dark theme, saved to localStorage
- 📊 **Progress Bar** — Visual indicator of how many todos are completed
- 🔍 **Filter Tabs** — View All / Active / Done todos
- ⚡ **Loading States** — Spinners on all async actions
- ⚠️ **Error Handling** — Clear messages for invalid credentials, 401s, and more
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | REST API framework |
| [PyJWT](https://pyjwt.readthedocs.io/) | JWT token creation & verification |
| [bcrypt](https://pypi.org/project/bcrypt/) | Secure password hashing |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server |
| [python-dotenv](https://pypi.org/project/python-dotenv/) | Environment variable management |

### Frontend
| Tool | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript (strict mode) |
| [TailwindCSS](https://tailwindcss.com/) | Utility-first styling |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [Vite](https://vitejs.dev/) | Build tool & dev server |

---

## 📁 Project Structure

```
todo-auth-app/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, middleware
│   ├── requirements.txt
│   ├── .env.example
│   ├── Procfile                # Railway deployment
│   ├── railway.toml
│   ├── auth/
│   │   ├── jwt_handler.py      # Token creation & decoding
│   │   └── dependencies.py     # get_current_user dependency
│   ├── models/
│   │   ├── user.py             # User schemas + in-memory store
│   │   └── todo.py             # Todo schemas + in-memory store
│   ├── routers/
│   │   ├── auth.py             # POST /auth/register, POST /auth/login
│   │   └── todos.py            # GET /protected + full CRUD /todos
│   └── utils/
│       └── logger.py           # File + console logging (app.log)
│
└── frontend/
    ├── index.html
    ├── vercel.json             # Vercel SPA routing
    ├── vite.config.ts          # Dev proxy to backend
    ├── tailwind.config.js
    └── src/
        ├── App.tsx             # Routes & providers
        ├── main.tsx
        ├── index.css           # Tailwind + custom component classes
        ├── context/
        │   ├── AuthContext.tsx  # JWT & user state
        │   └── ThemeContext.tsx # Dark/light mode
        ├── services/
        │   └── api.ts          # Axios instance + typed API calls
        ├── components/
        │   ├── Navbar.tsx       # Dark mode toggle + nav links
        │   ├── PrivateRoute.tsx # Redirects unauthenticated users
        │   └── Spinner.tsx
        └── pages/
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            └── DashboardPage.tsx  # Todos + protected data
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/NickMutemasango/todo_app.git
cd todo-auth-app
```

### 2. Run the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Edit .env and set a strong SECRET_KEY

# Start the server
python main.py
# → API running at http://localhost:8000
# → Swagger docs at http://localhost:8000/docs
```

### 3. Run the Frontend

```bash
# In a new terminal
cd frontend

npm install
npm run dev
# → App running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start adding todos.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/auth/register` | — | `{ username, password }` | Create a new account |
| `POST` | `/auth/login` | — | `{ username, password }` | Returns JWT token |

### Todos & Protected

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `GET` | `/protected` | ✅ | — | Returns welcome message for authenticated user |
| `GET` | `/todos` | ✅ | — | List all your todos |
| `POST` | `/todos` | ✅ | `{ title, description? }` | Create a todo |
| `PUT` | `/todos/:id` | ✅ | `{ title?, description?, completed? }` | Update a todo |
| `DELETE` | `/todos/:id` | ✅ | — | Delete a todo |
| `GET` | `/health` | — | — | Health check |

---

## 🧪 Sample curl Requests

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123"}'

# Login — grab your token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "secret123"}'

# Access protected route
curl http://localhost:8000/protected \
  -H "Authorization: Bearer <your_token>"

# Create a todo
curl -X POST http://localhost:8000/todos \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk and eggs"}'

# List todos
curl http://localhost:8000/todos \
  -H "Authorization: Bearer <your_token>"

# Mark as complete
curl -X PUT http://localhost:8000/todos/<todo_id> \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://localhost:8000/todos/<todo_id> \
  -H "Authorization: Bearer <your_token>"
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | — | **Required.** Long random string used to sign JWTs |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime in minutes |

---

## 🎨 UI Overview

| Page | Route | Access |
|---|---|---|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | 🔐 Authenticated only |

The **Dashboard** page:
- Fetches `GET /protected` on load and displays a personalised welcome banner
- Shows all your todos with filter tabs (All / Active / Done)
- Progress bar tracks completion percentage
- Todos appear instantly on add; delete button reveals on hover

---

## 📄 License

MIT — feel free to use this project however you like.
