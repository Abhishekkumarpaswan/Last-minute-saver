# Last-Minute Life Saver

AI-powered productivity companion — MERN + Python FastAPI + Groq

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **AI Service**: Python FastAPI + Groq (llama-3.3-70b-versatile)
- **Auth**: JWT (email + password)

## Project Structure
```
last-minute-lifesaver/
├── client/          # React + Vite frontend
├── server/          # Node/Express REST API
├── ai-service/      # Python FastAPI + Groq
└── docker-compose.yml
```

## Quick Start (Local Dev)

### 1. MongoDB
Make sure MongoDB is running locally on port 27017, or use MongoDB Atlas.

### 2. AI Service (Python)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # add your GROQ_API_KEY
uvicorn main:app --reload --port 3400
```

### 3. Server (Node/Express)
```bash
cd server
npm install
cp .env.example .env            # fill in values
npm run dev
```

### 4. Client (React)
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

App runs at http://localhost:5173

## Environment Variables

### ai-service/.env
```
GROQ_API_KEY=your_groq_api_key_here
```

### server/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/lifesaver
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:3400
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

## API Overview

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Tasks
- GET    /api/tasks
- POST   /api/tasks
- PUT    /api/tasks/:id
- DELETE /api/tasks/:id

### Habits
- GET  /api/habits
- POST /api/habits
- PUT  /api/habits/:id/log

### AI (proxied through Express → FastAPI)
- POST /api/ai/micro-plan
- POST /api/ai/prioritize
- POST /api/ai/voice-assist
