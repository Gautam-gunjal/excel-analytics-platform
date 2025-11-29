const express = require('express');
const User = require('../models/User');
const Upload = require('../models/Upload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get all users + their upload count
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    // aggregate uploads by user
    const uploads = await Upload.aggregate([
      { $group: { _id: "$user", totalUploads: { $sum: 1 } } }
    ]);

    const usageMap = {};
    uploads.forEach(u => usageMap[u._id] = u.totalUploads);

    const result = users.map(user => ({
      ...user.toObject(),
      totalUploads: usageMap[user._id] || 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user (and their uploads + files)
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // prevent deleting self
    if (req.user && req.user._id && req.user._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    // Use the model helper to remove files + upload docs, then user
    const result = await User.deleteByIdAndUploads(userId);

    if (!result.userDeletedCount) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedUploads: result.uploadsDeletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all uploads with user info
router.get('/uploads', auth, admin, async (req, res) => {
  try {
    const uploads = await Upload.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
