<div align="center">
  <h1>🛡️ AgentGuard</h1>
  <p><strong>The Ultimate Evaluation & Testing Arena for LLM Agents</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.x-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Live_Execution-black.svg?style=flat-square&logo=socketdotio)](https://socket.io/)
  [![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg?style=flat-square)](https://deepmind.google/technologies/gemini/)
</div>

<br />

## 🌟 Overview

As Autonomous LLM Agents become integrated into critical infrastructure, ensuring their safety, alignment, and robustness against adversarial attacks is paramount. **AgentGuard** is a comprehensive AI evaluation platform designed to stress-test agentic workflows in a simulated sandbox environment before they hit production.

Whether you are testing for prompt injection, goal drift, or destructive tool execution, AgentGuard provides the observability and benchmarking needed to deploy AI with confidence.

---

## 🚀 Key Features

### ⚔️ Dual Agent Arena (A/B Testing)
Pit two completely different System Prompts (e.g., "The Reckless Coder" vs. "The Zero-Trust Admin") against the exact same set of dynamically generated scenarios. Watch them battle in a split-screen live view to definitively prove which safety guardrails hold up under pressure.

### 🧠 Dynamic Scenario Generation
AgentGuard intelligently analyzes your Agent's intended domain (e.g., Customer Support, DevOps, Finance) and utilizes Google Gemini to dynamically generate customized edge-cases, adversarial attacks, and happy-path scenarios tailored specifically to your tools.

### ⚡ Live Sandbox Execution (WebSockets)
Watch your agents think and act in real-time. Using **Socket.IO**, AgentGuard streams every `user_message`, `agent_reasoning`, `tool_call`, and `tool_result` directly to a beautiful, developer-friendly terminal UI. 

### 🛡️ Hybrid Resiliency & Fallback Engine
Built to survive the strictest API rate limits. AgentGuard implements an **Aggressive Retry & Instant Fallback Engine**. If the LLM provider (Gemini) blocks execution due to quota exhaustion, the backend gracefully catches the 429 error and instantly hands the execution over to our proprietary **In-Memory Mock Simulator**, ensuring uninterrupted evaluations and a flawless UX.

### 📱 Responsive & Modern UI
A meticulously crafted Claude-inspired dark theme built with React and Tailwind CSS. Fully responsive from desktop to mobile, featuring a sleek slide-out hamburger menu and animated data scorecards.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Real-time:** Socket.IO
* **AI Integration:** Google Gemini SDK (`@google/genai`)
* **Architecture:** RESTful APIs, Event-driven WebSockets, Fallback Simulation Engine

---

## 🏗️ Local Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB running locally or a MongoDB Atlas URI
* Google Gemini API Key

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/AgentGuard.git
cd AgentGuard

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Environment Variables
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agentguard
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Run the Platform
Open two terminal instances.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## 🎯 The Hackathon Vision

AgentGuard was built with a specific vision: **To bridge the gap between building an AI Agent and trusting an AI Agent.** 

During this hackathon, we tackled complex challenges including managing async LLM evaluations, preventing UI state collisions during simultaneous Dual Agent polling, and building a custom fallback simulator that kicks in exactly when API rate limits threaten to crash the evaluation suite. 

We didn't just build a wrapper; we built a robust, enterprise-ready testing framework.

---

<div align="center">
  <p>Built with ❤️ for the Hackathon</p>
</div>
