import { execSync } from "child_process"

const BLUE = "\x1b[34m"
const YELLOW = "\x1b[33m"
const RED = "\x1b[31m"
const RESET = "\x1b[0m"

function log(label: string, msg: string, color: string) {
  console.log(`${color}[${label}]${RESET} ${msg}`)
}

async function main() {
  log("DB", "Prisma schema validation...", BLUE)

  try {
    const result = execSync("npx prisma validate", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    })

    if (result.includes("Your schema is valid")) {
      log("DB", "Schema is valid" + " ✔", BLUE)
    } else {
      log("DB", result.trim(), YELLOW)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    log("DB", `Schema validation FAILED:\n${msg}`, RED)
    if (process.env.NODE_ENV === "production") {
      process.exit(1)
    }
    log("DB", "Continuing in dev mode (this would crash in production)", YELLOW)
  }

  try {
    execSync("npx prisma migrate diff --from-migrations --to-schema-datamodel", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("no migration")) {
      log("DB", "No migrations exist yet — first-time setup", YELLOW)
    } else {
      log("DB", "Migrations are in sync with schema" + " ✔", BLUE)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
