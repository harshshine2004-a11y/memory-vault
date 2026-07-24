import { get, set, del } from 'idb-keyval';
import type { MemoryNode } from '../types';

export class PWAEngine {
  /**
   * Registers PWA Service Worker.
   */
  static registerServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.log('SW registration error:', err);
        });
      });
    }
  }

  /**
   * Saves nodes graph cache to IndexedDB for offline access.
   */
  static async cacheVaultOffline(nodes: MemoryNode[]): Promise<void> {
    try {
      await set('vault_nodes_cache', nodes);
      await set('vault_cache_timestamp', new Date().toISOString());
    } catch (err) {
      console.error('Failed to cache vault offline:', err);
    }
  }

  /**
   * Loads offline nodes graph cache from IndexedDB.
   */
  static async loadOfflineVault(): Promise<MemoryNode[] | null> {
    try {
      const cached = await get<MemoryNode[]>('vault_nodes_cache');
      return cached || null;
    } catch {
      return null;
    }
  }

  /**
   * Adds an item to the offline upload queue.
   */
  static async queueOfflineUpload(photoPayload: any): Promise<void> {
    try {
      const existing = (await get<any[]>('offline_upload_queue')) || [];
      existing.push(photoPayload);
      await set('offline_upload_queue', existing);
    } catch (err) {
      console.error('Failed to queue offline upload:', err);
    }
  }

  /**
   * Clears and returns pending offline upload queue.
   */
  static async getAndClearOfflineQueue(): Promise<any[]> {
    try {
      const pending = (await get<any[]>('offline_upload_queue')) || [];
      await del('offline_upload_queue');
      return pending;
    } catch {
      return [];
    }
  }
}
