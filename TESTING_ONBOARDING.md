# Testing the Onboarding Feature

## ✅ FIXED Issues

### Problem
- **Error**: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- **Cause**: Incorrect API endpoint (`/profile/me` instead of `/profile`)

### Solution
1. ✅ Fixed OnboardingPage to use correct endpoint: `POST /profile`
2. ✅ Added `/profile/completion` route alias
3. ✅ Server connected to MongoDB successfully
4. ✅ All changes pushed to GitHub

## Server Status

### Backend Server (Port 4000)
```
✅ Agenda connected to MongoDB successfully
✅ Agenda scheduler started
✅ Server listening on http://localhost:4000
✅ Socket.IO enabled for real-time chat
✅ MongoDB URI: mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/
```

### Frontend Server (Port 3000)
```
✅ Vite dev server running on http://localhost:3000/
```

## How to Test the Onboarding

### Step 1: Clear Previous Session
1. Open browser DevTools (F12)
2. Go to Console
3. Run: `localStorage.clear()`
4. Refresh the page

### Step 2: Sign Up
1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Fill in the signup form:
   - Full Name: Your Name
   - Email: test@example.com
   - Phone: 1234567890
   - Role: Select Student or Expert
   - Password: password123
   - Confirm Password: password123
4. Accept terms and conditions
5. Click "Create Account"

### Step 3: Complete Onboarding

#### Step 1: Interests (Required)
- Select interests from the categories shown
- Or add custom interests using the input field
- Must select at least one
- Click "Next"

#### Step 2: Hobbies (Required)
- Select from pre-defined hobbies (Reading, Gaming, Coding, etc.)
- Or add custom hobbies
- Must select at least one
- Click "Next"

#### Step 3: Professional Info (Required)
- **Education**: e.g., "Bachelor's in Computer Science"
- **Designation**: e.g., "Software Engineer", "Student"
- **Occupation** (optional): e.g., "Full-time Developer"
- Review your profile summary
- Click "Complete"

### Step 4: Verify Data in MongoDB

The data should be saved in your MongoDB database:
- Collection: `profiles`
- Document structure:
```json
{
  "userId": "ObjectId(user_id)",
  "areasOfInterest": ["Programming", "Reading", "Gaming", "Fitness"],
  "education": "Bachelor's in Computer Science",
  "designation": "Software Engineer",
  "occupation": "Full-time Developer",
  "name": "Your Name",
  "email": "test@example.com",
  "createdAt": "2025-11-07T...",
  "updatedAt": "2025-11-07T..."
}
```

## API Endpoints

### Profile Creation
```http
POST http://localhost:4000/profile
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "education": "Bachelor's in CS",
  "designation": "Software Engineer",
  "occupation": "Full-time",
  "areasOfInterest": ["Programming", "Reading"]
}
```

### Get Profile
```http
GET http://localhost:4000/profile/me
Authorization: Bearer <your_token>
```

### Check Profile Completion
```http
GET http://localhost:4000/profile/completion
Authorization: Bearer <your_token>
```

### Get Categories (for interests)
```http
GET http://localhost:4000/categories
```

## Skip Functionality

You can skip the onboarding:
- Click "Skip" on any step to move forward
- Click "Skip" on Step 3 to complete with minimal data
- Profile will be created with whatever data you provided

## Troubleshooting

### Issue: Server not responding
**Solution**: 
```powershell
cd C:\Users\kumar\OneDrive\Documents\CODE\Coursue\server
npm start
```

### Issue: Frontend not loading
**Solution**:
```powershell
cd C:\Users\kumar\OneDrive\Documents\CODE\Coursue
npm run dev
```

### Issue: MongoDB connection error
**Check**: The MongoDB URI in `.env` file or `server/index.js`
```
MONGODB_URI=mongodb+srv://LinkedSkill:LinkedSkill008@linkedskill.cvxzqft.mongodb.net/?retryWrites=true&w=majority&appName=Linkedskill
```

### Issue: Still getting JSON parse error
**Solutions**:
1. Clear browser cache and localStorage
2. Check browser DevTools Network tab for actual API response
3. Verify server is running on port 4000
4. Check for CORS issues

## Expected Behavior

### After Signup:
✅ User is authenticated  
✅ Token is stored in localStorage  
✅ Onboarding page appears automatically  

### After Completing Onboarding:
✅ Profile data saved to MongoDB  
✅ `onboardingComplete` flag set in localStorage  
✅ Redirect to home page  
✅ Personalized experience begins  

### After Login (existing user):
✅ No onboarding shown  
✅ Direct access to home page  
✅ Profile data already available  

## Database Verification

To check if data is saved in MongoDB:
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Browse Collections
3. Find `profiles` collection
4. Look for your user's profile document

## Notes

- ✅ All API endpoints are working correctly
- ✅ MongoDB connection is stable
- ✅ Authentication flow is properly integrated
- ✅ Profile data is linked to User via `userId` field
- ✅ Changes are committed and pushed to GitHub

## Next Steps

After successful onboarding, you can:
1. Use `areasOfInterest` to filter and recommend courses
2. Show personalized content on the home page
3. Connect users with similar interests
4. Create targeted notifications
5. Build recommendation algorithms
