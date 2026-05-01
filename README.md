# Pen Academy School Management System

A web-based school management system built for Pen Academy.

## Features
- 👨‍🎓 Student & fees management
- 📋 Attendance tracking
- 📊 Results & report card generation
- 📱 SMS parent notifications (Africa's Talking)

## Tech Stack
- **Backend:** Django + Django REST Framework
- **Frontend:** React + Tailwind CSS
- **Database:** PostgreSQL
- **SMS:** Africa's Talking

## Project Structure
- `/backend` — Django REST API
- `/frontend` — React SPA

## Setup
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```