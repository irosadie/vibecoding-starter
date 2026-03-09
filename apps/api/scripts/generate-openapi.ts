import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { mergeOpenApiSpec } from "../src/infrastructure/utils/mergeOpenApiSpec"

const openApiDir = resolve(process.cwd(), "docs/openapi")
const outputPath = resolve(process.cwd(), "docs/openapi.json")
const writeStdout = (message: string) => {
  process.stdout.write(`${message}\n`)
}

const writeStderr = (message: string) => {
  process.stderr.write(`${message}\n`)
}

writeStdout(`Generating OpenAPI spec from ${openApiDir}...`)

try {
  const spec = mergeOpenApiSpec(openApiDir)

  // Ensure servers are present (base.json usually has them, but good to ensure)
  if (!spec.servers || spec.servers.length === 0) {
    spec.servers = [{ url: "http://localhost:3001", description: "Local" }]
  }

  writeFileSync(outputPath, JSON.stringify(spec, null, 2))
  writeStdout(`Successfully wrote merged OpenAPI spec to ${outputPath}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  writeStderr(`Failed to generate OpenAPI spec: ${message}`)
  process.exit(1)
}
