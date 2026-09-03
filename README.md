# 🌾 RaithaSetu AI
## Smart Agricultural Workforce & Marketplace Platform

RaithaSetu AI is a smart agriculture platform designed to connect farmers, agricultural workers, traders/buyers, and agro-store users through a unified digital platform.

The platform brings together agricultural workforce management, crop marketplace services, location-aware functionality, AI-assisted agricultural guidance, and English/Kannada support in one place.

---

## 🚀 Live Application

- 🌐 **Live Website:** [https://raithasetu-frontend-new.onrender.com](https://raithasetu-frontend-new.onrender.com)
- ⚙️ **Backend API:** [https://raithasetu.onrender.com/](https://raithasetu.onrender.com/)
- 💻 **GitHub Repository:** [https://github.com/Srinivash333/RaithaSetu](https://github.com/Srinivash333/RaithaSetu)

---

## 🎯 The Problem

Agricultural activities often depend on disconnected methods for finding workers, discovering employment opportunities, connecting farmers with crop buyers, purchasing agricultural products, and accessing reliable farming-related information.

Farmers may struggle to find suitable workers at the right time, while agricultural workers may have difficulty discovering relevant work opportunities.

Similarly, farmers need better ways to connect with buyers for their harvested crops, and agricultural users need convenient access to farming products and guidance.

RaithaSetu addresses these challenges by bringing these agricultural services together into one connected digital platform.

---

## 💡 Our Solution

RaithaSetu connects different participants of the agricultural ecosystem through role-based services:

- **👨‍🌾 Farmers** — Post agricultural jobs, discover suitable workers, manage worker-related activities, list harvested crops, connect with buyers, negotiate crop prices, and access AI-powered agricultural assistance.
- **👷 Agricultural Workers** — Create and manage profiles, discover suitable agricultural jobs, receive job offers, view job details, accept or decline offers, and manage job-related activities.
- **💼 Traders / Buyers** — Discover available agricultural crops, view crop listings, make price offers, submit counter-offers, negotiate with farmers, and confirm crop deals.
- **🏪 Agro Stores** — List agricultural products and manage product information (seeds, fertilizers, pesticides, farming tools).
- **🤖 AI Assistant** — Includes RaithaMitra, an AI-powered agricultural assistant that helps users with farming-related questions and crop-related guidance.

---

## ✨ Key Features

### 🤝 Agricultural Workforce Matching
RaithaSetu helps farmers discover suitable agricultural workers using multiple relevant factors, including:
- Skills
- Location and distance
- Availability
- Worker rating
- Experience
- Job suitability

The platform ranks workers based on their overall suitability for a particular agricultural task.

### 👷 Worker Job Management
Workers can interact with agricultural job opportunities through the platform:
- Job discovery
- Job details
- Worker job offers
- Accept / decline actions
- Job status management
- Job-related history

### 🌾 Crop Marketplace
Farmers can list their harvested crops and make them discoverable to registered buyers. Crop listings provide relevant information needed by buyers to evaluate available agricultural produce.

### 💰 Offer & Negotiation System
The platform supports interaction between farmers and buyers through:
- Price offers
- Counter-offers
- Multiple rounds of negotiation
- Deal confirmation

This provides a structured digital workflow for crop price negotiation.

### 🏪 Agro-Store Marketplace
Agro-store users can list agricultural products such as:
- 🌱 Seeds
- 🧪 Fertilizers
- 🌿 Pesticides
- 🛠️ Farming tools

The marketplace provides a digital space for agricultural product discovery.

### 📍 Location-Based Services
Uses location information to support relevant agricultural services and worker discovery. Location-aware functionality helps connect users based on their geographical context.

### 🌐 English & Kannada Support
The platform provides bilingual support in:
- 🇬🇧 English
- 🇮🇳 Kannada

This helps make the platform more accessible to users in Karnataka.

### 🔐 Authentication & Security
The application uses:
- JWT-based authentication
- bcrypt password hashing
- Role-based access control
- Environment variables for sensitive configuration

Sensitive credentials such as API keys, database credentials, and JWT secrets are kept outside the source code.

---

## 🤖 AI & Intelligent Features

### 🧠 1. Intelligent Worker Matching
RaithaSetu uses a multi-factor weighted scoring approach to evaluate and rank worker suitability. The scoring considers factors such as:
- Skill compatibility
- Location and distance
- Worker rating
- Experience
- Availability

This provides an intelligent decision-support mechanism for connecting farmers with suitable workers.

### 💰 2. Task & Region-Based Wage Benchmark Estimator
The platform provides an algorithm-assisted wage benchmark based on factors such as:
- Type of agricultural work
- Task complexity
- Work duration
- Regional wage considerations

This helps provide a reference point when determining agricultural labour wages.

### 🌱 3. RaithaMitra AI Assistant
RaithaMitra is an AI-powered agricultural assistant integrated with the Google Gemini API. It can assist users with topics including:
- Crop care
- Soil health
- Fertilizers
- Pest and disease-related questions
- Organic farming
- General agricultural guidance
- Crop and leaf image-based analysis

The assistant provides conversational agricultural support directly within the platform.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| 🎨 **Frontend** | React, Vite, Tailwind CSS, Context API, Lucide Icons |
| ⚙️ **Backend** | Node.js, Express.js |
| 🗄️ **Database** | MongoDB, Mongoose, MongoDB Atlas |
| 🤖 **AI** | Google Gemini API |
| 🧠 **Intelligent Algorithms** | Multi-factor worker scoring, skill similarity, distance-based scoring, rating and experience factors, wage estimation |
| 🔐 **Authentication** | JWT, bcrypt |
| ☁️ **Deployment** | Render, MongoDB Atlas |

---

## 📁 Project Structure

```text
RaithaSetu/
├── backend/       # Node.js + Express backend
├── frontend/      # React + Vite frontend
├── ml/            # Machine learning and recommendation-related work
├── docs/          # Project documentation
├── .env.example   # Environment configuration template
├── .gitignore     # Git ignore configuration
└── README.md      # Project documentation
```

---

## ⚙️ Local Development

### Prerequisites
Make sure the following are installed:
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- MongoDB or MongoDB Atlas

### 1. Clone the Repository
```bash
git clone https://github.com/Srinivash333/RaithaSetu.git
cd RaithaSetu
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file using `.env.example` and configure the required environment variables. Then start the backend:
```bash
node server.js
```
The backend runs on the configured server port.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will display the local development URL in the terminal.

### 🔒 Environment Variables
Do not commit sensitive information to GitHub. Keep the following types of information inside `.env`:
- Database credentials
- JWT secrets
- Gemini API keys
- Email credentials
- Other private API credentials

The repository includes `.env.example` as a configuration reference. Never commit `.env`, passwords, API keys, database credentials, or other sensitive information to GitHub.

---

## ☁️ Deployment

RaithaSetu is deployed using cloud services for the application and database.

- **Frontend:** Render Static Site — [https://raithasetu-frontend-new.onrender.com/farmer-dashboard](https://raithasetu-frontend-new.onrender.com/farmer-dashboard)
- **Backend:** Render Web Service — [https://raithasetu.onrender.com/](https://raithasetu.onrender.com/)
- **Database:** MongoDB Atlas Cloud Cluster

---

## 🔄 Platform Workflow

```text
┌─────────────────────────────────────────────────────────┐
│                       RaithaSetu                        │
│             Smart Agriculture Platform                  │
└────────────────────────────┬────────────────────────────┘
                             │
     ┌──────────────┬────────┼────────┬──────────────┐
     │              │        │        │              │
     ▼              ▼        ▼        ▼              ▼
  Farmers        Workers  Traders Agro Stores   RaithaMitra
     │              │        │        │              │
     ▼              ▼        ▼        ▼              ▼
  Jobs &          Job      Crop    Products          AI
 Workers        Offers  Marketplace Marketplace Assistance
     │              │        │        │              │
     └──────────────┴────────┴────────┴──────────────┘
                             │
                             ▼
            Connected Agricultural Ecosystem
```

---

## 🌍 Vision

Connect the people, work, products, and information that power agriculture.

RaithaSetu aims to make agricultural services more connected and accessible by bringing farmers, workers, buyers, agro stores, and intelligent agricultural assistance together through a single digital platform.

---

## 👨‍💻 About RaithaSetu

RaithaSetu AI was built to address practical challenges in the agricultural ecosystem through technology.

The project combines:
- Full-stack web development
- Agricultural workforce management
- Marketplace functionality
- Intelligent worker matching
- AI-assisted agricultural guidance
- Location-aware services
- Multilingual support
- Cloud deployment

into one integrated agricultural platform.

---

🌾 **RaithaSetu AI** — *Smart technology for a more connected agricultural ecosystem.*
