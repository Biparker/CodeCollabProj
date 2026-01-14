const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let avatarBucket = null;

/**
 * Initialize the GridFS bucket for avatar storage
 * Must be called after MongoDB connection is established
 */
const initGridFS = (connection) => {
  if (!connection || !connection.db) {
    throw new Error('MongoDB connection not available');
  }

  avatarBucket = new GridFSBucket(connection.db, {
    bucketName: 'avatars'
  });

  return avatarBucket;
};

/**
 * Get the GridFS bucket instance
 */
const getBucket = () => {
  if (!avatarBucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS first.');
  }
  return avatarBucket;
};

/**
 * Upload a file buffer to GridFS
 * @param {Buffer} buffer - The file buffer
 * @param {string} filename - The filename to store
 * @param {string} mimetype - The file MIME type
 * @returns {Promise<ObjectId>} The GridFS file ID
 */
const uploadToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
      metadata: {
        uploadedAt: new Date()
      }
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.end(buffer);
  });
};

/**
 * Download a file from GridFS
 * @param {ObjectId|string} fileId - The GridFS file ID
 * @returns {ReadableStream} A readable stream of the file
 */
const downloadFromGridFS = (fileId) => {
  const bucket = getBucket();
  const objectId = typeof fileId === 'string'
    ? new mongoose.Types.ObjectId(fileId)
    : fileId;

  return bucket.openDownloadStream(objectId);
};

/**
 * Delete a file from GridFS
 * @param {ObjectId|string} fileId - The GridFS file ID
 * @returns {Promise<void>}
 */
const deleteFromGridFS = async (fileId) => {
  const bucket = getBucket();
  const objectId = typeof fileId === 'string'
    ? new mongoose.Types.ObjectId(fileId)
    : fileId;

  await bucket.delete(objectId);
};

/**
 * Get file metadata from GridFS
 * @param {ObjectId|string} fileId - The GridFS file ID
 * @returns {Promise<Object|null>} File metadata or null if not found
 */
const getFileInfo = async (fileId) => {
  const bucket = getBucket();
  const objectId = typeof fileId === 'string'
    ? new mongoose.Types.ObjectId(fileId)
    : fileId;

  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

module.exports = {
  initGridFS,
  getBucket,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS,
  getFileInfo
};
