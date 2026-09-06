# AI Medical Assistant — Intelligent Healthcare Support System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> ⚠️ **Important Medical Disclaimer:** This software is developed strictly for **educational and informational purposes**. It does not diagnose medical conditions, prescribe treatment or medication, or replace consultation with licensed medical practitioners. In case of medical emergencies, please immediately contact your local emergency services (e.g., 911 / 112 / 108).

---

## 🌟 Overview

**AI Medical Assistant** is a full-stack, intelligent healthcare support web application powered by **Google Gemini AI**. It bridges the communication gap between complex medical terminology and patients by offering accessible, plain-language insights, symptom triage guidance, medical report interpretations, drug information, and lifestyle recommendations.

Designed with modern full-stack best practices, it includes secure JWT authentication, rate limiting, responsive mobile-first UI with **Light/Dark mode**, and strict medical safety guardrails.

---

## ✨ Key Features

- **🤖 AI Medical Chatbot**
  - Conversational, multi-turn medical Q&A with real-time response rendering.
  - Formats clinical terminology into clear, digestible patient guidance.
  - Quick-start prompts for common medical inquiries and one-click chat clearing.

- **🔍 Symptom Analysis & Triage**
  - Multi-factor input (symptoms, duration, severity, age group).
  - Categorizes potential conditions, urgency level (Low / Medium / High / Emergency).
  - Automated detection of critical "red flag" symptoms requiring immediate emergency care.

- **📄 Medical Report Explanation**
  - Direct upload and extraction of laboratory reports and clinical notes (`.pdf`, `.txt`).
  - Summarizes key findings, normal/abnormal test ranges, and suggests actionable questions to ask your doctor.

- **💊 Medicine Information Directory**
  - Search any generic or brand-name drug for clear clinical summaries.
  - Detailed overview of indications, standard dosage precautions, mechanism, side effects, and drug interactions.

- **🥗 Personalized Health & Lifestyle Recommendations**
  - Tailored health advice based on age, gender, activity level, health goals, and chronic conditions.
  - Covers nutrition, physical exercise regimens, preventive screenings, and sleep hygiene.

- **🌓 Dark & Light Mode Theme Support**
  - Fully integrated dark mode with Tailwind CSS and CSS variables.
  - Persists user theme preference seamlessly across sessions.

- **🔒 Security & Performance**
  - JWT token authentication with bcrypt password hashing.
  - Rate limiting on API endpoints to prevent abuse.
  - Strict CORS policy and structured error handling.

---

## 🛠️ Technology Stack

### Frontend
- **Framework & Tooling:** React 18, Vite 5
- **Styling:** Tailwind CSS 3, Custom CSS Theme Variables
- **Routing:** React Router DOM 6
- **HTTP Client:** Axios with JWT request/response interceptors
- **Icons & UI:** React Icons (`react-icons/hi2`), React Hot Toast
- **Markdown:** React Markdown for rendering AI responses

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4
- **Database:** MongoDB via Mongoose 7
- **AI Integration:** `@google/generative-ai` (Google Gemini Flash & Pro models)
- **Document Parsing:** `pdf-parse`, `multer`
- **Security:** `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `cors`

---

## 📁 Project Structure

```text
ai-medical-assistant/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/              # Branding & images
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/            # Protected route guards
│   │   │   └── layout/          # Sidebar, Navbar, AppLayout
│   │   ├── contexts/            # AuthContext & ThemeContext
│   │   ├── pages/               # Dashboard, Chat, Symptoms, Reports, Medicine, Health
│   │   ├── services/            # Axios API services
│   │   ├── utils/               # Constants, formatters, validators
│   │   ├── App.jsx              # Route definitions
│   │   ├── index.css            # Tailwind & theme stylesheets
│   │   └── main.jsx             # Entry point
│   ├── .env.example             # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Express.js REST API Backend
│   ├── config/                  # DB, CORS, & environment setup
│   ├── controllers/             # Auth, Chat, Symptoms, Reports, Medicine, Health
│   ├── middleware/              # JWT auth, multer, rate-limiting, error handling
│   ├── models/                  # Mongoose User model
│   ├── routes/                  # Express route routers
│   ├── services/
│   │   └── ai/                  # Gemini AI service, factory & safety guardrails
│   ├── utils/                   # AppError, prompt templates, file parsers
│   ├── .env.example             # Backend environment template
│   ├── app.js                   # Express application setup
│   ├── server.js                # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas cluster](https://www.mongodb.com/atlas)
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ravi-61/AI-Medical-Assistant.git
cd AI-Medical-Assistant
```

---

### Step 2: Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and fill in your values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ai_medical_assistant
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173

   # AI Configuration
   AI_PROVIDER=google
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-flash-lite-latest
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the client environment file:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `VITE_API_URL=/api` which leverages the built-in Vite dev proxy to localhost:5000).*

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch current user profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |
| `POST` | `/api/chat/message` | Send medical question to AI chatbot | Yes |
| `POST` | `/api/symptoms/analyze` | Submit symptoms for assessment | Yes |
| `POST` | `/api/reports/analyze` | Upload and analyze medical report (PDF/TXT) | Yes |
| `GET` | `/api/medicine/search` | Search medicine knowledge base | Yes |
| `POST` | `/api/health/recommendations` | Generate personalized lifestyle tips | Yes |

---

## 🛡️ Medical Safety Guardrails

The application enforces automated safety checks on all AI prompts and outputs:
- Every output begins or ends with an explicit medical disclaimer.
- Red-flag detection alerts the user immediately if emergency keywords (e.g., chest pain, shortness of breath, sudden numbness) are detected.
- Never suggests specific prescription dosages or contradicts emergency protocols.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
