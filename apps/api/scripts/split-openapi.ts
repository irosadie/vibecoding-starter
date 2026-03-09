/**
 * Script to split the monolithic openapi.json into per-module files.
 *
 * Strategy:
 *   - We keep all $ref as standard `#/components/schemas/X` format.
 *   - At runtime, main.ts merges all files back into one spec.
 *   - This means each file is editable independently but still valid
 *     when merged.
 *
 * Output structure:
 *   docs/openapi/
 *     base.json              - openapi version, info, servers, security, tags, securitySchemes
 *     paths/
 *       auth.json            - Authentication paths
 *       properties.json      - Properties paths
 *       payment-methods.json - Payment Methods paths
 *       settings.json        - Bunny CDN + AI Provider paths
 *       users.json           - Users paths
 *       vendors.json         - Vendors paths
 *       drivers.json         - Drivers paths
 *     schemas/
 *       common.json          - Shared schemas (SuccessResponse, ErrorResponse, etc.)
 *       auth.json            - Auth-related schemas
 *       properties.json      - Property-related schemas
 *       payment-methods.json - PaymentMethod-related schemas
 *       settings.json        - Settings-related schemas (Bunny, AI)
 *       users.json           - User-related schemas
 *       vendors.json         - Vendor-related schemas
 *       drivers.json         - Driver-related schemas
 *
 * Usage: npx tsx scripts/split-openapi.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..")
const OPENAPI_DIR = resolve(ROOT, "docs/openapi")
const SOURCE = resolve(OPENAPI_DIR, "openapi.json")
const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`)
}

// Read the monolithic spec
const spec = JSON.parse(readFileSync(SOURCE, "utf-8"))

// ─── Mappings ────────────────────────────────────────────

// Tag → module name mapping for paths
const TAG_TO_MODULE: Record<string, string> = {
  Authentication: "auth",
  Properties: "properties",
  "Payment Methods": "payment-methods",
  "Bunny CDN": "settings",
  "AI Provider": "settings",
  Users: "users",
  Vendors: "vendors",
  Drivers: "drivers",
}

// Schema name → module mapping
const SCHEMA_TO_MODULE: Record<string, string> = {
  // Common / shared
  SuccessResponse: "common",
  ErrorResponse: "common",
  ValidationError: "common",
  PaginationMeta: "common",

  // Auth
  LoginRequest: "auth",
  LoginResponse: "auth",
  RefreshTokenRequest: "auth",
  UserProfile: "auth",
  ForgotPasswordRequest: "auth",
  ResendVerificationRequest: "auth",

  // Properties
  Property: "properties",
  CreatePropertyRequest: "properties",
  UpdatePropertyRequest: "properties",

  // Payment Methods
  PaymentMethod: "payment-methods",
  CreatePaymentMethodRequest: "payment-methods",
  UpdatePaymentMethodRequest: "payment-methods",

  // Settings (Bunny CDN + AI)
  BunnySettings: "settings",
  UpdateBunnySettingsRequest: "settings",
  AISettings: "settings",
  UpdateAISettingsRequest: "settings",

  // Users
  User: "users",
  CreateUserRequest: "users",
  UpdateUserRequest: "users",

  // Vendors
  Vendor: "vendors",
  CreateVendorRequest: "vendors",
  UpdateVendorRequest: "vendors",
  ListVendorsQuery: "vendors",
  ListVendorsResponse: "vendors",
  GetVendorResponse: "vendors",
  CreateVendorResponse: "vendors",
  UpdateVendorResponse: "vendors",
  DeleteVendorResponse: "vendors",
  BanVendorResponse: "vendors",
  UnbanVendorResponse: "vendors",

  // Drivers
  Driver: "drivers",
  CreateDriverRequest: "drivers",
  UpdateDriverRequest: "drivers",
  ListDriversQuery: "drivers",
  ListDriversResponse: "drivers",
  GetDriverResponse: "drivers",
  CreateDriverResponse: "drivers",
  UpdateDriverResponse: "drivers",
  BanDriverResponse: "drivers",
  UnbanDriverResponse: "drivers",
  GetDriverTripsResponse: "drivers",
  Trip: "drivers",
}

// ─── Ensure directories ──────────────────────────────────

mkdirSync(resolve(OPENAPI_DIR, "paths"), { recursive: true })
mkdirSync(resolve(OPENAPI_DIR, "schemas"), { recursive: true })

// ─── 1. Create base.json ─────────────────────────────────

const base = {
  openapi: spec.openapi,
  info: spec.info,
  servers: spec.servers,
  tags: spec.tags,
  security: spec.security,
  components: {
    securitySchemes: spec.components?.securitySchemes || {},
  },
}

writeFile("base.json", base)
writeStdout("Created base.json")

// ─── 2. Split paths by tag → module ──────────────────────

const pathsByModule: Record<string, Record<string, unknown>> = {}

for (const [pathKey, pathValue] of Object.entries(
  (spec.paths || {}) as Record<string, Record<string, unknown>>,
)) {
  const methods = Object.values(pathValue)
  const firstOp = methods[0] as Record<string, unknown>
  const tags = firstOp?.tags as string[] | undefined
  const tag = tags?.[0] || "unknown"
  const moduleName = TAG_TO_MODULE[tag] || "unknown"

  if (!pathsByModule[moduleName]) {
    pathsByModule[moduleName] = {}
  }
  // Keep $ref as-is (#/components/schemas/X) — we merge at runtime
  pathsByModule[moduleName][pathKey] = pathValue
}

for (const [moduleName, paths] of Object.entries(pathsByModule)) {
  writeFile(`paths/${moduleName}.json`, paths)
  writeStdout(
    `Created paths/${moduleName}.json (${Object.keys(paths).length} paths)`,
  )
}

// ─── 3. Split schemas by module ──────────────────────────

const schemasByModule: Record<string, Record<string, unknown>> = {}

for (const [schemaName, schemaValue] of Object.entries(
  (spec.components?.schemas || {}) as Record<string, unknown>,
)) {
  const moduleName = SCHEMA_TO_MODULE[schemaName] || "common"

  if (!schemasByModule[moduleName]) {
    schemasByModule[moduleName] = {}
  }
  // Keep $ref as-is — we merge at runtime
  schemasByModule[moduleName][schemaName] = schemaValue
}

for (const [moduleName, schemas] of Object.entries(schemasByModule)) {
  writeFile(`schemas/${moduleName}.json`, schemas)
  writeStdout(
    `Created schemas/${moduleName}.json (${Object.keys(schemas).length} schemas)`,
  )
}

writeStdout("")
writeStdout("Split complete")
writeStdout("Structure:")
writeStdout("   docs/openapi/")
writeStdout("   ├── base.json")
writeStdout("   ├── paths/")
for (const name of Object.keys(pathsByModule)) {
  writeStdout(`   │   ├── ${name}.json`)
}
writeStdout("   └── schemas/")
for (const name of Object.keys(schemasByModule)) {
  writeStdout(`       ├── ${name}.json`)
}
writeStdout("")
writeStdout("main.ts already uses mergeOpenApiSpec() to merge at startup.")

// ─── Helper ──────────────────────────────────────────────

function writeFile(relativePath: string, data: unknown) {
  const fullPath = resolve(OPENAPI_DIR, relativePath)
  writeFileSync(
    fullPath,
    `${JSON.stringify(data, null, 2)}
`,
  )
}
