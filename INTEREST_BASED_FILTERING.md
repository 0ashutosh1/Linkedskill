# Interest-Based Class Filtering Feature

## Overview
This feature personalizes the user experience by showing classes that match their interests and hobbies selected during onboarding. Users will see classes most relevant to their preferences, making it easier to discover learning opportunities aligned with their goals.

## How It Works

### 1. **Onboarding Process**
During onboarding, users select:
- **Interests**: Categories like Programming, Design, Business, etc. (from available categories)
- **Hobbies**: Activities like Reading, Gaming, Coding, Photography, etc.

These are stored in the user's profile as `areasOfInterest` array.

### 2. **Backend Filtering (Smart Algorithm)**

#### New API Endpoint: `/classes/personalized/me`
**Method**: GET  
**Authentication**: Required  
**Location**: `server/controllers/classController.js`

**Algorithm**:
1. Fetches the user's profile to get their `areasOfInterest`
2. Finds categories that match the user's interests (case-insensitive)
3. Searches for classes that:
   - Belong to matching categories, OR
   - Have titles/descriptions containing interest keywords
4. Only returns upcoming/live classes (not past classes)
5. Excludes classes created by the user themselves

**Response Example**:
```json
{
  "classes": [...],
  "personalized": true,
  "interests": ["Programming", "Design", "Reading"]
}
```

**Fallback**: If the user has no interests or no matching classes, returns all upcoming classes with `personalized: false`.

### 3. **Frontend Implementation**

#### Updated Functions in `src/App.jsx`:

**`fetchClassesByCategories()`**:
- First attempts to fetch personalized classes
- Groups personalized classes by category
- Falls back to showing all categories if personalization fails
- Console logs when showing personalized content: `📌 Showing X personalized classes based on interests: [...]`

**`fetchUpcomingClasses()`**:
- Fetches personalized upcoming classes for the right panel
- Shows only classes matching user interests
- Falls back to all upcoming classes if needed

#### New Function in `src/utils/classAPI.js`:

**`getPersonalizedClasses()`**:
```javascript
// Fetches personalized classes based on user interests/hobbies
const personalizedData = await classAPI.getPersonalizedClasses()
```

## User Experience Flow

### For New Users:
1. **Sign Up** → Complete onboarding
2. **Select Interests & Hobbies** (e.g., "Programming", "Design", "Gaming")
3. **View Dashboard** → See classes filtered by their selections
4. **Message**: Console shows "Showing X personalized classes based on interests: [Programming, Design, Gaming]"

### For Existing Users:
- If they completed onboarding: **See personalized classes**
- If they skipped onboarding: **See all available classes**
- Can update interests anytime by editing their profile

### For Users Without Interests:
- System automatically shows **all available classes**
- No personalization applied
- Encourages users to add interests for better recommendations

## Key Benefits

### 🎯 **Personalized Learning Experience**
- Users see classes that match their goals
- Reduces information overload
- Increases engagement with relevant content

### 🔄 **Smart Fallback System**
- Never shows empty results
- Gracefully handles users without interests
- Ensures all users can access classes

### 📊 **Multiple Matching Strategies**
1. **Category Match**: Classes in matching categories
2. **Keyword Match**: Classes with interest keywords in title/description
3. **Hobby Match**: Classes related to user hobbies

## Examples

### Example 1: Programming Enthusiast
**User Interests**: `["Programming", "Technology", "Coding"]`

**Will See Classes**:
- ✅ "Full Stack Web Development" (Category: Programming)
- ✅ "Python for Data Science" (Title contains "Python")
- ✅ "Advanced JavaScript" (Category: Programming)
- ❌ "Watercolor Painting" (No match)
- ❌ "Yoga for Beginners" (No match)

### Example 2: Creative Professional
**User Interests**: `["Design", "Art", "Photography"]`

**Will See Classes**:
- ✅ "UI/UX Design Fundamentals" (Category: Design)
- ✅ "Portrait Photography Masterclass" (Category: Photography)
- ✅ "Digital Art Techniques" (Contains "Art" keyword)
- ❌ "Machine Learning Basics" (No match)

### Example 3: Business Student
**User Interests**: `["Business", "Marketing", "Finance"]`

**Will See Classes**:
- ✅ "Business Strategy 101" (Category: Business)
- ✅ "Digital Marketing Essentials" (Category: Marketing)
- ✅ "Financial Planning" (Contains "Financial" keyword)
- ❌ "Gaming Development" (No match)

