# Email OTP Verification Setup Guide

## ✅ What's Been Implemented

### Backend
- ✅ OTP Model (`server/models/OTP.js`) - Stores OTPs with 10-minute expiration
- ✅ Email Service (`server/config/email.js`) - Sends beautiful HTML emails via nodemailer
- ✅ OTP Routes (`server/routes/otp.js`) - Endpoints for send/verify/resend OTP
- ✅ Server updated (`server/index.js`) - OTP routes registered

### Frontend
- ✅ 3-Step Signup Process:
  - **Step 1**: Enter name and email → Send OTP
  - **Step 2**: Verify 6-digit OTP code
  - **Step 3**: Complete registration (phone, password, terms)
- ✅ OTP Input with validation
- ✅ Resend OTP with 60-second cooldown
- ✅ Visual step indicator
- ✅ Email change option

## 🔧 Gmail Setup (Required for OTP Emails)

To send OTP emails, you need to configure Gmail:

### Option 1: Using Gmail (Recommended for Development)

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/apppasswords
   - Sign in with your Gmail account

2. **Create App Password**
   - Select "Mail" as the app
   - Select "Other" as the device, name it "LinkedSkill"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update `.env` File** (`server/.env`)
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=LinkedSkill <noreply@linkedskill.com>
   ```

4. **Restart Server**
   ```bash
   cd server
   node index.js
   ```

### Option 2: Using Other Email Providers

Update `server/config/email.js` transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});
```

## 📋 API Endpoints

### 1. Send OTP
```http
POST /otp/send
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": 600
}
```

### 2. Verify OTP
```http
POST /otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "email": "user@example.com"
}
```

### 3. Resend OTP
```http
POST /otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

## 🎨 User Flow

### New User Signup:
1. User enters name and email
2. Clicks "Send Verification Code"
3. System:
   - Checks if email is already registered
   - Generates 6-digit OTP
   - Sends beautiful email with OTP
   - Stores OTP in database (expires in 10 minutes)
4. User receives email with OTP
5. User enters OTP code
6. System verifies OTP
7. User completes registration (phone, password)
8. Account created → Onboarding begins

### Email Already Registered:
- System shows error: "Email already registered. Please login instead."
- User redirected to login page

### Invalid OTP:
- System shows error: "Invalid verification code. Please try again."
- User can request new code

### OTP Expired:
- System shows error: "No verification code found. Please request a new code."
- User clicks "Resend Code"

## 🔒 Security Features

1. **OTP Expiration**: Automatically deleted after 10 minutes
2. **One-time Use**: OTP marked as verified after first use
3. **Rate Limiting**: 60-second cooldown between resend requests
4. **Email Validation**: Checks if email already registered
5. **Duplicate Prevention**: Deletes old OTPs before creating new ones

## 🎨 Email Template Features

- Beautiful gradient design
- Professional HTML layout
- Clear OTP display with dashed border
- Expiration warning (10 minutes)
- Security message
- Responsive design

## 🧪 Testing (Development Mode)

The OTP is logged to console for testing:

```
📧 OTP sent to user@example.com: 123456 (Dev mode)
```

**Remove this log in production!**

## 📝 Next Steps

1. ✅ Set up Gmail App Password
2. ✅ Test signup flow
3. ⚠️ Remove console.log of OTP in production
4. ⚠️ Add rate limiting (max 5 OTP requests per hour)
5. ⚠️ Add email templates for other notifications
6. ⚠️ Consider using email service (SendGrid, AWS SES) for production

## 🐛 Troubleshooting

### "Email service not configured properly"
- Add EMAIL_USER and EMAIL_PASSWORD to `.env`
- Use Gmail App Password, not regular password
- Enable "Less secure app access" if using regular Gmail

### "Failed to send verification email"
- Check internet connection
- Verify Gmail credentials
- Check Gmail quota (500 emails/day limit)

### "No verification code found"
- OTP expired (10 minutes)
- Request new code
- Check email spelling

## 🚀 Production Considerations

1. **Use Professional Email Service**
   - SendGrid (free tier: 100 emails/day)
   - AWS SES (pay-as-you-go)
   - Mailgun, Postmark, etc.

2. **Add Rate Limiting**
   ```javascript
   // Max 5 OTP requests per email per hour
   const requestCount = await OTP.countDocuments({
     email,
     createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
   });
   if (requestCount >= 5) {
     return res.status(429).json({ error: 'Too many requests. Try again later.' });
   }
   ```

3. **Monitor Email Deliverability**
   - Track bounce rates
   - Monitor spam reports
   - Use SPF/DKIM/DMARC records

4. **Add SMS Backup** (Optional)
   - Use Twilio for SMS OTP as fallback
   - Better deliverability than email

---

**Your OTP verification system is ready! 🎉**

Just configure Gmail credentials and test the signup flow.
