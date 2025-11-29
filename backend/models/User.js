const mongoose = require('mongoose');

// require Upload model to run cascading deletion of user's uploads
const Upload = require('./Upload');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
}, { timestamps: true });

/**
 * Delete a user by id and remove all their uploads (files + docs).
 * Returns an object with details about the deletion.
 *
 * Note: this is not wrapped by a DB transaction because file deletions
 * happen on the filesystem. If you need stronger atomicity, consider
 * soft-delete or a transaction plus compensating actions.
 */
UserSchema.statics.deleteByIdAndUploads = async function (id) {
  if (!id) throw new Error('Missing user id');

  // first delete uploads (files + docs)
  const uploadDelResult = await Upload.deleteByUserIdWithFiles(id);

  // then delete the user document
  const res = await this.deleteOne({ _id: id }).exec();

  return {
    userDeletedCount: res.deletedCount || 0,
    uploadsDeletedCount: uploadDelResult.deletedCount || 0,
  };
};

module.exports = mongoose.model('User', UserSchema);
