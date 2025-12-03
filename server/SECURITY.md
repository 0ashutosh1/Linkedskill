# Security Guidelines

## ⚠️ IMPORTANT: Credential Security

### What Was Fixed
Your repository had hardcoded credentials in source files that have been removed. The following changes were made:

1. **Removed hardcoded MongoDB credentials** from:
   - `index.js`
   - `test-notification.js`
   - `test-rating-update.js`
   - `seed-connections.js`

2. **Sanitized `.env.example`** - removed all real credentials

3. **Verified `.env` is gitignored** - your actual credentials are safe

### Current Status ✅
- ✅ `.env` file is NOT tracked in git
- ✅ `.env` has never been committed to git history
- ✅ `.env.example` contains only placeholder values
- ✅ All source files now use environment variables only

### Critical Actions Required

#### 1. Rotate All Exposed Credentials IMMEDIATELY

Even though your `.env` file was never committed, credentials were in `.env.example` and will be in git history. **You MUST rotate these credentials:**

**MongoDB Atlas:**
1. Go to https://cloud.mongodb.com/
2. Navigate to Database Access
3. Change password for user `LinkedSkill` or create new user
4. Update connection string in `.env`

**Cloudinary:**
1. Go to https://cloudinary.com/console
2. Navigate to Settings → Security → Access Keys
3. Rotate API Secret
4. Update in `.env`

**Groq API:**
1. Go to https://console.groq.com/keys
2. Revoke the exposed key
3. Create a new key
4. Update in `.env`

**Google OAuth:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Delete or regenerate the exposed client secret
3. Update in `.env`

**Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Revoke the exposed app password
3. Generate new app password
4. Update in `.env`

**JWT Secret:**
1. Generate a new random secret (use command below)
2. Update in `.env`

```powershell
# Generate a secure random JWT secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

#### 2. Clean Git History (Optional but Recommended)

The credentials in `.env.example` are now in your git history. To completely remove them:

```powershell
# WARNING: This rewrites history and will affect all collaborators
# Create a backup first!
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch server/.env.example" --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: Destructive operation)
git push origin --force --all
```

**Alternative (Simpler):** Since `.env.example` is a legitimate file, just ensure all credentials are rotated and the current sanitized version is committed.

#### 3. Security Best Practices Going Forward

**Never commit:**
- `.env` files (already in `.gitignore` ✅)
- Any files with actual credentials
- API keys, tokens, passwords, connection strings

**Always:**
- Use environment variables for all secrets
- Keep `.env.example` with placeholder values only
- Rotate credentials if accidentally exposed
- Use strong, random secrets for production

**For JWT Secrets:**
```powershell
# Generate secure random strings
[Convert]::ToBase64String((1..64 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

**For Production:**
- Use environment variables from your hosting provider
- Never use default or 'dev' values in production
- Enable HTTPS (set `cookie.secure = true` in session config)
- Use secrets management services (AWS Secrets Manager, Azure Key Vault, etc.)

### Environment Variables Reference

Your application requires these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret for JWT token signing |
| `PORT` | No | Server port (default: 4000) |
| `CLOUDINARY_CLOUD_NAME` | For images | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For images | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For images | Cloudinary API secret |
| `GROQ_API_KEY` | For AI | Groq AI API key |
| `GOOGLE_CLIENT_ID` | For OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For OAuth | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | For OAuth | OAuth callback URL |
| `FRONTEND_URL` | For OAuth | Frontend application URL |
| `EMAIL_USER` | For OTP | Gmail address for sending emails |
| `EMAIL_PASSWORD` | For OTP | Gmail app password |
| `EMAIL_FROM` | No | Email sender name |

### Verification Checklist

- [ ] All credentials rotated in external services
- [ ] `.env` file updated with new credentials
- [ ] `.env.example` contains only placeholders
- [ ] Application tested with new credentials
- [ ] Team members notified of credential rotation
- [ ] Production environment variables updated

### Questions?

If you're unsure about any security aspect:
1. Check if the value should be secret (yes for passwords, keys, tokens)
2. If secret, it should ONLY be in `.env`, never in code
3. If not secret, it can be in code but consider using config files
4. When in doubt, treat it as secret

### Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
