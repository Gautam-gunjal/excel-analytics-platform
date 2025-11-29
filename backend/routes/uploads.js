const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const Upload = require('../models/Upload');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// upload excel
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const wb = XLSX.readFile(filePath);
    const firstSheet = wb.SheetNames[0];
    const sheet = wb.Sheets[firstSheet];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const doc = new Upload({
      user: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: filePath,
      sheetName: firstSheet,
      dataJson: json,
    });

    await doc.save();

    // return saved upload doc
    res.json({ upload: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get user's upload history
router.get('/history', auth, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin: list all uploads
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const uploads = await Upload.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /uploads/:id
 * Admin-only: delete an upload (remove the file from disk and delete the DB doc).
 * This endpoint matches the frontend helper deleteUpload(id) which calls DELETE /uploads/:id
 */
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Upload.deleteByIdWithFile(id);

    if (!result || (result.deletedCount || 0) === 0) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    return res.json({ message: 'Upload deleted successfully', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
