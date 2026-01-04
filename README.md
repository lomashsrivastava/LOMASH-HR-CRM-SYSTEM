# LOMASH HR CRM SYSTEM

## 🚀 Overview
**Lomash HR CRM System** is a comprehensive, AI-powered Human Resource Management platform designed to streamline the entire recruitment and employee management lifecycle. Built with a modern tech stack, it integrates specific AI capabilities for resume parsing and candidate analysis.

## 🌟 Key Features
- **Dashboard Analytics**: Real-time overview of recruitment pipelines, active jobs, and interview schedules.
- **Talent Pool Management**: centralized database for potential candidates with advanced filtering.
- **AI-Powered Insights**: 
  - Automated Resume Parsing (Python/NLP).
  - Candidate Fit Scoring.
- **Recruitment Pipeline**: Visual Kanban boards for tracking applicant status.
- **Employee Management**: Manage current staff profiles, roles, and onboarding.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management & Data**: React Hooks, Axios

### Backend
- **Framework**: Node.js & Express
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT & Bcrypt

### AI/ML Service
- **Framework**: Django (Python)
- **Libraries**: NumPy, Pandas, SpaCy
- **Function**: Dedicated microservice for NLP and data processing tasks.

## 📂 Project Structure
```bash
/
├── apps/
│   ├── frontend/   # React Client Application
│   ├── backend/    # Node.js Express API Server
│   └── ml-service/ # Python Django ML Microservice
```

## 🚀 Deployment Guide

### Frontend (Netlify)
The frontend is configured for deployment on Netlify.
1. Connect your GitHub repository.
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: URL of your deployed Backend.
   - `VITE_ML_API_URL`: URL of your deployed ML Service.

### Backend (Render/Railway)
The Node.js backend requires a process manager.
1. Connect `apps/backend` to Render/Railway.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Connection String.
   - `JWT_SECRET`: Secure secret for tokens.
   - `PORT`: (Auto-assigned by platform).

### ML Service (Render/Railway)
1. Connect `apps/ml-service`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `gunicorn core.wsgi:application`

## 👨‍💻 Author
**Lomash Srivastava**
- **GitHub**: [lomashsrivastava](https://github.com/lomashsrivastava)
- **Portfolio**: [lomash.netlify.app](https://lomash.netlify.app)

---
*Created with ❤️ by Lomash Srivastava*