## Technical Implementation Details

### Database Schema
```javascript
// Profile Model
{
  userId: ObjectId,
  areasOfInterest: [String], // Combined interests + hobbies
  // ... other fields
}

// Class Model
{
  title: String,
  description: String,
  categoryId: ObjectId (ref: Category),
  // ... other fields
}
```

### Filtering Logic (Simplified)
```javascript
// Find classes matching user interests
const personalizedClasses = await Class.find({
  $and: [
    { status: { $in: ['scheduled', 'live'] } },
    {
      $or: [
        { categoryId: { $in: matchingCategoryIds } },
        { title: { $regex: interest, $options: 'i' } },
        { description: { $regex: interest, $options: 'i' } }
      ]
    }
  ]
})
```

### Performance Considerations
- Uses MongoDB indexes on `categoryId`, `status`, `startTime`
- Parallel category fetching for faster loading
- Caches user profile data during session
- Minimal database queries with smart aggregation

## Testing the Feature

### Manual Testing Steps:

1. **Create a new account**:
   - Sign up as a new user
   - Complete onboarding
   - Select interests: "Programming", "Design"

2. **Create test classes**:
   - Login as an expert
   - Create classes in different categories
   - Some matching interests, some not

3. **Verify filtering**:
   - Login as student
   - Check dashboard shows only matching classes
   - Check console for personalization message
   - Verify category sections show correct classes

4. **Test fallback**:
   - Create user with no interests
   - Verify they see all classes
   - Check `personalized: false` in response

### Console Debugging:
Look for these messages:
- `📌 Showing X personalized classes based on interests: [...]` - Personalization working
- `Could not fetch personalized classes, falling back...` - Fallback triggered

## Future Enhancements

### Potential Improvements:
1. **AI-Powered Recommendations**: Use machine learning for better matching
2. **Interest Weight System**: Prioritize some interests over others
3. **Collaborative Filtering**: "Users like you also liked..."
4. **Interest Analytics**: Show users what they're interested in most
5. **Dynamic Interest Update**: Suggest new interests based on viewed classes
6. **Interest Tags**: More granular filtering with tags and keywords

### UI Enhancements:
1. **Filter Toggle**: Let users switch between "Personalized" and "All Classes"
2. **Interest Badge**: Show why a class was recommended
3. **Empty State Message**: "No classes match your interests yet. Explore all classes or update your interests."
4. **Interest Match Score**: Show % match for each class

## Troubleshooting

### Issue: No personalized classes showing
**Solution**: 
- Check if user has interests in profile
- Verify interests match available category names
- Check if classes exist in those categories

### Issue: All classes showing instead of filtered
**Solution**:
- Verify `/classes/personalized/me` endpoint is working
- Check authentication token is valid
- Look for console error messages

### Issue: Wrong classes showing
**Solution**:
- Verify class categories are set correctly
- Check interest spelling matches category names
- Ensure `areasOfInterest` is populated in user profile

## API Documentation

### Get Personalized Classes
```
GET /classes/personalized/me
Authorization: Bearer <token>

Response:
{
  "classes": [Class],
  "personalized": boolean,
  "interests": [String]
}
```

### Success Cases:
- **200 OK**: Personalized classes found
- **200 OK** + `personalized: false`: No interests or no matches

### Error Cases:
- **401 Unauthorized**: No authentication token
- **500 Server Error**: Database or server error

## Files Modified

### Backend:
1. `server/controllers/classController.js` - Added `getPersonalizedClasses()` function
2. `server/routes/class.js` - Added `/personalized/me` route

### Frontend:
1. `src/utils/classAPI.js` - Added `getPersonalizedClasses()` method
2. `src/App.jsx` - Updated `fetchClassesByCategories()` and `fetchUpcomingClasses()`

### No changes needed to:
- Database models (already had `areasOfInterest` field)
- Onboarding page (already collects interests/hobbies)
- UI components (work with filtered data automatically)

## Conclusion

This feature significantly improves user experience by showing relevant classes based on their interests. The smart fallback system ensures no user sees an empty state, while the flexible matching algorithm catches classes across multiple dimensions (category, title, description).

Users can now:
- ✅ See classes aligned with their learning goals
- ✅ Discover new opportunities in areas they care about
- ✅ Spend less time searching for relevant classes
- ✅ Have a personalized learning journey from day one
