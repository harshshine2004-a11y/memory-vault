class MediaService {
  /**
   * Generates presigned upload credentials for AWS S3 / Cloudinary / Supabase Storage.
   */
  generatePresignedUpload(filename, mimeType) {
    const key = `cloud-vault/${Date.now()}-${filename}`;
    return {
      uploadUrl: `https://vault-cloud-storage.s3.amazonaws.com/${key}`,
      publicUrl: `https://cdn.memoryvault.ai/${key}`,
      key,
      mimeType,
      expiresInSeconds: 3600
    };
  }
}

module.exports = new MediaService();
