# Coursue - Simple Auth API

This folder contains a minimal Express-based authentication API for the frontend. It uses MongoDB (via Mongoose) to store users.

Endpoints:
- POST /auth/signup { email, password, name? } -> { token, user }
- POST /auth/login { email, password } -> { token, user }
- GET /auth/me (Authorization: Bearer <token>) -> { id, email, name }

To run:

1. cd server
2. npm install
3. Set your MongoDB Atlas connection string (or use local MongoDB)
4. npm run dev

Environment variables:
- MONGODB_URI (optional) — MongoDB connection string
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/coursue`
  - Local MongoDB: `mongodb://127.0.0.1:27017/coursue-dev` (default)
- JWT_SECRET (optional) — JWT signing secret, defaults to a development secret

**For MongoDB Atlas users:**
```powershell
$env:MONGODB_URI = "your-mongodb-atlas-connection-string"
npm run dev
```

Make sure to:
- Replace `<password>` in your Atlas connection string with your actual password
- Whitelist your IP address in Atlas Network Access settings
- Use the connection string format: `mongodb+srv://...`

This server is intentionally small for local development. For production, secure secrets, use TLS, and pick a managed database.
