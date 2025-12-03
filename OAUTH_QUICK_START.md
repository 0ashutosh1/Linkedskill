# 🚀 Google OAuth - Quick Start

## Prerequisites Checklist
- [ ] Google Cloud Console account
- [ ] Server running on port 4000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected

---

## 🔑 Get Your Credentials (5 minutes)

1. **Go to**: https://console.cloud.google.com/
2. **Create Project**: "LinkedSkill"
3. **Enable API**: Google+ API
4. **Create OAuth Client**:
   - Type: Web application
   - Origins: `http://localhost:5173` and `http://localhost:4000`
   - Redirect: `http://localhost:4000/auth/google/callback`
5. **Copy**: Client ID and Client Secret

---

## ⚙️ Configuration (1 minute)

Edit `server/.env`:

```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

---

## 🎯 Test It (1 minute)

1. **Restart server**: `cd server && npm start`
2. **Open app**: http://localhost:5173
3. **Click**: "Continue with Google" button
4. **Login**: With your Google account
5. **Done**: You should be logged in!

---

## 🔍 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "redirect_uri_mismatch" | Check Google Console redirect URIs match exactly |
| "Missing credentials" | Check `.env` has valid CLIENT_ID and SECRET |
| Button doesn't work | Verify server is running on port 4000 |
| Token not stored | Check browser console for errors |

---

## 📊 What's Different Now?

**Before**: 
- Only email/password login
- Facebook button (non-functional)

**After**:
- ✅ Email/password login (still works)
- ✅ Google OAuth login (functional)
- ❌ Facebook removed
- ✅ All users stored in MongoDB
- ✅ Automatic account linking

---

## 🎨 User Experience

1. User clicks "Continue with Google"
2. Redirected to Google login
3. User approves permissions
4. Redirected back to app (logged in)
5. Onboarding starts (for new users)

**Total time**: ~10 seconds

---

## 🔐 Security

- ✅ JWT tokens (7-day expiration)
- ✅ MongoDB storage
- ✅ Account linking by email
- ✅ OAuth users can't use password login
- ✅ Session security

---

## 📁 Files Changed

**Backend:**
- `server/models/User.js` - Added googleId field
- `server/config/passport.js` - NEW: OAuth strategy
- `server/routes/auth.js` - Added OAuth routes
- `server/index.js` - Passport initialization
- `server/controllers/authController.js` - OAuth support
- `server/.env` - OAuth credentials

**Frontend:**
- `src/components/LoginPage.jsx` - OAuth callback handler
- `src/components/SignupPage.jsx` - OAuth callback handler

---

## 🆘 Need Help?

See full documentation: `GOOGLE_OAUTH_SETUP.md`

**Server logs**: Check terminal for detailed OAuth flow logs
**Browser console**: Check for frontend errors
**Network tab**: Verify `/auth/google` redirect

---

## ✨ Done!

Your app now supports Google OAuth with MongoDB storage! 🎉
