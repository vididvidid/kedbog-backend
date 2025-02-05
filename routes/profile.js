const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// Get merchant profile
router.get('/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const user = await User.findOne({ merchantId }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Edit merchant profile
router.post('/edit/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const updateData = req.body;

    // Update the merchant profile (email, name, etc.)
    const user = await User.findOneAndUpdate(
      { merchantId },
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;