const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// Home page – publicly accessible
router.get('/', (req, res) => {
  res.render('index', { title: 'Home', user: req.session.user });
});

// Dashboard page – only visible after login
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

// Profile view page – only visible for logged-in users
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { title: 'Profile', user: req.session.user });
});

// Profile edit page (GET) – only visible for logged-in users
router.get('/profile/edit', ensureAuthenticated, (req, res) => {
  res.render('profile-edit', { title: 'Edit Profile', user: req.session.user, error: null });
});

// Profile edit (POST) – update the user's information
// routes/pages.js (Profile edit POST handler)
router.post('/profile/edit', ensureAuthenticated, async (req, res) => {
    const { name, username, email, upiId, upiName, fcmToken } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.session.user._id,
        { name, username, email, upiId, upiName, fcmToken },
        { new: true }
      );
      req.session.user = updatedUser.toObject();
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      res.render('profile-edit', { title: 'Edit Profile', user: req.session.user, error: 'Failed to update profile. Please try again.' });
    }
  });

module.exports = router;