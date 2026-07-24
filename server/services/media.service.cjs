class MediaService {
  /**
   * Generates Cloudinary direct upload parameters (25 GB Free Tier).
   */
  generateCloudinaryUploadParams(filename, mimeType) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'memory-vault-demo';
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'vault_preset';
    const publicId = `vault_memories/${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`;

    return {
      provider: 'Cloudinary (25 GB Free Tier)',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      publicId,
      uploadPreset,
      mimeType,
      expiresInSeconds: 3600
    };
  }
}

module.exports = new MediaService();
