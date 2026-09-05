# AI Medical Assistant — Intelligent Healthcare Support System

> **Disclaimer:** This system is for educational and informational purposes only. It does not diagnose medical conditions, prescribe medication, or replace professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.

## Overview

AI Medical Assistant is an educational mini-project that provides AI-powered healthcare support through natural-language interaction. The application demonstrates modern full-stack development practices including REST API architecture, JWT authentication, AI service integration, and responsive UI design.

### Core Features

- **AI Medical Chatbot** — Natural-language health Q&A with AI-generated educational responses
- **Symptom Analysis** — Enter symptoms to receive possible condition categories and general guidance
- **Medical Report Explanation** — Upload medical reports (PDF/TXT) and receive simplified explanations
- **Medicine Information** — Search for general medicine information, uses, precautions, and side effects
- **Health Recommendations** — General wellness, diet, exercise, and preventive healthcare guidance

### Out of Scope

This project intentionally does **not** include: medical image analysis, skin analysis, nearby hospital search, or user history tracking.

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| JavaScript (ES2022) | Language |
| Tailwind CSS 3 | Utility-first styling |
| React Router 6 | Client-side routing |
| Axios | HTTP client |
| React Icons | Icon library |
| React Hot Toast | Toast notifications |
| React Markdown | Render AI markdown responses |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ | Runtime |
| Express.js 4 | Web framework |
| Mongoose 7 | MongoDB ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| multer | File upload handling |
| pdf-parse | PDF text extraction |
| @google/generative-ai | Google Gemini AI SDK |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |

### Database
| Technology | Purpose |
|---|---|
| MongoDB | Document database |

---

## Project Structure

```
ai-medical-assistant/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # API service layer (Axios)
│   │   ├── utils/           # Helpers, constants, validators
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── ...config files
│
├── server/                  # Express.js backend
│   ├── config/              # DB, env, CORS config
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic & AI integration
│   ├── middleware/          # Auth, validation, upload, errors
│   ├── utils/               # Error classes, parsers, prompts
│   ├── app.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google AI API key (for Gemini integration)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-medical-assistant
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | Environment: development / production |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | Token expiration (e.g., 7d) |
| `CLIENT_URL` | Frontend URL for CORS (e.g., http://localhost:5173) |
| `AI_PROVIDER` | AI provider: google or openai |
| `GOOGLE_AI_API_KEY` | Google Gemini API key |
| `AI_MODEL` | AI model name (e.g., gemini-1.5-flash) |
| `MAX_FILE_SIZE` | Max upload size in bytes (default: 10485760) |

### 5. Development Commands

**Frontend:**
```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

**Backend:**
```bash
npm run dev       # Start with nodemon (auto-restart)
npm start         # Start in production mode
```

---

## Development Status

### Current Phase: Phase 1 — Project Foundation & Scaffolding ✅

- [x] Project structure and folder architecture
- [x] Frontend: Vite + React + Tailwind CSS setup
- [x] Frontend: Routing skeleton with all pages
- [x] Backend: Express setup with middleware pipeline
- [x] Backend: API route placeholders
- [x] Backend: AI service architecture (structural only)
- [x] Environment configuration
- [x] Security foundation (CORS, rate limiting, error handling)

### Upcoming Phases

- **Phase 2** — User Authentication (JWT, bcrypt, login/register)
- **Phase 3** — Layout, Dashboard & Navigation
- **Phase 4** — AI Service Integration (Google Gemini)
- **Phase 5** — AI Medical Chatbot
- **Phase 6** — Symptom Analysis Module
- **Phase 7** — Medical Report Explanation
- **Phase 8** — Medicine Information
- **Phase 9** — Health Recommendations
- **Phase 10** — Polish & Final Review

---

## License

This project is developed for educational purposes as part of a B.Tech mini-project.
