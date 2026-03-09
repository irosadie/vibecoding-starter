/**
 * Storage Service Interface
 * Defines contract for file storage operations
 */

export interface UploadResult {
  url: string
  storagePath: string
}

export interface UploadOptions {
  filename: string
  mimeType: string
  folder?: string
}

export interface StorageService {
  /**
   * Upload file buffer to storage
   */
  uploadFile(buffer: Buffer, options: UploadOptions): Promise<UploadResult>

  /**
   * Delete file from storage
   */
  deleteFile(path: string): Promise<void>

  /**
   * Get CDN URL for a file path
   */
  getCdnUrl(path: string): Promise<string>

  /**
   * Get pre-signed upload URL for client-side uploads
   */
  getUploadUrl(filename: string, folder?: string): Promise<string>

  /**
   * Get headers required for upload
   */
  getUploadHeaders(): Promise<Record<string, string>>
}
