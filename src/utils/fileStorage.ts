// Utility for managing file uploads and storage
// Uses browser's IndexedDB for temporary file storage

interface StoredFile {
  id: string;
  file: File;
  uploadId: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'expired';
}

class FileStorageService {
  private dbName = 'ResumeUploadStorage';
  private dbVersion = 1;
  private storeName = 'files';
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('uploadId', 'uploadId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeFile(uploadId: string, file: File): Promise<string> {
    if (!this.db) await this.initialize();

    const fileId = `file_${uploadId}_${Date.now()}`;
    const storedFile: StoredFile = {
      id: fileId,
      file: file,
      uploadId: uploadId,
      timestamp: Date.now(),
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(storedFile);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(fileId);
    });
  }

  async getFileByUploadId(uploadId: string): Promise<StoredFile | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('uploadId');
      const request = index.get(uploadId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async updateFileStatus(fileId: string, status: 'pending' | 'completed' | 'expired'): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.get(fileId);

      getRequest.onsuccess = () => {
        const storedFile = getRequest.result;
        if (storedFile) {
          storedFile.status = status;
          const updateRequest = store.put(storedFile);
          updateRequest.onerror = () => reject(updateRequest.error);
          updateRequest.onsuccess = () => resolve();
        } else {
          reject(new Error('File not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cleanupExpiredFiles(): Promise<void> {
    if (!this.db) await this.initialize();

    const expireTime = Date.now() - (30 * 60 * 1000); // 30 minutes ago

    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(expireTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingUploads(): Promise<StoredFile[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const files = request.result.filter(file => file.status === 'pending');
        resolve(files);
      };
    });
  }
}

// Create singleton instance
export const fileStorageService = new FileStorageService();

// Helper functions for easier usage
export const storeUploadedFile = async (uploadId: string, file: File): Promise<string> => {
  return await fileStorageService.storeFile(uploadId, file);
};

export const getUploadedFile = async (uploadId: string): Promise<File | null> => {
  const storedFile = await fileStorageService.getFileByUploadId(uploadId);
  return storedFile ? storedFile.file : null;
};

export const markFileAsUsed = async (fileId: string): Promise<void> => {
  await fileStorageService.updateFileStatus(fileId, 'completed');
};

export const cleanupOldFiles = async (): Promise<void> => {
  await fileStorageService.cleanupExpiredFiles();
};