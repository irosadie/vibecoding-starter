/**
 * Merge split OpenAPI spec files into a single OpenAPI document.
 *
 * Reads from docs/openapi/:
 *   - base.json              → openapi, info, servers, tags, security, securitySchemes
 *   - paths/*.json            → all path definitions
 *   - schemas/*.json          → all schema definitions
 *
 * Validates the merged spec for:
 *   - Required fields (openapi, info, paths)
 *   - Broken $ref references
 *   - Duplicate path/schema keys across modules
 *
 * Returns a fully-merged OpenAPI 3.x spec ready for Scalar / Hono.
 */

import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`)
}

const writeStderr = (message: string) => {
  process.stderr.write(`${message}\n`)
}

type OpenApiNode = Record<string, unknown>

interface OpenApiSpec {
  openapi: string
  info: OpenApiNode
  servers?: OpenApiNode[]
  tags?: OpenApiNode[]
  security?: OpenApiNode[]
  components: {
    securitySchemes?: OpenApiNode
    schemas: Record<string, unknown>
  }
  paths: Record<string, unknown>
}

export function mergeOpenApiSpec(openApiDir: string): OpenApiSpec {
  // ─── 1. Read base.json ───────────────────────────────
  const basePath = resolve(openApiDir, "base.json")
  const base = readJson(basePath)

  const merged: OpenApiSpec = {
    openapi: base.openapi as string,
    info: toNode(base.info),
    servers: toNodeArray(base.servers),
    tags: toNodeArray(base.tags),
    security: toNodeArray(base.security),
    components: {
      securitySchemes: toNode(
        (base.components as Record<string, unknown>)?.securitySchemes,
      ),
      schemas: {},
    },
    paths: {},
  }

  // ─── 2. Merge all paths/*.json ───────────────────────
  const pathsDir = resolve(openApiDir, "paths")
  for (const file of listJsonFiles(pathsDir)) {
    const filePath = resolve(pathsDir, file)
    const paths = readJson(filePath)

    // Detect duplicate paths across module files
    for (const pathKey of Object.keys(paths)) {
      if (merged.paths[pathKey]) {
        writeStdout(
          `⚠️  Duplicate path "${pathKey}" in ${file} — overwriting previous definition`,
        )
      }
    }

    Object.assign(merged.paths, paths)
  }

  // ─── 3. Merge all schemas/*.json ─────────────────────
  const schemasDir = resolve(openApiDir, "schemas")
  for (const file of listJsonFiles(schemasDir)) {
    const filePath = resolve(schemasDir, file)
    const schemas = readJson(filePath)

    // Detect duplicate schemas across module files
    for (const schemaName of Object.keys(schemas)) {
      if (merged.components.schemas[schemaName]) {
        writeStdout(
          `⚠️  Duplicate schema "${schemaName}" in ${file} — overwriting previous definition`,
        )
      }
    }

    Object.assign(merged.components.schemas, schemas)
  }

  // ─── 4. Validate merged spec ─────────────────────────
  validateSpec(merged)

  const pathCount = Object.keys(merged.paths).length
  const schemaCount = Object.keys(merged.components.schemas).length
  writeStdout(
    `📄 OpenAPI spec merged: ${pathCount} paths, ${schemaCount} schemas from ${openApiDir}`,
  )

  return merged
}

// ─── Validation ──────────────────────────────────────────

function validateSpec(spec: OpenApiSpec): void {
  const errors: string[] = []

  // Required top-level fields
  if (!spec.openapi) {
    errors.push('Missing required field: "openapi"')
  }
  if (!spec.info) {
    errors.push('Missing required field: "info"')
  }
  if (!spec.info?.title) {
    errors.push('Missing required field: "info.title"')
  }
  if (!spec.info?.version) {
    errors.push('Missing required field: "info.version"')
  }
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push("No paths defined — at least one path is expected")
  }

  // Validate all $ref references resolve to existing schemas
  const availableSchemas = new Set(Object.keys(spec.components.schemas))
  const brokenRefs = findBrokenRefs(spec, availableSchemas)

  for (const ref of brokenRefs) {
    errors.push(`Broken $ref: "${ref.ref}" at ${ref.location}`)
  }

  if (errors.length > 0) {
    writeStderr("OpenAPI spec validation failed:")
    for (const err of errors) {
      writeStderr(` - ${err}`)
    }
    throw new Error(
      `OpenAPI spec has ${errors.length} validation error(s). Fix the issues above and restart.`,
    )
  }

  writeStdout("OpenAPI spec validation passed")
}

interface BrokenRef {
  ref: string
  location: string
}

/**
 * Recursively find all $ref pointing to #/components/schemas/X
 * and check if X exists in the available schemas set.
 */
function findBrokenRefs(
  obj: unknown,
  availableSchemas: Set<string>,
  path = "root",
): BrokenRef[] {
  const broken: BrokenRef[] = []

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      broken.push(...findBrokenRefs(obj[i], availableSchemas, `${path}[${i}]`))
    }
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const currentPath = `${path}.${key}`

      if (
        key === "$ref" &&
        typeof value === "string" &&
        value.startsWith("#/components/schemas/")
      ) {
        const schemaName = value.replace("#/components/schemas/", "")
        if (!availableSchemas.has(schemaName)) {
          broken.push({ ref: value, location: path })
        }
      } else {
        broken.push(...findBrokenRefs(value, availableSchemas, currentPath))
      }
    }
  }

  return broken
}

// ─── Helpers ─────────────────────────────────────────────

function readJson(filePath: string): Record<string, unknown> {
  const content = readFileSync(filePath, "utf-8")
  return JSON.parse(content)
}

function toNode(value: unknown): OpenApiNode {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as OpenApiNode
  }

  return {}
}

function toNodeArray(value: unknown): OpenApiNode[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is OpenApiNode => {
    return item !== null && typeof item === "object" && !Array.isArray(item)
  })
}

function listJsonFiles(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort()
  } catch {
    return []
  }
}
