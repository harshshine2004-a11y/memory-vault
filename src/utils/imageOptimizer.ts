// High-Performance Client-Side Image Optimizer & Multi-Resolution WebP Thumbnail Generator

export interface OptimizedImageData {
  blob: Blob;
  dataUrl: string;
  thumb256: string;
  thumb512: string;
  thumb1024: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export class ImageOptimizer {
  public static async compressAndGenerateThumbnails(file: File): Promise<OptimizedImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Render helper for generating specific WebP resolution canvas
        const generateCanvasDataUrl = (maxSize: number, quality: number = 0.85): string => {
          let w = originalWidth;
          let h = originalHeight;

          if (w > h) {
            if (w > maxSize) {
              h = Math.round((h * maxSize) / w);
              w = maxSize;
            }
          } else {
            if (h > maxSize) {
              w = Math.round((w * maxSize) / h);
              h = maxSize;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
          }
          return canvas.toDataURL('image/webp', quality);
        };

        const thumb256 = generateCanvasDataUrl(256, 0.75);
        const thumb512 = generateCanvasDataUrl(512, 0.82);
        const thumb1024 = generateCanvasDataUrl(1024, 0.88);
        const fullOptimizedUrl = generateCanvasDataUrl(1920, 0.90);

        // Convert base64 data URL to Blob
        fetch(fullOptimizedUrl)
          .then(res => res.blob())
          .then(blob => {
            resolve({
              blob,
              dataUrl: fullOptimizedUrl,
              thumb256,
              thumb512,
              thumb1024,
              width: originalWidth,
              height: originalHeight,
              sizeBytes: blob.size
            });
          })
          .catch(() => {
            resolve({
              blob: file,
              dataUrl: objectUrl,
              thumb256: objectUrl,
              thumb512: objectUrl,
              thumb1024: objectUrl,
              width: originalWidth,
              height: originalHeight,
              sizeBytes: file.size
            });
          });
      };

      img.onerror = () => reject(new Error('Failed to load image file for optimization'));
      img.src = objectUrl;
    });
  }
}
