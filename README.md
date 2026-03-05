# Biometric AI – Intelligent Biological Pattern Recognition

An industry-standard AI project utilizing Computer Vision and Machine Learning to analyze human palm biological patterns for behavioral profiling and cognitive modeling.

## 🚀 Key Capabilities
- **Biometric Extraction**: Real-time palm feature analysis using OpenCV-based digital image processing.
- **Behavioral Modeling**: Advanced inference engine for generating cognitive, emotional, and career profiles.
- **AI Interaction**: Context-aware analysis assistant for interpreting complex biometric datasets.
- **Technical Reporting**: Automated generation of comprehensive PDF analysis reports.
- **Data Persistence**: Longitudinal tracking of biometric indices using MongoDB.

## 🛠️ Technology Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Vite
- **Backend**: FastAPI, Python 3.12, Motor (Async MongoDB)
- **AI/CV**: OpenCV, NumPy, Pillow
- **Database**: MongoDB

## 📦 Installation & Deployment

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB Instance

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Configure `.env` from `.env.example`
4. Start server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Start development server: `npm run dev`

## 📊 System Workflow
1. **Acquisition**: Image capture via high-resolution webcam or file upload.
2. **Preprocessing**: Grayscale conversion and Gaussian noise reduction.
3. **Segmentation**: ROI-based segmentation for vitality, cognitive, and emotional mapping.
4. **Inference**: Rule-based mapping of edge density to behavioral archetypes.
5. **Output**: Multi-dimensional visualization and technical PDF reporting.

## 📁 Project Architecture
```
BIOMETRIC-AI/
├── backend/                  # API & Logic Core
│   ├── main.py               # FastAPI Entry Point
│   ├── ai_engine.py          # CV & Feature Extraction
│   └── users.json            # Seed Data
├── frontend/                 # User Interface
│   ├── src/
│   │   ├── pages/            # Dashboard, Analysis, Profile, etc.
│   │   └── components/       # Layout & Reusable UI
│   └── tailwind.config.js    # Design System Configuration
└── PROJECT_REPORT.md         # Technical Documentation
```

---
*Developed for academic evaluation in the field of Biometric Artificial Intelligence.*
