# RaithaSetu AI - Machine Learning & Scoring System

This directory contains AI and scoring logic for RaithaSetu AI:

1. **`worker_recommendation/`**: Multi-factor scoring algorithm for matching agricultural labor with job requirements based on skill similarity, spatial distance decay, user rating, availability status, and work experience.
2. **`wage_estimation/`**: Transparent fair wage benchmark estimator considering crop task complexity and location.

> **Note on AI Implementation**:
> Per project guidelines, RaithaSetu AI transparently distinguishes between **weighted decision-support scoring engines** (currently implemented for worker matching and baseline wage calculation) and **trained supervised ML models** (which can plug into the Python service when full historical agricultural datasets are loaded).
