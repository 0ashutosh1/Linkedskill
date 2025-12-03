# 🔐 Google OAuth Implementation - Setup Guide

## ✅ Implementation Complete

Google OAuth has been successfully integrated into LinkedSkill. Facebook login has been removed as requested.

---

## 📋 What Was Implemented

### Backend Changes

1. **Dependencies Installed**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth 2.0 strategy
   - `express-session` - Session management

2. **Database Model Updates** (`server/models/User.js`)
   - Added `googleId` field for OAuth users
   - Made `passwordHash` optional (OAuth users don't need passwords)

3. **Passport Configuration** (`server/config/passport.js`)
   - Google OAuth strategy configured
   - Automatic user creation for new Google users
   - Account linking for existing email addresses

4. **Auth Routes** (`server/routes/auth.js`)
   - `GET /auth/google` - Initiates Google OAuth flow
   - `GET /auth/google/callback` - Handles OAuth callback, generates JWT

5. **Server Setup** (`server/index.js`)
   - Passport initialization
   - Session middleware configured

6. **Auth Controller** (`server/controllers/authController.js`)
   - Updated to handle OAuth users (no password required)
   - Login checks if user is OAuth-only

### Frontend Changes

1. **LoginPage.jsx**
   - Added OAuth callback handler (reads token from URL)
   - Removed Facebook button
   - Made Google button functional
   - Full-width Google login button with hover effects

2. **SignupPage.jsx**
   - Added OAuth callback handler
   - Removed Facebook button
   - Made Google button functional
   - Automatic onboarding trigger for OAuth users

---

## 🚀 Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: `LinkedSkill` (or your choice)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: LinkedSkill
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue"
     - Test users: Add your Google email
     - Click "Save and Continue"

5. **Configure OAuth Client ID**
   - Application type: **Web application**
   - Name: `LinkedSkill Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:4000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:4000/auth/google/callback
     ```
   - Click "Create"

6. **Copy Credentials**
   - You'll see your **Client ID** and **Client Secret**
   - Keep these safe!

### Step 2: Update Environment Variables

Open `server/.env` and replace the placeholder values:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

### Step 3: Restart Your Server

```bash
cd server
npm start
```

or if using nodemon:

```bash
npm run dev
```

### Step 4: Test the Implementation

1. **Start your frontend** (if not running):
   ```bash
   npm run dev
   ```

2. **Go to Login/Signup page**

3. **Click "Continue with Google"**

4. **You should be redirected to Google's login page**

5. **After authentication, you'll be redirected back to your app**

---

## 🔄 OAuth Flow

```
User clicks "Continue with Google"
         ↓
Frontend redirects to: http://localhost:4000/auth/google
         ↓
Server redirects to: Google OAuth page
         ↓
User logs in with Google
         ↓
Google redirects to: http://localhost:4000/auth/google/callback
         ↓
Server receives user data from Google
         ↓
Server finds or creates user in MongoDB
         ↓
Server generates JWT token
         ↓
Server redirects to: http://localhost:5173?token=<jwt>&oauth=google
         ↓
Frontend extracts token from URL
         ↓
Frontend stores token and fetches user data
         ↓
User is logged in!
```

---

## 📊 Database Schema

### User Model (MongoDB)

```javascript
{
  email: String (required, unique),
  name: String,
  phoneNo: Number (optional),
  roleId: ObjectId (ref: 'Role', optional),
  passwordHash: String (optional - not needed for OAuth users),
  googleId: String (unique, for OAuth users),
  averageRating: Number,
  totalReviews: Number,
  lastLoginDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

1. **JWT Tokens**: 7-day expiration
2. **MongoDB Storage**: All OAuth users stored in your existing database
3. **Account Linking**: If user signs up with email, then uses Google OAuth with same email, accounts are automatically linked
4. **Password Protection**: OAuth users can't login with password (will get error message to use Google)
5. **Session Security**: Express sessions for OAuth flow, then JWT for API calls

---

## 🧪 Testing Scenarios

### Scenario 1: New User with Google
- Click "Continue with Google"
- Login with Google account
- User created in MongoDB with `googleId`
- Redirected to onboarding (no `passwordHash` set)

### Scenario 2: Existing Email User with Google
- User A signs up with email/password
- User A later clicks "Continue with Google" with same email
- `googleId` is added to existing user account
- User can now login with both methods

### Scenario 3: OAuth User Tries Password Login
- User signed up with Google (no password set)
- Tries to login with email/password
- Gets error: "Please login with Google"

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Check that your Google Console redirect URIs exactly match:
```
http://localhost:4000/auth/google/callback
```

### Error: "Missing Google OAuth credentials"
**Solution**: Make sure `.env` has valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Error: "Authentication error"
**Solution**: 
1. Check MongoDB connection
2. Verify passport configuration loaded
3. Check server logs for detailed error

### Token Not Stored
**Solution**: Check browser console for errors in OAuth callback handling

### Google Login Button Not Working
**Solution**: 
1. Verify server is running on port 4000
2. Check Network tab for `/auth/google` request
3. Ensure `API_URL` in frontend is correct

---

## 📝 API Endpoints

### OAuth Endpoints

#### 1. Initiate Google Login
```
GET http://localhost:4000/auth/google
```
Redirects to Google OAuth consent screen.

#### 2. OAuth Callback (Handled by Google)
```
GET http://localhost:4000/auth/google/callback
```
Receives OAuth response, creates/finds user, generates JWT.

### Existing Endpoints (Still Work)

#### 3. Regular Signup
```
POST http://localhost:4000/auth/signup
Body: { email, password, name, phoneNo, roleId }
```

#### 4. Regular Login
```
POST http://localhost:4000/auth/login
Body: { email, password }
```

#### 5. Get Current User
```
GET http://localhost:4000/auth/me
Headers: { Authorization: "Bearer <token>" }
```

---

## 🎨 UI Changes

### Before (Both pages had 2 buttons):
```
[ Google ] [ Facebook ]
```

### After (Single full-width button):
```
[     Continue with Google     ]
```

- Removed Facebook completely
- Google button is now full-width
- Added hover effects (border color change, shadow)
- Functional click handler redirects to OAuth flow

---

## 🔧 Production Deployment

When deploying to production:

1. **Update Google Console**
   - Add production domains to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/google/callback
   ```

2. **Update Environment Variables**
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   ```

3. **Update Frontend API URL**
   - Change `API_URL` in LoginPage.jsx and SignupPage.jsx
   - Or use environment variables

4. **Enable HTTPS**
   - Set `cookie: { secure: true }` in session config

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Passport Google OAuth20 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)

---

## ✨ Features

✅ **MongoDB Integration** - All OAuth users stored in your existing database  
✅ **Account Linking** - Automatic linking if email exists  
✅ **JWT Tokens** - Consistent authentication across OAuth and regular login  
✅ **Onboarding Support** - OAuth users trigger onboarding flow  
✅ **Error Handling** - Graceful error messages for users  
✅ **Security** - Proper session and token management  
✅ **User Experience** - Seamless OAuth flow with loading states  

---

## 🎉 Success!

Your LinkedSkill app now supports Google OAuth! Users can sign up and login with their Google accounts, and all data is stored in your MongoDB database.

**Need help?** Check the troubleshooting section or review the implementation in:
- `server/config/passport.js` - OAuth strategy
- `server/routes/auth.js` - OAuth routes
- `src/components/LoginPage.jsx` - Frontend OAuth handling
- `src/components/SignupPage.jsx` - Frontend OAuth handling
