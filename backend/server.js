require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin'); // ✅ add this
const path = require('path');
const fs = require('fs');

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ensure uploads dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes); // ✅ mount admin routes

// -----------------------
// Additional route to match frontend deleteUser helper:
// The frontend helper calls DELETE /api/users/:id (because api.js uses API.delete(`/users/${id}`)),
// but your admin routes are mounted under /api/admin. Add a thin admin-protected route here
// that uses the model helper you added (User.deleteByIdAndUploads).
// -----------------------
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const User = require('./models/User');

app.delete('/api/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // prevent admin from deleting themselves
    if (req.user && req.user._id && req.user._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const result = await User.deleteByIdAndUploads(userId);

    if (!result || (result.userDeletedCount || 0) === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'User deleted successfully',
      deletedUploads: result.uploadsDeletedCount || 0,
    });
  } catch (err) {
    console.error('DELETE /api/users/:id error', err);
    return res.status(500).json({ message: err.message });
  }
});

// -----------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
