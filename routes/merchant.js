const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// Register (or update) FCM token for a merchant
router.post('/register-fcm', async (req, res) => {
  try {
    const { merchantId, fcmToken } = req.body;
    if (!merchantId || !fcmToken) {
      return res.status(400).json({ error: 'merchantId and fcmToken are required' });
    }

    const user = await User.findOneAndUpdate(
      { merchantId },
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json({ message: 'FCM token updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;