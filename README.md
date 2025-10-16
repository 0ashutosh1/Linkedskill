# LinkedSkill - Learning Platform

A modern learning platform built with React + Vite + Tailwind CSS frontend and Express + MongoDB backend with JWT authentication.

## 🚀 Quick Start

### Frontend Setup (Windows PowerShell)

1. Install dependencies

```powershell
cd "c:\Users\kumar\OneDrive\Documents\CODE\Coursue"
npm install
```

2. Run dev server

```powershell
npm run dev
```

Open http://localhost:5173 in your browser.

### Backend Setup

See [server/README.md](./server/README.md) for detailed backend setup instructions.

Quick start:

```powershell
cd server
npm install
$env:MONGODB_URI = "your-mongodb-atlas-connection-string"
npm run dev
```

The API will run on http://localhost:4000

## 🔐 Authentication

The app includes a complete authentication system:

- **Signup** (`/auth/signup`) - Create new account with email/password
- **Login** (`/auth/login`) - Authenticate existing users
- **Protected Routes** (`/auth/me`) - JWT-based authentication
- **Token Management** - Automatic token storage in localStorage

### Using Authentication in Components

```javascript
import { isAuthenticated, getCurrentUser, logout, requireAuth } from './utils/auth'

// Check if user is logged in
if (isAuthenticated()) {
  const user = getCurrentUser()
  console.log(user.email, user.name)
}

// Logout
logout()

// Protect a component/route
requireAuth() // redirects to /login if not authenticated
```

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx          # Login form with API integration
│   │   ├── SignupPage.jsx         # Signup form with API integration
│   │   ├── ProfileExample.jsx     # Example protected component
│   │   └── ...
│   ├── utils/
│   │   └── auth.js                # Auth helper functions
│   └── ...
├── server/
│   ├── index.js                   # Express server
│   ├── models/User.js             # Mongoose User model
│   ├── controllers/authController.js
│   ├── routes/auth.js
│   └── middleware/auth.js
└── ...
```

## 🔧 Features

### Frontend
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design (mobile & desktop)
- ✅ Login/Signup pages with validation
- ✅ Loading states and error handling
- ✅ JWT token management
- ✅ Auth utility helpers

### Backend
- ✅ Express REST API
- ✅ MongoDB with Mongoose
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ CORS enabled

## 🛠️ Development

### Environment Variables

**Backend** (`server/.env` optional):
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coursue
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Create new account |
| POST | `/auth/login` | No | Login existing user |
| GET | `/auth/me` | Yes | Get current user profile |

**Example Request:**
```powershell
# Signup
$body = @{ email = 'user@example.com'; password = 'pass123'; name = 'John' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:4000/auth/signup' -Method Post -Body $body -ContentType 'application/json'

# Login
$body = @{ email = 'user@example.com'; password = 'pass123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:4000/auth/login' -Method Post -Body $body -ContentType 'application/json'
```

## 📝 Notes

- Frontend runs on port 5173 (Vite default)
- Backend runs on port 4000
- CORS is enabled for local development
- Only registered users can access protected routes
- Tokens expire after 7 days

## 🎯 Next Steps

- Add password reset functionality
- Implement email verification
- Add user roles and permissions
- Create more protected routes
- Add refresh token mechanism
- Deploy to production
