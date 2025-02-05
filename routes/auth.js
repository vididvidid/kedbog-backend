const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// GET Signup – if already logged in, redirect to dashboard
router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('signup', { title: 'Signup', error: null, user: req.session.user });
});

// POST Signup – create new user and then redirect to login
router.post('/signup', async (req, res) => {
  const { name, username, email, password, upiId, upiName } = req.body;
  if (!name || !username || !email || !password) {
    return res.render('signup', { title: 'Signup', error: 'Required fields missing', user: req.session.user });
  }
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('signup', { title: 'Signup', error: 'User already exists', user: req.session.user });
    }
    const merchantId = 'MER-' + uuidv4();
    const newUser = new User({ name, username, email, password, upiId, upiName, merchantId });
    await newUser.save();
    // Redirect to login after successful signup
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signup', { title: 'Signup', error: 'Server error, please try again', user: req.session.user });
  }
});

// GET Login – if already logged in, redirect to dashboard
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login', error: null, user: req.session.user });
});

// POST Login – validate credentials and set session
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { title: 'Login', error: 'Email and password are required', user: req.session.user });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.render('login', { title: 'Login', error: 'Invalid credentials', user: req.session.user });
    }
    // Store only necessary fields in session (avoid keeping the password)
    req.session.user = user.toObject();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { title: 'Login', error: 'Server error, please try again', user: req.session.user });
  }
});

// GET Logout – destroy session and redirect to home
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;