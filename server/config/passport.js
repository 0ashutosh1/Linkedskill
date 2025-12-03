const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
}

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google OAuth callback received for:', profile.emails[0].value);
    
    // Extract user information from Google profile
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId }).populate('roleId', 'name displayName');
    let isNewUser = false;
    let needsOnboarding = false;

    if (user) {
      console.log('✅ Existing Google user found:', email);
      // Check if user has completed profile (has role)
      needsOnboarding = !user.roleId;
      console.log(`   Role status: ${user.roleId ? '✅ Has role' : '❌ No role - needs onboarding'}`);
      
      // Update last login
      user.lastLoginDate = new Date();
      await user.save();
      return done(null, { ...user.toObject(), isNewUser: false, needsOnboarding });
    }

    // Check if user exists with this email (from regular signup)
    user = await User.findOne({ email }).populate('roleId', 'name displayName');

    if (user) {
      // Link Google account to existing user
      console.log('🔗 Linking Google account to existing user:', email);
      needsOnboarding = !user.roleId;
      console.log(`   Role status: ${user.roleId ? '✅ Has role' : '❌ No role - needs onboarding'}`);
      
      user.googleId = googleId;
      user.lastLoginDate = new Date();
      await user.save();
      return done(null, { ...user.toObject(), isNewUser: false, needsOnboarding });
    }

    // Create new user
    console.log('🆕 Creating new user from Google OAuth:', email);
    user = await User.create({
      email,
      name,
      googleId,
      lastLoginDate: new Date()
      // passwordHash is not required for OAuth users
      // roleId can be set later through onboarding
    });

    console.log('✅ New user created successfully:', user._id);
    // New users always need onboarding
    return done(null, { ...user.toObject(), isNewUser: true, needsOnboarding: true });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session (though we're using JWT, this is still required by passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
