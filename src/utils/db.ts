// IndexedDB Offline PWA Cache & Local Storage Manager

const DB_NAME = 'MemoryVaultDB_v2';
const DB_VERSION = 1;
const STORE_NODES = 'vault_nodes';
const STORE_USER = 'user_profile';

export class VaultDB {
  private static initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NODES)) {
          db.createObjectStore(STORE_NODES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_USER)) {
          db.createObjectStore(STORE_USER, { keyPath: 'email' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public static async saveNodes(nodes: any[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NODES, 'readwrite');
      const store = tx.objectStore(STORE_NODES);
      store.clear();
      nodes.forEach(node => store.put(node));
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Offline DB fallback
    }
  }

  public static async loadNodes(): Promise<any[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NODES, 'readonly');
      const store = tx.objectStore(STORE_NODES);
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }
}
