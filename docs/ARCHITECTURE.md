# System Architecture - RaithaSetu AI

RaithaSetu AI follows a modular MERN architecture with an integrated Python ML baseline service.

```
                           ┌───────────────────────────────┐
                           │      Vite + React Client      │
                           │  Tailwind CSS • EN/KN i18n    │
                           └───────────────┬───────────────┘
                                           │ REST / JSON
                                           ▼
                           ┌───────────────────────────────┐
                           │     Express REST API Server   │
                           │   JWT Auth • Geo Controllers  │
                           └───────┬───────────────┬───────┘
                                   │               │
                                   ▼               ▼
                           ┌──────────────┐ ┌──────────────┐
                           │ MongoDB Atlas│ │ Gemini API / │
                           │ 2dsphere Geo │ │ Python Engine│
                           └──────────────┘ └──────────────┘
```

## Modular Layering
- **Client Layer**: Pure React functional components utilizing Context API (`AuthContext`, `LanguageContext`, `LocationContext`) for state isolation.
- **Service Layer**: Business logic separated from Express routes into dedicated service handlers (`recommendationEngine.js`).
- **Database Layer**: MongoDB Mongoose schemas with 2dsphere indexing on spatial location attributes (`[longitude, latitude]`).
