const express = require('express');
const { signup, login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, me);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${FRONTEND_URL}?error=oauth_failed`
  }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { sub: req.user._id.toString(), email: req.user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Check if user needs onboarding (no role = needs onboarding)
      const needsOnboarding = req.user.needsOnboarding || false;
      const isNewUser = req.user.isNewUser || false;
      
      console.log(`🎯 OAuth redirect: needsOnboarding=${needsOnboarding}, isNewUser=${isNewUser}`);

      // Redirect to frontend with token and onboarding flag
      res.redirect(`${FRONTEND_URL}?token=${token}&oauth=google&needsOnboarding=${needsOnboarding}`);
    } catch (error) {
      console.error('Error generating token:', error);
      res.redirect(`${FRONTEND_URL}?error=token_generation_failed`);
    }
  }
);

module.exports = router;
