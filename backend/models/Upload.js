const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const UploadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    originalName: String,
    filename: String,
    path: String,
    sheetName: String,
    dataJson: { type: Array, default: [] }, // parsed rows
  },
  { timestamps: true }
);

/**
 * Delete a single upload by id, removing its file from disk if present.
 * Returns the deletion result (object from deleteOne).
 */
UploadSchema.statics.deleteByIdWithFile = async function (id) {
  if (!id) throw new Error('Missing upload id');

  const Upload = this; // model
  const doc = await Upload.findById(id).exec();
  if (!doc) return { deletedCount: 0 };

  // delete file on disk if path exists
  if (doc.path) {
    try {
      // resolve to avoid accidental path traversal - adjust baseDir if needed
      const resolved = path.resolve(doc.path);
      await fs.unlink(resolved).catch(() => {});
    } catch (err) {
      // swallow file deletion errors but log if you want
      // console.warn('Failed to delete file for upload', id, err);
    }
  }

  const res = await Upload.deleteOne({ _id: id }).exec();
  return res;
};

/**
 * Delete all uploads for a given user id, removing files from disk.
 * Returns object: { deletedCount }
 */
UploadSchema.statics.deleteByUserIdWithFiles = async function (userId) {
  if (!userId) throw new Error('Missing user id');

  const Upload = this;
  const docs = await Upload.find({ user: userId }).exec();

  for (const doc of docs) {
    if (doc.path) {
      try {
        const resolved = path.resolve(doc.path);
        await fs.unlink(resolved).catch(() => {});
      } catch (err) {
        // ignore individual file deletion errors
        // console.warn('Failed to delete file for upload', doc._id, err);
      }
    }
  }

  const res = await Upload.deleteMany({ user: userId }).exec();
  return res;
};

module.exports = mongoose.model('Upload', UploadSchema);
