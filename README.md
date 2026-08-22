<div align="center">
  <h1>🛡️ AgentCI</h1>
  <p><strong>The Ultimate Evaluation & Testing Arena for LLM Agents</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.x-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Live_Execution-black.svg?style=flat-square&logo=socketdotio)](https://socket.io/)
  [![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg?style=flat-square)](https://deepmind.google/technologies/gemini/)
</div>

<br />

## 🌟 Overview

As Autonomous LLM Agents become integrated into critical infrastructure, ensuring their safety, alignment, and robustness against adversarial attacks is paramount. **AgentCI** is a comprehensive AI evaluation platform designed to stress-test agentic workflows in a simulated sandbox environment before they hit production.

Whether you are testing for prompt injection, goal drift, or destructive tool execution, AgentCI provides the observability and benchmarking needed to deploy AI with confidence.

---

## 🚀 Key Features

### ⚔️ Dual Agent Arena (A/B Testing)
Pit two completely different System Prompts (e.g., "The Reckless Coder" vs. "The Zero-Trust Admin") against the exact same set of dynamically generated scenarios. Watch them battle in a split-screen live view to definitively prove which safety guardrails hold up under pressure.

### 🧠 Dynamic Scenario Generation
AgentCI intelligently analyzes your Agent's intended domain (e.g., Customer Support, DevOps, Finance) and utilizes Google Gemini to dynamically generate customized edge-cases, adversarial attacks, and happy-path scenarios tailored specifically to your tools.

### 🤖 Auto-Prompt Optimizer (Self-Healing AI)
AgentCI goes beyond just identifying vulnerabilities. If your agent fails an adversarial attack or executes a destructive action, the platform's **Auto-Prompt Optimizer** acts as an AI Security Researcher. It analyzes the failure traces and dynamically generates a heavily guarded, optimized system prompt to instantly patch the vulnerabilities. 

### 📊 Enterprise Analytics Dashboard
Post-execution, results are visualized through a highly polished React (Recharts) dashboard. It provides detailed Bar Charts mapping out pass/fail rates across different vulnerability categories (Happy Path, Edge Case, Adversarial) and animated Pie Charts breaking down the Failure Taxonomy.

### ⚡ Live Sandbox Execution (WebSockets)
Watch your agents think and act in real-time. Using **Socket.IO**, AgentCI streams every `user_message`, `agent_reasoning`, `tool_call`, and `tool_result` directly to a beautiful, developer-friendly terminal UI. 

### 🛡️ Hybrid Resiliency & Fallback Engine
Built to survive the strictest API rate limits. AgentCI implements an **Aggressive Retry & Instant Fallback Engine**. If the LLM provider (Gemini) blocks execution due to quota exhaustion, the backend gracefully catches the 429 error and instantly hands the execution over to our proprietary **In-Memory Mock Simulator**, ensuring uninterrupted evaluations and a flawless UX.

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
git clone https://github.com/your-username/AgentCI.git
cd AgentCI

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Properly setting up the environment variables is critical for deployment and local execution.

**Backend Configuration (`/server/.env`):**
See `server/.env.example` for detailed documentation on required fields (MongoDB URI, Port, Gemini API Key, etc.).

**Frontend Configuration (`/client/.env`):**
See `client/.env.example` for detailed documentation on specifying API routes (e.g. `VITE_API_URL` and `VITE_SOCKET_URL`).

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

AgentCI was built with a specific vision: **To bridge the gap between building an AI Agent and trusting an AI Agent.** 

During this hackathon, we tackled complex challenges including managing async LLM evaluations, preventing UI state collisions during simultaneous Dual Agent polling, and building a custom fallback simulator that kicks in exactly when API rate limits threaten to crash the evaluation suite. 

We didn't just build a wrapper; we built a robust, enterprise-ready testing framework.

---

<div align="center">
  <p>Built with ❤️ for the Hackathon</p>
</div>
