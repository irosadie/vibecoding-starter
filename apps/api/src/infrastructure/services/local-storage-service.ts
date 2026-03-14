import { randomUUID } from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import type {
  StorageService,
  UploadOptions,
  UploadResult,
} from "@/domain/services/StorageService"

const DEFAULT_UPLOADS_DIRECTORY = "uploads"

export class LocalStorageService implements StorageService {
  private readonly uploadsDirectory: string
  private readonly publicBaseUrl: string

  constructor() {
    this.uploadsDirectory = resolve(process.cwd(), DEFAULT_UPLOADS_DIRECTORY)
    this.publicBaseUrl =
      process.env.FILE_STORAGE_BASE_URL ||
      `http://localhost:${process.env.API_PORT ?? 3001}/${DEFAULT_UPLOADS_DIRECTORY}`
  }

  async uploadFile(
    buffer: Buffer,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const safeFilename = sanitizeFilename(options.filename)
    const fileId = randomUUID()
    const folder = options.folder?.replace(/^\/+|\/+$/g, "") || "misc"
    const storagePath = `${folder}/${fileId}-${safeFilename}`
    const targetPath = join(this.uploadsDirectory, storagePath)

    await mkdir(dirname(targetPath), { recursive: true })
    await writeFile(targetPath, buffer)

    return {
      url: await this.getCdnUrl(storagePath),
      storagePath,
    }
  }

  async deleteFile(path: string): Promise<void> {
    const normalizedPath = path.replace(/^\/+/, "")
    const targetPath = join(this.uploadsDirectory, normalizedPath)

    await rm(targetPath, { force: true })
  }

  async getCdnUrl(path: string): Promise<string> {
    const normalizedPath = path.replace(/^\/+/, "")

    return `${this.publicBaseUrl}/${normalizedPath}`
  }

  async getUploadUrl(filename: string, folder = "misc"): Promise<string> {
    const safeFilename = sanitizeFilename(filename)

    return this.getCdnUrl(`${folder}/${safeFilename}`)
  }

  async getUploadHeaders(): Promise<Record<string, string>> {
    return {}
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
}
